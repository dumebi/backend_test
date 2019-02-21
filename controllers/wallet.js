const TransactionModel = require('../models/transaction');
const HttpStatus = require('../helpers/status');
const Wallet = require('../models/wallet');
const {
  checkToken
} = require('../helpers/utils');


const walletController = {

  /**
     * Get User Naira Balance
     * @description Get User Naira Balance
     * @return {number} balance
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

      const userId = req.params.id

      const wallet = await walletModel.find({ user: userId })
      console.log("wallet >> ", wallet)
      if (wallet) {
        return res.status(HttpStatus.OK).json({
          status: 'success',
          message: 'User transactions gotten successfully',
          data: wallet.balance
        })
      }
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: 'failed',
        message: 'There is no wallet associated to this user',
        data: []
      })
    } catch (error) {
      console.log('error >> ', error)
      const err = {
        http: HttpStatus.SERVER_ERROR,
        status: 'failed',
        message: 'Error getting user wallet',
        devError: error
      }
      next(err)
    }
  }

};

module.exports = UserController;
