const UserModel = require('../models/user.js');
const TransactionModel = require('../models/transaction');
const HttpStatus = require('../helpers/status');
// const EthAccount = require("../libraries/ethUser.js");
// const SIT = require("../libraries/sitHolder.js");
// const validate = require("../helpers/validation.js");
// const secure = require("../helpers/encryption.js");
const Wallet = require('../models/wallet.js');
const { getAsync, client } = require('../helpers/redis');
const {
  paramsNotValid, checkToken
} = require('../helpers/utils');


const UserController = {
  /**
    * Get all users
    * @return {object[]} users
    */
  async all(req, res, next) {
    try {
      let users = {}
      const result = await getAsync('STTP_users');
      // console.log(result)
      if (result != null && JSON.parse(result).length > 0) {
        users = JSON.parse(result);
      } else {
        users = await UserModel.find({}, { password: 0, recover_token: 0, token: 0 });
        for (let index = 0; index < users.length; index++) {
          users[users[index]._id] = users[index]
        }
        await client.set('STTP_users', JSON.stringify(users));
      }
      return res.status(HttpStatus.OK).json({ status: 'success', message: 'Users retrieved', data: users });
    } catch (error) {
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
     * Get a user
     * @return {object} user
     */
  async one(req, res, next) {
    try {
      if (paramsNotValid(req.params.id)) {
        return res.status(HttpStatus.PRECONDITION_FAILED).json({
          status: 'failed',
          message: 'some parameters were not supplied'
        })
      }
      const _id = req.params.id;
      const user = await UserModel.findById(_id);

      if (user) {
        return res.status(HttpStatus.OK).json({ status: 'success', message: 'User retrieved', data: user });
      }
      return res.status(HttpStatus.NOT_FOUND).json({ status: 'failed', message: 'User not found' });
    } catch (error) {
      console.log('error >> ', error)
      const err = {
        http: HttpStatus.BAD_REQUEST,
        status: 'failed',
        message: 'Error updating user',
        devError: error
      }
      next(err)
    }
  },

  /**
     * Get a user balance
     * @return {object} user
     */
  async bank(req, res, next) {
    try {
      const token = await checkToken(req);
      if (token.status === 'failed') {
        return res.status(token.data).json({
          status: 'failed',
          message: token.message
        })
      }
      const user = await UserModel.findById(token.data.id)

      if (user) {
        // TODO: get user balance from blockchain lib
        const user_wallet = await Wallet.findById(user.wallet)

        return res.status(HttpStatus.OK).json({
          status: 'success',
          message: 'User balance gotten successfully',
          data: user_wallet.bank
        })
      }
      return res.status(HttpStatus.NOT_FOUND).json({
        status: 'failed',
        message: 'User not found',
      })
    } catch (error) {
      console.log('error >> ', error)
      const err = {
        http: HttpStatus.BAD_REQUEST,
        status: 'failed',
        message: 'Error getting balance user',
        devError: error
      }
      next(err)
    }
  },
  
  /**
     * Get a user balance
     * @return {object} user
     */
  async balance(req, res, next) {
    try {
      const token = await checkToken(req);
      if (token.status === 'failed') {
        return res.status(token.data).json({
          status: 'failed',
          message: token.message
        })
      }
      const user = await UserModel.findById(token.data.id)

      if (user) {
        // TODO: get user balance from blockchain lib
        const user_wallet = await Wallet.findById(user.wallet)

        return res.status(HttpStatus.OK).json({
          status: 'success',
          message: 'User balance gotten successfully',
          data: { naira: user_wallet.balance, sit: 0 }
        })
      }
      return res.status(HttpStatus.NOT_FOUND).json({
        status: 'failed',
        message: 'User not found',
      })
    } catch (error) {
      console.log('error >> ', error)
      const err = {
        http: HttpStatus.BAD_REQUEST,
        status: 'failed',
        message: 'Error getting balance user',
        devError: error
      }
      next(err)
    }
  },
  
  /**
     * Get all user transaction
     * @return {object} user
     */
  async transactions(req, res, next) {
    try {
      const token = await checkToken(req);
      if (token.status === 'failed') {
        return res.status(token.data).json({
          status: 'failed',
          message: token.message
        })
      }
      const user = await UserModel.findById(token.data.id)

      if (user) {
        const transactions = TransactionModel.find({ user: user._id })
        return res.status(HttpStatus.OK).json({
          status: 'success',
          message: 'User transactions gotten successfully',
          data: transactions
        })
      }
      return res.status(HttpStatus.NOT_FOUND).json({
        status: 'failed',
        message: 'User not found',
      })
    } catch (error) {
      console.log('error >> ', error)
      const err = {
        http: HttpStatus.BAD_REQUEST,
        status: 'failed',
        message: 'Error updating user',
        devError: error
      }
      next(err)
    }
  },

  /**
     * Update a user
     * @return {object} user
     */
  async update(req, res, next) {
    try {
      const token = await checkToken(req);
      if (token.status === 'failed') {
        return res.status(token.data).json({
          status: 'failed',
          message: token.message
        })
      }
      delete req.body.password
      delete req.body.type
      delete req.body.employment
      delete req.body.group
      delete req.body.address
      delete req.body.enabled
      delete req.body.token
      delete req.body.recover_token
      delete req.body.vesting
      delete req.body.enabled
      const user = await UserModel.findByIdAndUpdate(
        token.data.id,
        { $set: req.body },
        { safe: true, multi: true, new: true }
      )
      if (user) {
        let newUser = JSON.stringify(user)
        newUser = JSON.parse(newUser)
        delete newUser.password;


        await UserController.addUserOrUpdateCache(newUser)

        return res.status(HttpStatus.OK).json({
          status: 'success',
          data: newUser
        })
      }
      return res.status(HttpStatus.NOT_FOUND).json({
        status: 'failed',
        message: 'User not found',
      })
    } catch (error) {
      console.log('error >> ', error)
      const err = {
        http: HttpStatus.BAD_REQUEST,
        status: 'failed',
        message: 'Error updating user',
        devError: error
      }
      next(err)
    }
  },

  /**
     * Change user type
     * @return {object} user
     */
  async changeType(req, res, next) {
    try {
      if (paramsNotValid(req.params.id, req.body.type)) {
        return res.status(HttpStatus.PRECONDITION_FAILED).json({
          status: 'failed',
          message: 'some parameters were not supplied'
        })
      }
      const _id = req.params.id;
      const user = await UserModel.findByIdAndUpdate(
        _id,
        { type: req.body.type },
        { safe: true, multi: true, new: true }
      )
      if (user) {
        let newUser = JSON.stringify(user)
        newUser = JSON.parse(newUser)
        delete newUser.password;


        await UserController.addUserOrUpdateCache(newUser)

        return res.status(HttpStatus.OK).json({
          status: 'success',
          data: newUser
        })
      }
      return res.status(HttpStatus.NOT_FOUND).json({
        status: 'failed',
        message: 'User not found',
      })
    } catch (error) {
      console.log('error >> ', error)
      const err = {
        http: HttpStatus.BAD_REQUEST,
        status: 'failed',
        message: 'Error updating user',
        devError: error
      }
      next(err)
    }
  },

  /**
     * Change user group
     * @return {object} user
     */
  async changeGroup(req, res, next) {
    try {
      if (paramsNotValid(req.params.id, req.body.group)) {
        return res.status(HttpStatus.PRECONDITION_FAILED).json({
          status: 'failed',
          message: 'some parameters were not supplied'
        })
      }
      const _id = req.params.id;
      const user = await UserModel.findByIdAndUpdate(
        _id,
        { group: req.body.group },
        { safe: true, multi: true, new: true }
      )

      if (user) {
        let newUser = JSON.stringify(user)
        newUser = JSON.parse(newUser)
        delete newUser.password;


        await UserController.addUserOrUpdateCache(newUser)

        return res.status(HttpStatus.OK).json({
          status: 'success',
          data: newUser
        })
      }
      return res.status(HttpStatus.NOT_FOUND).json({
        status: 'failed',
        message: 'User not found',
      })
    } catch (error) {
      console.log('error >> ', error)
      const err = {
        http: HttpStatus.BAD_REQUEST,
        status: 'failed',
        message: 'Error updating user',
        devError: error
      }
      next(err)
    }
  },

  /**
     * Change user employment status
     * @return {object} user
     */
  async changeEmployment(req, res, next) {
    try {
      if (paramsNotValid(req.params.id, req.body.employment)) {
        return res.status(HttpStatus.PRECONDITION_FAILED).json({
          status: 'failed',
          message: 'some parameters were not supplied'
        })
      }
      const _id = req.params.id;
      const user = await UserModel.findByIdAndUpdate(
        _id,
        { employment: req.body.employment },
        { safe: true, multi: true, new: true }
      )

      if (user) {
        let newUser = JSON.stringify(user)
        newUser = JSON.parse(newUser)
        delete newUser.password;


        await UserController.addUserOrUpdateCache(newUser)

        return res.status(HttpStatus.OK).json({
          status: 'success',
          data: newUser
        })
      }
      return res.status(HttpStatus.NOT_FOUND).json({
        status: 'failed',
        message: 'User not found',
      })
    } catch (error) {
      console.log('error >> ', error)
      const err = {
        http: HttpStatus.BAD_REQUEST,
        status: 'failed',
        message: 'Error updating user',
        devError: error
      }
      next(err)
    }
  },

  async addUserOrUpdateCache(user) {
    try {
      const sttpUsers = await getAsync('STTP_users');
      if (sttpUsers != null && JSON.parse(sttpUsers).length > 0) {
        const users = JSON.parse(sttpUsers);
        users[user._id] = user
        await client.set('STTP_users', JSON.stringify(users));
      }
    } catch (err) {
      console.log(err)
    }
  }
};

module.exports = UserController;
