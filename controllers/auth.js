// const jwt = require('jsonwebtoken');
const randomstring = require('randomstring');
const UserModel = require('../models/user');
const {
  paramsNotValid, createToken, config, handleError, handleSuccess, paramsNotValidChecker
} = require('../helpers/utils');
const HttpStatus = require('../helpers/status');
const { deepCopy } = require('../controllers/user');
const publisher = require('../helpers/rabbitmq');

const AuthController = {
  /**
   * Create User
   * @description Create a user
   * @param {string} username        Username
   * @param {string} password        Password
   * @return {object} user
   */
  async addUsers(req, res, next) {
    try {
      if (paramsNotValid(req.body.username, req.body.password)) {
        return handleError(res, HttpStatus.PRECONDITION_FAILED, paramsNotValidChecker(req.body.username, req.body.password), null)
      }

      const userFound = await UserModel.findOne({ username })
      if (userFound) { return handleError(res, HttpStatus.BAD_REQUEST, 'Username already exists', null) }

      const user = new UserModel({
        username: req.body.username,
        password: req.body.password
      })

      const jwtToken = createToken(user.username, user._id);
      user.token = jwtToken;

      const newUser = deepCopy(user)

      await Promise.all([user.save(), publisher.queue('ADD_OR_UPDATE_USER_PREMIER_CACHE', { newUser }), publisher.queue('SEND_USER_SIGNUP_EMAIL', { user })])
      return handleSuccess(res, HttpStatus.OK, 'User created successfully', newUser)
    } catch (error) {
      handleError(res, HttpStatus.BAD_REQUEST, 'Could not create user', error)
    }
  },

  /**
   * User Login
   * @description Login a user
   * @param {string} username
   * @param {string} password
   * @return {object} user
   */
  async login(req, res, next) {
    try {
      if (paramsNotValid(req.body.username, req.body.password)) {
        return handleError(res, HttpStatus.PRECONDITION_FAILED, paramsNotValidChecker(req.body.username, req.body.password), 'some parameters were not supplied')
      }

      const username = req.body.username;
      const password = req.body.password;
      const user = await UserModel.findOne({ username }).select('+password');
      if (!user) { return handleError(res, HttpStatus.NOT_FOUND, 'User not found here', null) }

      if (!user.validatePassword(password)) {
        return handleError(res, HttpStatus.UNAUTHORIZED, 'Wrong password', null)
      }
      
      const jwtToken = createToken(email, user._id)
      user.token = jwtToken;
      const newUser = deepCopy(user)

      await Promise.all([user.save(), publisher.queue('ADD_OR_UPDATE_USER_PREMIER_CACHE', { newUser })])
      return handleSuccess(res, HttpStatus.OK, 'User signed in', newUser)
    } catch (error) {
      return handleError(res, HttpStatus.BAD_REQUEST, 'Could not login user', error)
    }
  },

  /**
     * User Send Token
     * @description Send a forgot password token to a user
     * @param {string} username
     * @return {null}
     */
  async sendToken(req, res, next) {
    try {
      if (paramsNotValid(req.body.username)) {
        return handleError(res, HttpStatus.PRECONDITION_FAILED, paramsNotValidChecker(req.body.username), 'some parameters were not supplied')
      }
      const username = req.body.username;
      const user = await UserModel.findOne({ username });
      if (!user) { return handleError(res, HttpStatus.NOT_FOUND, 'User not found here', null) }

      const token = randomstring.generate({
        length: 5,
        charset: 'numeric'
      });
      user.recover_token = user.encrypt(token);

      await Promise.all([user.save(), publisher.queue('SEND_USER_TOKEN_EMAIL', { user, token })])
      return handleSuccess(res, HttpStatus.OK, 'Token sent', null)
    } catch (error) {
      return handleError(res, HttpStatus.BAD_REQUEST, 'Error getting user', error)
    }
  },

  /**
     * Reset User Password
     * @description Resets a user password
     * @param {string} username
     * @param {string} password
     * @param {string} token
     * @return {object} user
     */
  async resetPass(req, res, next) {
    try {
      if (paramsNotValid(req.body.username, req.body.password, req.body.token)) {
        return handleError(res, HttpStatus.PRECONDITION_FAILED, paramsNotValidChecker(req.body.username, req.body.password, req.body.token), 'some parameters were not supplied')
      }
      const username = req.body.username;
      const password = req.body.password;
      const token = req.body.token;

      const user = await UserModel.findOne({username}).select('+recover_token');
      if (!user) { return handleError(res, HttpStatus.NOT_FOUND, 'User not found here', null) }
      if (!user.validateToken(token)) { return handleError(res, HttpStatus.UNAUTHORIZED, 'Wrong Token', null)}

      const jwtToken = createToken(email, user._id, user.type);
      user.password = user.encrypt(password);
      user.token = jwtToken;

      const newUser = deepCopy(user)
      await Promise.all([user.save(), publisher.queue('ADD_OR_UPDATE_USER_PREMIER_CACHE', { newUser })])
      return handleSuccess(res, HttpStatus.OK, 'Password reset', null)
    } catch (error) {
      return handleError(res, HttpStatus.BAD_REQUEST, 'Error reseting password', error)
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
        return handleError(res, HttpStatus.PRECONDITION_FAILED, paramsNotValidChecker(req.body.password), 'some parameters were not supplied')
      }
      const userId = req.jwtUser
      const user = await UserModel.findById(userId);
      if (!user) { return handleError(res, HttpStatus.NOT_FOUND, 'User not found here', null) }
      user.password = user.encrypt(req.body.password);

      const newUser = deepCopy(user)
      await Promise.all([user.save()])

      return handleSuccess(res, HttpStatus.OK, 'Password changed successfully', newUser)
    } catch (error) {
      return handleError(res, HttpStatus.BAD_REQUEST, 'Error changing password', error)
    }
  },

};

module.exports = AuthController;
