const UserModel = require('../models/user.js');
const TransactionModel = require('../models/transaction');
const HttpStatus = require('../helpers/status');
const { getAsync, client } = require('../helpers/redis');
const {
  paramsNotValid, checkToken
} = require('../helpers/utils');


module.exports = {
  /**
    * Get all users
    * @return {object[]} users
    */
  async all(req, res, next) {
    try {
      let users = {}
      const result = await getAsync('users');
      console.log(result)
      if (result != null && JSON.parse(result).length > 0) {
        users = JSON.parse(result);
      } else {
        // TODO: Retrieve users from blockchain here
        // users = await UserModel.find({}, { password: 0 });
        // for (let index = 0; index < users.length; index++) {
        //   users[users[index]._id] = users[index]
        // }
        // await client.set('users', JSON.stringify(users));
      }
      return res.status(HttpStatus.OK).json({ status: 'success', message: 'Users retrieved', data: { set: users, total_count: users.length } });
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
  async one(req, res) {
    try {
      if (paramsNotValid(req.params.id)) {
        return res.status(HttpStatus.PRECONDITION_FAILED).json({
          status: 'failed',
          message: 'some parameters were not supplied'
        })
      }
      const _id = req.params.id;
      const user = await UserModel.findById(_id);

      // TODO: Retrieve user from blockchain here

      if (user) {
        return res.status(HttpStatus.OK).json({ status: 'success', message: 'User retrieved', data: user });
      }
      return res.status(404).json({ status: 'failed', message: 'User not found' });
    } catch (err) {
      console.log(err);
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'failed', message: 'Error getting user' });
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
      console.log(user)
      if (user) {
        // TODO: get user balance from blockchain lib

        // await this.addUserOrUpdateCache(newUser)

        return res.status(HttpStatus.OK).json({
          status: 'success',
          message: 'User balance gotten successfully',
          data: user
        })
      }
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
      console.log(user)
      if (user) {
        const transactions = TransactionModel.find({ user: user._id })
        // TODO: get user balance from blockchain lib

        // await this.addUserOrUpdateCache(newUser)

        return res.status(HttpStatus.OK).json({
          status: 'success',
          message: 'User transactions gotten successfully',
          data: transactions
        })
      }
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
}
