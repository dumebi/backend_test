const UserModel = require('../models/user.js');
// const TransactionModel = require('../models/transaction');
const HttpStatus = require('../helpers/status');
const { getAsync, client } = require('../helpers/redis');
const {
  paramsNotValid, createToken, config, handleError, handleSuccess, paramsNotValidChecker
} = require('../helpers/utils');
const publisher = require('../helpers/rabbitmq');

const UserController = {

  /**
   * Get Users.
   * @description This returns all users in the Premier League Ecosystem.
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
      return handleSuccess(res, HttpStatus.OK, 'Users retrieved', users)
    } catch (error) {
      return handleError(res, HttpStatus.BAD_REQUEST, 'Could not get users', error)
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
        return handleError(res, HttpStatus.PRECONDITION_FAILED, paramsNotValidChecker(req.params.id), null)
      }
      const _id = req.params.id;
      const user = await UserModel.findById(_id);

      if (user) {
        return handleSuccess(res, HttpStatus.OK, 'User retrieved', user)
      }
      return handleError(res, HttpStatus.NOT_FOUND,  'User not found', null)
    } catch (error) {
      return handleError(res, HttpStatus.BAD_REQUEST, 'Error getting user', error)
    }
  },

  /**
   * Update User
   * @description This returns the transactions on all wallets of a user
   * @param {string} username     Username
   * @return {object} user
   */
  async update(req, res, next) {
    try {
      const userId = req.jwtUser
      delete req.body.password
      delete req.body.type
      delete req.body.token
      delete req.body.recover_token
      const user = await UserModel.findByIdAndUpdate(
        userId,
        { $set: req.body },
        { safe: true, multi: true, new: true }
      )
      if (user) {
        const newUser = UserController.deepCopy(user)
        await Promise.all([publisher.queue('ADD_OR_UPDATE_USER_PREMIER_CACHE', { newUser })])
        return handleSuccess(res, HttpStatus.OK, 'User has been updated', newUser)
      }
      return handleError(res, HttpStatus.NOT_FOUND, 'User not found', null)
    } catch (error) {
      return handleError(res, HttpStatus.BAD_REQUEST, 'Error updating user', error)
    }
  },

  /**
   * Redis Cache User
   * @description Add or Update redis user caching
   * @param user User object
   */
  async addUserOrUpdateCache(user) {
    try {
      // console.log(user)
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
   * @description copy mongo object into a user object
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
