const TransactionModel = require('../models/transaction');
const HttpStatus = require('../helpers/status');
const {
  checkToken
} = require('../helpers/utils');


const TransactionController = {
  /**
    * Get transactions
    * @description Get all transactions
    * @param {string} group
    * @param {string} to
    * @param {string} from
    * @param {string} status
    * @return {object[]} transactions
    */
  async all(req, res, next) {
    try {
      const {
        type, to, from, status, wallet
      } = req.query

      const query = { }
      if (status) query.status = TransactionModel.Status[status.toUpperCase()]
      if (type) query.type = TransactionModel.Type[type.toUpperCase()]
      if (wallet) query.wallet = TransactionModel.Wallet[wallet.toUpperCase()]

      if (from && to == null) query.createdAt = { $gte: from }
      if (to && from == null) query.createdAt = { $lt: to }
      if (from && to) query.createdAt = { $lt: to, $gte: from }

      const transactions = await TransactionModel.find(query).sort({ createdAt: -1 })
      console.log(transactions)
      return res.status(HttpStatus.OK).json({ status: 'success', message: 'Transactions retrieved', data: transactions });
    } catch (error) {
      const err = {
        http: HttpStatus.BAD_REQUEST,
        status: 'failed',
        message: 'Could not get transactions',
        devError: error
      }
      next(err)
    }
  },

  /**
     * Get User Transactions
     * @description Get all user transaction
     * @return {object} user
     */
  async user(req, res, next) {
    try {
      const userId = req.jwtUser
      const transactions = await TransactionModel.find({ user: userId })
      if (transactions) {
        return res.status(HttpStatus.OK).json({
          status: 'success',
          message: 'User transactions gotten successfully',
          data: transactions
        })
      }
      return res.status(HttpStatus.NOT_FOUND).json({
        status: 'success',
        message: 'User transactions gotten successfully',
        data: []
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
  }
};

module.exports = TransactionController;
