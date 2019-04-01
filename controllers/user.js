const UserModel = require('../models/user.js');
const TransactionModel = require('../models/transaction');
const HttpStatus = require('../helpers/status');
const { getAsync, client } = require('../helpers/redis');
const {
  paramsNotValid, checkToken
} = require('../helpers/utils');
const publisher = require('../helpers/rabbitmq');

const UserController = {

  /**
   * Get Users.
   * @description This returns all users in the STTP Ecosystem.
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
        message: 'Could not get users',
        devError: error
      }
      next(err)
    }
  },

  /**
     * Get User
     * @description This gets a user from the STTP Ecosystem based off ID
     * @param   {string}  id  User's ID
     * @return  {object}  user
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
        message: 'Error getting user',
        devError: error
      }
      next(err)
    }
  },

  /**
   * Update User
   * @description This returns the transactions on all wallets of a user
   * @param {string} fname        First name
   * @param {string} mname        Middle name
   * @param {string} lname        Last name
   * @param {string} phone        Phone number
   * @param {string} sex          Sex
   * @param {string} dob          Date of birth
   * @param {string} state        State of residence
   * @param {string} city         City of residence
   * @param {string} country      Country of residence
   * @param {string} beneficiary  Next of kin
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
        const newUser = UserController.deepCopy(user)
        await Promise.all([publisher.queue('ADD_OR_UPDATE_USER_STTP_CACHE', { newUser })])

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
     * Get User Bank
     * @description This returns the bank details of a user
     * @return {object} bank
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
      const user = await UserModel.findById(token.data.id).select('+privateKey').populate('wallet')

      if (user) {
        console.log(user)
        return res.status(HttpStatus.OK).json({
          status: 'success',
          message: 'User bank gotten successfully',
          data: user.wallet.bank
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
        message: 'Error getting user bank details',
        devError: error
      }
      next(err)
    }
  },

  /**
     * Get User Balance
     * @description This returns the balance from all wallets of a user
     * @return {object} balance
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
      const user = await UserModel.findById(token.data.id).populate('wallet')

      if (user) {
        // TODO: get user balance from blockchain lib
        const balance = await req.SIT.getBalance(user.address);
        console.log('bal' + balance)
        
        return res.status(HttpStatus.OK).json({
          status: 'success',
          message: 'User balance gotten successfully',
          data: { naira: user.wallet.balance, sit: balance }
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
        message: 'Error getting user balance',
        devError: error
      }
      next(err)
    }
  },

  /**
     * Get User Transactions
     * @description This returns the transactions on all wallets of a user
     * @return {object} balance
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
        message: 'Error getting user transactions',
        devError: error
      }
      next(err)
    }
  },

  /**
     * Change User Type
     * @description This updates a user's type and permissions
     * @param {string}  id    User's ID
     * @param {string}  type  User type
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
        const newUser = UserController.deepCopy(user)
        await Promise.all([publisher.queue('ADD_OR_UPDATE_USER_STTP_CACHE', { newUser })])

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
        message: 'Error updating user type',
        devError: error
      }
      next(err)
    }
  },

  /**
     * Change User Group
     * @description This updates a user's group and Access level
     * @param {string}  id     User's ID
     * @param {string}  group  User group
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
        const newUser = UserController.deepCopy(user)
        await Promise.all([publisher.queue('ADD_OR_UPDATE_USER_STTP_CACHE', { newUser })])

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
        message: 'Error updating user group',
        devError: error
      }
      next(err)
    }
  },

  /**
     * Change User Employment Status
     * @description This updates a user's employment status
     * @param {string}  id          User's ID
     * @param {string}  employment  User employment status
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
        const newUser = UserController.deepCopy(user)
        await Promise.all([publisher.queue('ADD_OR_UPDATE_USER_STTP_CACHE', { newUser })])

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
        message: 'Error updating user employment status',
        devError: error
      }
      next(err)
    }
  },

  /**
   * Redis Cache User
   * @description Add or Update redis user caching
   * @param user User object
   */
  async addUserOrUpdateCache(user) {
    try {
      console.log(user)
      const sttpUsers = await getAsync('STTP_users');
      if (sttpUsers != null && JSON.parse(sttpUsers).length > 0) {
        const users = JSON.parse(sttpUsers);
        users[user._id] = user
        await client.set('STTP_users', JSON.stringify(users));
      }
    } catch (err) {
      console.log(err)
    }
  },

  /**
   * Deep Copy
   * @description copy mongo object into  a user object
   * @param user User object
   */
  deepCopy(user) {
    try {
      let newUser = JSON.stringify(user)
      newUser = JSON.parse(newUser)
      delete newUser.password;
      delete newUser.mnemonic;
      delete newUser.privateKey;
      delete newUser.publicKey;

      return newUser;
    } catch (err) {
      console.log(err)
    }
  }
};

module.exports = UserController;
