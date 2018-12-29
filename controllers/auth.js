const jwt = require('jsonwebtoken');
const randomstring = require('randomstring');
const UserModel = require('../models/user');
const { sendUserSignupEmail, sendUserToken } = require('../helpers/emails');
const {
  paramsNotValid, sendMail, config, checkToken
} = require('../helpers/utils');
const Constants = require('../helpers/constants');
const { getAsync, client } = require('../helpers/redis');

const UserController = {
  /**
     * Register a user
     * @param {string} fname
     * @param {string} lname
     * @param {string} email
     * @param {string} phone
     * @param {int} bvn
     * @param {string} sex
     * @param {string} dob
     * @param {string} password
     *
     * @return {object} user
     */
  async register(req, res) {
    // if (!req.body.fname || !req.body.lname || !req.body.email || !req.body.phone || !req.body.bvn || !req.body.sex || !req.body.dob || !req.body.password) { return res.status(422).json({ status: 'failed', message: 'Some parameters were not supplied' }); }
    // if (req.body.fname.length === 0 || req.body.lname.length === 0 || req.body.email.length === 0 || req.body.phone.length === 0 || req.body.bvn.length === 0 || req.body.sex.length === 0 || req.body.dob.length === 0 || req.body.password.length === 0) { return res.status(422).json({ status: 'failed', message: 'Some parameters are empty' }); }
    try {
      if (paramsNotValid(req.body.fname, req.body.lname, req.body.email, req.body.sex, req.body.dob, req.body.password)) {
        return res.status(Constants.PRECONDITION_FAILED).json({
          status: 'failed',
          message: 'some parameters were not supplied'
        })
      }
      const NewUser = new UserModel();
      const details = {
        fname: req.body.fname,
        lname: req.body.lname,
        email: req.body.email,
        // phone: req.body.phone,
        bvn: req.body.bvn,
        sex: req.body.sex,
        dob: req.body.dob,
        password: NewUser.encrypt(req.body.password),
      };

      const checkUser = await UserModel.findOne({ email: req.body.email });
      if (checkUser != null) { return res.status(Constants.BAD_REQUEST).json({ status: 'failed', message: 'This email is already registered with us.' }); }

      const user = await UserModel.create(details);

      const jwtToken = jwt.sign({ email: req.body.email, id: user._id }, config.jwt, { expiresIn: 60 * 60 * 24 * 31 });
      user.token = jwtToken;
      await user.save();

      const userSignupEmailBody = sendUserSignupEmail(user)
      const mailparams = {
        email: user.email,
        body: userSignupEmailBody,
        subject: 'Welcome to AltMall'
      };
      sendMail(mailparams, (error, result) => {
        console.log(error)
        console.log(result)
      });

      let newUser = JSON.stringify(user)
      newUser = JSON.parse(newUser)
      delete newUser.password;

      await this.addUserOrUpdateCache(newUser)

      return res.status(Constants.OK).json({ status: 'success', message: 'User has been registered', data: newUser });
    } catch (err) {
      console.log(err);
      return res.status(Constants.BAD_REQUEST).json({ status: 'failed', message: 'error occured' });
    }
  },

  /**
     * Login a user
     * @param {string} email
     * @param {string} password
     *
     * @return {object} user
     */
  async login(req, res) {
    try {
      if (paramsNotValid(req.body.email, req.body.password)) {
        return res.status(Constants.PRECONDITION_FAILED).json({
          status: 'failed',
          message: "the user's id was not supplied"
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
      const jwtToken = jwt.sign({ email: req.body.email, id: user._id }, config.jwt, { expiresIn: 60 * 60 * 24 * 31 });
      user.token = jwtToken;
      await user.save();
      // Deep copy
      let newUser = JSON.stringify(user)
      newUser = JSON.parse(newUser)
      delete newUser.password;

      await this.addUserOrUpdateCache(newUser)

      return res.status(Constants.OK).json({ status: 'success', message: 'User signed in', data: newUser });
    } catch (err) {
      console.log('user error')
      console.log(err)
      return res.status(Constants.BAD_REQUEST).json({ status: 'failed', message: 'Error getting user' });
    }
  },

  /**
     * Send token to a user
     * @param {string} email
     *
     * @return {null}
     */
  async sendToken(req, res) {
    try {
      if (paramsNotValid(req.body.email)) {
        return res.status(Constants.PRECONDITION_FAILED).json({
          status: 'failed',
          message: "the user's id was not supplied"
        })
      }
      const email = req.body.email;
      const user = await UserModel.findOne({ email });
      if (!user) { return res.status(Constants.BAD_REQUEST).json({ status: 'failed', message: 'User not found here' }); }

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
      return res.status(Constants.OK).json({ status: 'success', message: 'Token sent', data: { token } });
    } catch (err) {
      return res.status(Constants.BAD_REQUEST).json({ status: 'failed', message: 'Error getting user' });
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
  async resetPass(req, res) {
    try {
      if (paramsNotValid(req.body.email)) {
        return res.status(Constants.PRECONDITION_FAILED).json({
          status: 'failed',
          message: "the user's id was not supplied"
        })
      }
      const email = req.body.email;
      const password = req.body.password;
      const token = req.body.token;

      const user = await UserModel.findOne({ email });
      if (!user) { return res.status(Constants.BAD_REQUEST).json({ status: 'failed', message: 'User not found here' }); }
      if (!user.validateToken(token)) {
        return res.json({ result: 'error', message: 'Wrong Token' });
      }
      const jwtToken = jwt.sign({ key: req.body.email }, config.jwt, { expiresIn: 60 * 60 * 24 * 31 });
      user.password = user.encrypt(password);
      user.token = jwtToken;

      // Deep copy
      await user.save()
      let newUser = JSON.stringify(user)
      newUser = JSON.parse(newUser)
      delete newUser.password;

      await this.addUserOrUpdateCache(newUser)

      return res.status(Constants.OK).json({ status: 'success', message: 'Password reset', data: newUser });
    } catch (err) {
      console.log(err)
      return res.status(Constants.BAD_REQUEST).json({ status: 'failed', message: 'Error getting user' });
    }
  },

  /**
    * Get all users
    * @return {object[]} users
    */
  async all(req, res) {
    try {
      let users = {}
      const result = await getAsync('users');
      console.log(result)
      if (result != null && JSON.parse(result).length > 0) {
        users = JSON.parse(result);
      } else {
        users = await UserModel.find({}, { password: 0 });
        for (let index = 0; index < users.length; index++) {
          users[users[index]._id] = users[index]
        }
        await client.set('users', JSON.stringify(users));
      }
      return res.status(Constants.OK).json({ status: 'success', message: 'Users retrieved', data: { set: users, total_count: users.length } });
    } catch (err) {
      console.log(err)
      return res.status(Constants.BAD_REQUEST).json({ status: 'failed', message: 'Error getting users' });
    }
  },

  /**
     * Get a user
     * @return {object} user
     */
  async one(req, res) {
    try {
      if (paramsNotValid(req.params.id)) {
        return res.status(Constants.PRECONDITION_FAILED).json({
          status: 'failed',
          message: "the user's id was not supplied"
        })
      }
      const _id = req.params.id;
      const user = await UserModel.findById(_id);
      if (user.email) {
        return res.status(Constants.OK).json({ status: 'success', message: 'User retrieved', data: user });
      }
      return res.status(404).json({ status: 'failed', message: 'User not found' });
    } catch (err) {
      console.log(err);
      return res.status(Constants.BAD_REQUEST).json({ status: 'failed', message: 'Error getting user' });
    }
  },

  /**
     * Get a user's token
     * @return {object} user
     */
  async token(req, res) {
    try {
      const token = await checkToken(req);
      const user = await UserModel.findById(token.data.id);
      if (user.email) {
        return res.status(Constants.OK).json({ status: 'success', message: 'User retrieved', data: user });
      }
      return res.status(404).json({ status: 'failed', message: 'User not found' });
    } catch (err) {
      console.log(err);
      return res.status(Constants.BAD_REQUEST).json({ status: 'failed', message: 'Error getting user' });
    }
  },

  /**
     * Update a user
     * @return {object} user
     */
  async update(req, res) {
    try {
      const token = await checkToken(req);
      if (token.status === 'failed') {
        return res.status(token.data).json({
          status: 'failed',
          message: token.message
        })
      }
      delete req.body.password
      const user = await UserModel.findByIdAndUpdate(
        token.data.id,
        { $set: req.body },
        { safe: true, multi: true, new: true }
      )
      console.log(user)
      if (user) {
        let newUser = JSON.stringify(user)
        newUser = JSON.parse(newUser)
        delete newUser.password;

        await this.addUserOrUpdateCache(newUser)

        return res.status(Constants.OK).json({
          status: 'success',
          data: newUser
        })
      }
    } catch (error) {
      console.log(error)
      return res.status(Constants.BAD_REQUEST).json({
        status: 'failed',
        message: error
      })
    }
  },

  async addUserOrUpdateCache(user) {
    try {
      const sttpUsers = await getAsync('users');
      if (sttpUsers != null && JSON.parse(sttpUsers).length > 0) {
        const users = JSON.parse(sttpUsers);
        users[user._id] = user
        await client.set('users', JSON.stringify(users));
      }
    } catch (err) {
      console.log(err)
    }
  }
};

module.exports = UserController;
