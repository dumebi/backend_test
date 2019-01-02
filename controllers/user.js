const UserModel = require('../models/user.js');
const HttpStatus = require('../helpers/status');
const { getAsync, client } = require('../helpers/redis');
const {
  paramsNotValid, sendMail, config, checkToken
} = require('../helpers/utils');


module.exports = {
  /**
    * Get all users
    * @return {object[]} users
    */
  async allUsers(req, res, next) {
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
}
