// const jwt = require('jsonwebtoken');
const randomstring = require('randomstring');
const EthAccount = require('../libraries/ethUser.js');
// const validate = require('../helpers/validation.js');
const secure = require('../helpers/encryption.js');
const UserModel = require('../models/user');
const {
  paramsNotValid, createToken, config, checkToken
} = require('../helpers/utils');
const HttpStatus = require('../helpers/status');
const { deepCopy } = require('../controllers/user');
const publisher = require('../helpers/rabbitmq');

const AuthController = {
  /**
   * Get User Types
   * @description Get different user types
   * @return {object} user types
   */
  async types(req, res, next) {
    try {
      return res.status(HttpStatus.OK).json({ status: 'success', message: 'User Types', data: Object.values(UserModel.UserType) });
    } catch (error) {
      console.log('error >> ', error)
      const err = {
        http: HttpStatus.BAD_REQUEST,
        status: 'failed',
        message: 'Error getting user',
        devError: error
      }
      next(err)
    }
  },

  /**
   * Get User Groups
   * @description Get different user groups
   * @return {object} user groups
   */
  async groups(req, res, next) {
    try {
      return res.status(HttpStatus.OK).json({ status: 'success', message: 'User Groups', data: Object.values(UserModel.UserGroup) });
    } catch (error) {
      console.log('error >> ', error)
      const err = {
        http: HttpStatus.BAD_REQUEST,
        status: 'failed',
        message: 'Error getting user',
        devError: error
      }
      next(err)
    }
  },

  /**
   * Get User Employment Status
   * @description Get different user employment status
   * @return {object} user employment status
   */
  async employment(req, res, next) {
    try {
      return res.status(HttpStatus.OK).json({ status: 'success', message: 'User Employment statuses', data: Object.values(UserModel.EmploymentStatus) });
    } catch (error) {
      console.log('error >> ', error)
      const err = {
        http: HttpStatus.BAD_REQUEST,
        status: 'failed',
        message: 'Error getting user',
        devError: error
      }
      next(err)
    }
  },

  /**
   * Create User
   * @description Create a user
   * @param {string} fname        First name
   * @param {string} mname        Middle name
   * @param {string} lname        Last name
   * @param {string} phone        Phone number
   * @param {string} sex          Sex
   * @param {string} dob          Date of birth
   * @param {string} password     Password
   * @param {string} vesting      Vesting status
   * @param {string} type         User type
   * @param {string} employment   User employment
   * @param {string} group        User group
   * @param {string} account        User group
   * @param {string} staffId      User staff ID
   * @return {object} user
   */
  async addUsers(req, res, next) {
    try {
      if (paramsNotValid(req.body.fname, req.body.lname, req.body.email, req.body.phone,
        req.body.sex, req.body.dob, req.body.password, req.body.vesting,
        req.body.type, req.body.employment, req.body.group, req.body.account, req.body.staffId)) {
        return res.status(HttpStatus.PRECONDITION_FAILED).json({
          status: 'failed',
          message: 'some parameters were not supplied'
        })
      }
      // const validReq = await validate.users(req.body)

      const userMnemonic = await EthAccount.newMnemonic()
      const mnemonicSeed = await EthAccount.generateSeed(userMnemonic)
      const Ethkeys = await EthAccount.generateKeys(mnemonicSeed)

      // console.log("Ethkeys.childPrivKey >> ", Ethkeys.childPrivKey)

      const user = new UserModel({
        fname: req.body.fname,
        lname: req.body.lname,
        email: req.body.email,
        phone: req.body.phone,
        sex: req.body.sex,
        dob: req.body.dob,
        type: req.body.type,
        employment: req.body.employment,
        group: req.body.group,
        staffId: req.body.staffId,
        beneficiary: req.body.beneficiary,
        activated: false,
        enabled: true,
        password: req.body.password,
        vesting: req.body.vesting
      })

      const [mnemonic, privateKey, publicKey] = await Promise.all([secure.encrypt(userMnemonic), secure.encrypt(Ethkeys.childPrivKey), secure.encrypt(Ethkeys.childPubKey)])
      user.mnemonic = mnemonic
      user.privateKey = privateKey
      user.publicKey = publicKey
      user.address = Ethkeys.childAddress
      const jwtToken = createToken(user.email, user._id, user.type);
      user.token = jwtToken;

      const newUser = deepCopy(user)

      const link = `${config.host}/users/activate/${Buffer.from(user.email).toString('base64')}`

      await Promise.all([user.save(), publisher.queue('ADD_OR_UPDATE_USER_STTP_CACHE', { newUser }), publisher.queue('SEND_USER_STTP_SIGNUP_EMAIL', { user, link })])
      return res.status(HttpStatus.OK).json({ status: 'success', message: 'User created successfully', data: newUser });
    } catch (error) {
      console.log('error >> ', error)
      const err = {
        http: HttpStatus.BAD_REQUEST,
        status: 'failed',
        message: 'Could not create user',
        devError: error
      }
      next(err)
    }
  },

  /**
   * User Login
   * @description Login a user
   * @param {string} email
   * @param {string} password
   * @return {object} user
   */
  async login(req, res, next) {
    try {
      console.log('1')
      if (paramsNotValid(req.body.email, req.body.password)) {
        return res.status(HttpStatus.PRECONDITION_FAILED).json({
          status: 'failed',
          message: 'some parameters were not supplied'
        })
      }
      
      console.log('2')
      const email = req.body.email;
      const password = req.body.password;
      const user = await UserModel.findOne({ email }, { mnemonic: 0, publicKey: 0, privateKey: 0 }).select('+password').populate('wallet');
      if (!user) { return res.status(404).json({ status: 'failed', message: 'User not found here' }); }
      
      console.log('3 >> ', user)
      if (!user.validatePassword(password)) {
        return res.status(401).json({ status: 'failed', message: 'Wrong password' });
      }
      if (user.activated === false) {
        return res.status(401).json({ status: 'failed', message: 'User account has been deactivated' });
      }
      const jwtToken = createToken(email, user._id, user.type);
      user.token = jwtToken;
      const newUser = deepCopy(user)

      await Promise.all([user.save(), publisher.queue('ADD_OR_UPDATE_USER_STTP_CACHE', { newUser })])
      return res.status(HttpStatus.OK).json({ status: 'success', message: 'User signed in', data: newUser });
    } catch (error) {
      console.log('error >> ', error)
      const err = {
        http: HttpStatus.BAD_REQUEST,
        status: 'failed',
        message: 'Could not login user',
        devError: error
      }
      next(err)
    }
  },

  /**
     * Activate User
     * @description Activate a user's account
     * @param {string} id
     * @return {null}
     */
  async activate(req, res, next) {
    try {
      if (paramsNotValid(req.params.id)) {
        return res.status(HttpStatus.PRECONDITION_FAILED).json({
          status: 'failed',
          message: 'some parameters were not supplied'
        })
      }
      // const email = Buffer.from(req.params.id, 'base64').toString()
      const user = await UserModel.findById(req.params.id, { mnemonic: 0, publicKey: 0, privateKey: 0 });
      if (!user) { return res.status(HttpStatus.BAD_REQUEST).json({ status: 'failed', message: 'User not found here' }); }

      user.activated = true;
      const newUser = deepCopy(user)
      await Promise.all([user.save(), publisher.queue('ADD_OR_UPDATE_USER_STTP_CACHE', { newUser })])
      return res.status(HttpStatus.OK).json({ status: 'success', message: 'User activated' });
    } catch (error) {
      console.log('error >> ', error)
      const err = {
        http: HttpStatus.BAD_REQUEST,
        status: 'failed',
        message: 'Error activating user',
        devError: error
      }
      next(err)
    }
  },

  /**
     * Deactivate User
     * @description Deactivate a user's account
     * @param {string} id
     * @return {null}
     */
  async deactivate(req, res, next) {
    try {
      if (paramsNotValid(req.params.id)) {
        return res.status(HttpStatus.PRECONDITION_FAILED).json({
          status: 'failed',
          message: 'some parameters were not supplied'
        })
      }
      const user = await UserModel.findById(req.params.id, { mnemonic: 0, publicKey: 0, privateKey: 0 });
      if (!user) { return res.status(HttpStatus.BAD_REQUEST).json({ status: 'failed', message: 'User not found here' }); }

      user.activated = false;
      const newUser = deepCopy(user)
      await Promise.all([user.save(), publisher.queue('ADD_OR_UPDATE_USER_STTP_CACHE', { newUser })])
      return res.status(HttpStatus.OK).json({ status: 'success', message: 'User deactivated' });
    } catch (error) {
      console.log('error >> ', error)
      const err = {
        http: HttpStatus.BAD_REQUEST,
        status: 'failed',
        message: 'Error activating user',
        devError: error
      }
      next(err)
    }
  },

  /**
     * User Send Token
     * @description Send a forgot password token to a user
     * @param {string} email
     * @return {null}
     */
  async sendToken(req, res, next) {
    try {
      if (paramsNotValid(req.body.email)) {
        return res.status(HttpStatus.PRECONDITION_FAILED).json({
          status: 'failed',
          message: 'some parameters were not supplied'
        })
      }
      const email = req.body.email;
      const user = await UserModel.findOne({ email });
      if (!user) { return res.status(HttpStatus.BAD_REQUEST).json({ status: 'failed', message: 'User not found here' }); }

      const token = randomstring.generate({
        length: 5,
        charset: 'numeric'
      });
      user.recover_token = user.encrypt(token);

      await Promise.all([user.save(), publisher.queue('SEND_USER_STTP_TOKEN_EMAIL', { user, token })])
      return res.status(HttpStatus.OK).json({ status: 'success', message: 'Token sent', data: token });
    } catch (error) {
      console.log('error >> ', error)
      const err = {
        http: HttpStatus.BAD_REQUEST,
        status: 'failed',
        message: 'Error getting user',
        devError: error
      }
      next(err)
    }
  },

  /**
     * Reset User Password
     * @description Resets a user password
     * @param {string} email
     * @param {string} password
     * @param {string} token
     * @return {object} user
     */
  async resetPass(req, res, next) {
    try {
      if (paramsNotValid(req.body.email, req.body.password, req.body.token)) {
        return res.status(HttpStatus.PRECONDITION_FAILED).json({
          status: 'failed',
          message: 'some parameters were not supplied'
        })
      }
      const email = req.body.email;
      const password = req.body.password;
      const token = req.body.token;

      const user = await UserModel.findOne({
        email: req.body.email
      }, { mnemonic: 0, publicKey: 0, privateKey: 0 }).select('+recover_token');
      if (!user) { return res.status(HttpStatus.BAD_REQUEST).json({ status: 'failed', message: 'User not found here' }); }
      if (!user.validateToken(token)) {
        return res.json({ result: 'error', message: 'Wrong Token' })
      }

      const jwtToken = createToken(email, user._id, user.type);
      user.password = user.encrypt(password);
      user.token = jwtToken;

      const newUser = deepCopy(user)
      await Promise.all([user.save(), publisher.queue('ADD_OR_UPDATE_USER_STTP_CACHE', { newUser })])
      return res.status(HttpStatus.OK).json({ status: 'success', message: 'Password reset', data: newUser });
    } catch (error) {
      console.log('error >> ', error)
      const err = {
        http: HttpStatus.BAD_REQUEST,
        status: 'failed',
        message: 'Error reseting password',
        devError: error
      }
      next(err)
    }
  },

  /**
     * Change User Password
     * @description Change a user's profile password
     * @return {object} user
     */
  async changePass(req, res, next) {
    try {
      if (paramsNotValid(req.body.password)) {
        return res.status(HttpStatus.PRECONDITION_FAILED).json({
          status: 'failed',
          message: 'some parameters were not supplied'
        })
      }
      const token = await checkToken(req);
      if (token.status === 'failed') {
        return res.status(token.data).json({
          status: 'failed',
          message: token.message
        })
      }
      const user = await UserModel.findById(token.data.id);
      if (!user) { return res.status(HttpStatus.BAD_REQUEST).json({ status: 'failed', message: 'User not found here' }); }
      user.password = user.encrypt(req.body.password);

      const newUser = deepCopy(user)
      await Promise.all([user.save()])

      return res.status(HttpStatus.OK).json({
        status: 'success',
        message: 'Password changed successfully',
        data: newUser
      })
    } catch (error) {
      console.log('error >> ', error)
      const err = {
        http: HttpStatus.BAD_REQUEST,
        status: 'failed',
        message: 'Error getting user',
        devError: error
      }
      next(err)
    }
  },

};

module.exports = AuthController;
