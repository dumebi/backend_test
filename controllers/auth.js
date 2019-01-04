// const jwt = require('jsonwebtoken');
const randomstring = require('randomstring');
const EthAccount = require('../libraries/ethUser.js');
const validate = require('../helpers/validation.js');
const secure = require('../helpers/encryption.js');
const UserModel = require('../models/user');
const { sendUserToken } = require('../helpers/emails');
const {
  paramsNotValid, sendMail, checkToken, createToken
} = require('../helpers/utils');
const HttpStatus = require('../helpers/status');
const { getAsync, client } = require('../helpers/redis');

const UserController = {
  /**
   * Create a user
   * @param {string} email
   * @param {string} password
   *
   * @return {object} user
   */
  async addUsers(req, res, next) {
    try {
      const validReq = await validate.users(req.body)

      const userMnemonic = await EthAccount.newMnemonic()
      const mnemonicSeed = await EthAccount.generateSeed(userMnemonic)
      const Ethkeys = await EthAccount.generateKeys(mnemonicSeed)

      // console.log("Ethkeys.childPrivKey >> ", Ethkeys.childPrivKey)

      const user = new UserModel({
        userType: validReq.userType,
        employmentStatus: validReq.employmentStatus,
        userGroup: validReq.userGroup,
        staffId: validReq.staffId,
        email: validReq.email,
        isVesting: validReq.isVesting,
        // lienPeriod: validReq.lienPeriod,
        dividendAcct: validReq.dividendAcct,
        beneficiary: validReq.beneficiary,
        password: '12345',
        workflow: validReq.workflow,
        status: validReq.status
      })

      const [mnemonic, privateKey, publicKey] = Promise.all([secure.encrypt(userMnemonic), secure.encrypt(Ethkeys.childPrivKey), secure.encrypt(Ethkeys.childPubKey)])
      user.mnemonic = mnemonic
      user.privateKey = privateKey
      user.publicKey = publicKey
      user.address = Ethkeys.childAddress

      const savedUser = await user.save()
      const newUser = JSON.parse(savedUser)
      delete newUser.password;

      // TODO: Add user to blockchain here

      // await this.addUserOrUpdateCache(newUser)

      return res.status(HttpStatus.OK).json({ status: 'success', message: 'User created successfully', data: savedUser });
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
   * Login a user
   * @param {string} email
   * @param {string} password
   *
   * @return {object} user
   */
  async login(req, res, next) {
    try {
      if (paramsNotValid(req.body.email, req.body.password)) {
        return res.status(HttpStatus.PRECONDITION_FAILED).json({
          status: 'failed',
          message: 'some parameters were not supplied'
        })
      }
      const email = req.body.email;
      const password = req.body.password;
      const user = await UserModel.findOne({ email }).select('+password');
      // console.log(user)
      if (!user) { return res.status(404).json({ status: 'failed', message: 'User not found here' }); }
      if (!user.validatePassword(password)) {
        return res.status(401).json({ status: 'failed', message: 'Wrong password' });
      }
      const jwtToken = createToken(email, user._id);
      user.token = jwtToken;
      await user.save();
      // Deep copy
      let newUser = JSON.stringify(user)
      newUser = JSON.parse(newUser)
      delete newUser.password;

      // await this.addUserOrUpdateCache(newUser)

      return res.status(HttpStatus.OK).json({ status: 'success', message: 'User signed in', data: newUser });
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
     * Send token to a user
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
      await user.save();

      const userTokenMailBody = sendUserToken(user, token)
      const mailparams = {
        email: user.email,
        body: userTokenMailBody,
        subject: 'Recover your password'
      };
      sendMail(mailparams, (error, result) => {
        console.log(error)
        console.log(result)
      });
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
     * reset user password
     * @param {string} email
     * @param {string} password
     * @param {string} token
     *
     * @return {object} user
     */
  async resetPass(req, res, next) {
    try {
      if (paramsNotValid(req.body.email)) {
        return res.status(HttpStatus.PRECONDITION_FAILED).json({
          status: 'failed',
          message: 'some parameters were not supplied'
        })
      }
      const email = req.body.email;
      const password = req.body.password;
      const token = req.body.token;

      const user = await UserModel.findOne({ email });
      if (!user) { return res.status(HttpStatus.BAD_REQUEST).json({ status: 'failed', message: 'User not found here' }); }
      if (!user.validateToken(token)) {
        return res.json({ result: 'error', message: 'Wrong Token' });
      }
      const jwtToken = createToken(email, user._id);
      user.password = user.encrypt(password);
      user.token = jwtToken;

      // Deep copy
      await user.save()
      let newUser = JSON.stringify(user)
      newUser = JSON.parse(newUser)
      delete newUser.password;

      await this.addUserOrUpdateCache(newUser)

      return res.status(HttpStatus.OK).json({ status: 'success', message: 'Password reset', data: newUser });
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

  // /**
  //    * Get a user by token
  //    * @return {object} user
  //    */
  // async token(req, res, next) {
  //   try {
  //     const token = await checkToken(req);
  //     const user = await UserModel.findById(token.data.id);
  //     if (user.email) {
  //       return res.status(HttpStatus.OK).json({ status: 'success', message: 'User retrieved', data: user.token });
  //     }
  //     return res.status(404).json({ status: 'failed', message: 'User not found' });
  //   } catch (error) {
  //     console.log('error >> ', error)
  //     const err = {
  //       http: HttpStatus.BAD_REQUEST,
  //       status: 'failed',
  //       message: 'Error getting user',
  //       devError: error
  //     }
  //     next(err)
  //   }
  // }

  /**
     * Send token to a user
     * @param {string} email
     * @return {null}
     */
  async token(req, res, next) {
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
      await user.save();

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

};

module.exports = UserController;
