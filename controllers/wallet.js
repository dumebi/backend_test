const TransactionModel = require('../models/transaction');
const HttpStatus = require('../helpers/status');
const WalletModel = require('../models/wallet');
const User = require('../models/user');
const {verifyAccount, checkBalance, transfer} = require('../helpers/ibs');
const validate = require("../helpers/validation.js");
const crypto = require('crypto');
const {
  config
} = require('../helpers/utils');

// Add second


const walletController = {
  /**
     * Add Bank Account
     * @description Allow users add a new bank account to their list of accounts
     * @return {object} wallet
     */
    async getWallet(req, res, next) {
      try {
        
        const walletId = req.params.id

        const wallet = await WalletModel.findById(walletId).populate("transactions") // leave out the populate
        if (!wallet) {
          return res.status(HttpStatus.BAD_REQUEST).json({
            status: 'failed',
            message: 'Invalid wallet',
            data: []
          })
        }
  
        return res.status(HttpStatus.OK).json({
          status: 'success',
          message: 'Wallet fetched successfully',
          data: {wallet}
        })
  
      } catch (error) {
        console.log('error 1>> ', error)
        const err = {
          http: HttpStatus.SERVER_ERROR,
          status: 'failed',
          message: 'Error fetching user wallet',
          devError: error
        }
        next(err)
      }
    },

  /**
     * Add Bank Account
     * @description Allow users add a new bank account to their list of accounts
     * @return {object} wallet
     */
  async addAccount(req, res, next) {
    try {

      // Validate Request
      await  validate.wallet(req.body)

      // Request Params
      const userId = req.jwtUser
      const walletId = req.params.id
      const userWallet = req.body.account

      // Get Users
      const user = await User.findById(userId)
      if (!user || user.wallet != walletId) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: 'failed',
          message: 'Invalid user wallet',
          data: []
        })
      }

      // Get User Wallet
      const wallet = await WalletModel.findById(user.wallet)
      if (!wallet) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: 'failed',
          message: 'No wallet found for this user',
          data: []
        })
      }

      if (wallet.account_number.length > 0) {
        wallet.account_number.forEach(result => {
          if (result.account == userWallet) {
            return res.status(HttpStatus.BAD_REQUEST).json({
              status: 'failed',
              message: 'This account has already been added',
              data: []
            })
          }
        });
        // Validate account
        const isValidAccount = await verifyAccount(userWallet, user.fname, user.lname)
        if (!isValidAccount) {
          return res.status(HttpStatus.BAD_REQUEST).json({
            status: 'failed',
            message: 'Account is not valid',
            data: []
          })
        }  
        wallet.account_number.push({account : userWallet, isActive : false})
      } else {

        // Validate account
        const isValidAccount = await verifyAccount(userWallet, user.fname, user.lname)
        if (!isValidAccount) {
          return res.status(HttpStatus.BAD_REQUEST).json({
            status: 'failed',
            message: 'Account is not valid',
            data: []
          })
        }  

        wallet.account_number.push({account : userWallet, isActive : true})
        wallet.active_account = userWallet
      }
      await wallet.save()

      return res.status(HttpStatus.OK).json({
        status: 'success',
        message: 'Account added successfully',
        data: {wallet}
      })

    } catch (error) {
      console.log('error 1>> ', error)
      const err = {
        http: HttpStatus.SERVER_ERROR,
        status: 'failed',
        message: 'Error adding user wallet account',
        devError: error
      }
      next(err)
    }
  },

  /**
     * Remove Bank Account
     * @description Allow users remove a bank account from their list of accounts
     * @return {object} wallet
     */
    async removeAccount(req, res, next) {
      try {

        
        const userId = req.jwtUser
        const walletId = req.params.id
        const userWallet = req.body.account
  
        const user = await User.findById(userId)
        if (!user || user.wallet != walletId) {
          return res.status(HttpStatus.BAD_REQUEST).json({
            status: 'failed',
            message: 'Invalid user',
            data: []
          })
        }

        const wallet = await WalletModel.findById(user.wallet)
        if (!wallet) {
          return res.status(HttpStatus.BAD_REQUEST).json({
            status: 'failed',
            message: 'No wallet was found for this user',
            data: []
          })
        }
        
        if (wallet.account_number.length == 1) {
          return res.status(HttpStatus.BAD_REQUEST).json({
            status: 'failed',
            message: 'Unable to delete. You need at least one account tied to your wallet.',
            data: []
          })
        }

        for (let i = 0; i < wallet.account_number.length; i++) {
          if (wallet.account_number[i].account == userWallet) {
            if (wallet.account_number[i].isActive) {
              wallet.account_number[0].isActive = true
              wallet.active_account = wallet.account_number[0].account
            }
            delete wallet.account_number[i]
            break
          }
        }
        await wallet.save()
  
        return res.status(HttpStatus.OK).json({
          status: 'success',
          message: 'Account deleted successfully',
          data: {wallet}
        })
  
      } catch (error) {
        console.log('error >> ', error)
        const err = {
          http: HttpStatus.SERVER_ERROR,
          status: 'failed',
          message: 'Error getting user naira wallet',
          devError: error
        }
        next(err)
      }
    },

    /**
     * Activate Bank Account
     * @description Allow users set an active account
     * @return {object} wallet
     */
    async activateAccount(req, res, next) {
      try {
        
        
        const userId = req.jwtUser
        const walletId = req.params.id
        const userWallet = req.body.account
  
        const user = await User.findById(userId)
        if (!user || user.wallet != walletId) {
          return res.status(HttpStatus.BAD_REQUEST).json({
            status: 'failed',
            message: 'Invalid user',
            data: []
          })
        }

        const wallet = await WalletModel.findById(user.wallet)
        if (!wallet) {
          return res.status(HttpStatus.BAD_REQUEST).json({
            status: 'failed',
            message: 'No wallet was found for this user',
            data: []
          })
        }
        var accountExist = false
        for (let i = 0; i < wallet.account_number.length; i++) {
          if (wallet.account_number[i].isActive && wallet.account_number[i].account != userWallet ) {
            wallet.account_number[i].isActive = false
          }
          if (wallet.account_number[i].account == userWallet) {
            wallet.account_number[i].isActive = true
            wallet.active_account = userWallet
            accountExist = true
            break
          } 
        }
        await wallet.save()

        if(!accountExist) {
          return res.status(HttpStatus.BAD_REQUEST).json({
            status: 'failed',
            message: 'Account number does not exist in user wallet',
            data: []
          })
        }
  
        return res.status(HttpStatus.OK).json({
          status: 'success',
          message: 'Account activated successfully',
          data: {wallet}
        })
  
      } catch (error) {
        console.log('error >> ', error)
        const err = {
          http: HttpStatus.SERVER_ERROR,
          status: 'failed',
          message: 'Error getting user naira wallet',
          devError: error
        }
        next(err)
      }
    },  

    /**
   * Fund Wallet
   * @description Allow user fund wallet
   * @param {object} wallet        user naira wallet
   */
  async fundWallet(req, res, next) {
    try {
        const userId = req.jwtUser
        const walletId = req.params.id
        const user = await User.findById(userId)
        if (!user || user.wallet != walletId) {
          return res.status(HttpStatus.BAD_REQUEST).json({
            status: 'failed',
            message: 'Invalid user',
            data: []
          })
        }
        var transaction = await new TransactionModel() 
        const wallet = await WalletModel.findById(user.wallet)

        var referenceid = await crypto.randomBytes(10)
        referenceid = referenceid.toString('hex')

        const amount = req.body.amount
        const remark = req.body.remark
        const fromAccount = wallet.active_account
        const toAccount = config.appNairaAccount

        // Call IBS Service
        const transferSuccess = await transfer(referenceid,fromAccount, toAccount, amount, remark)

        if (!transferSuccess) {
          return res.status(HttpStatus.PRECONDITION_FAILED).json({
            status: 'failed',
            message: 'Wallet funding failed!',
            data: {wallet}
          })
        }

        transaction.user = user.id
        transaction.from = fromAccount
        transaction.to = toAccount
        transaction.txHash = referenceid
        transaction.amount = amount
        transaction.type = TransactionModel.Type.FUND
        transaction.status = TransactionModel.Status.COMPLETED
        await transaction.save()

        wallet.balance += amount
        wallet.transactions.push(transaction._id)
        await wallet.save()

        return res.status(HttpStatus.OK).json({ 
          status: 'success', 
          message: 'Account funded successfully!', 
          data: {wallet} 
        });

    } catch (error) {
      console.log('error >> ', error)
      const err = {
        http: HttpStatus.SERVER_ERROR,
        status: 'failed',
        message: 'Could not fund wallet!',
        devError: error
      }
      next(err)
    }

  },


  /**
   * Withdraw Wallet
   * @description Allow user withdraw from their wallet
   * @param {object} wallet        user naira wallet
   */
  async withdraw(req, res, next) {
    try {

        

        // Request Params
        const userId = req.jwtUser
        const walletId = req.params.id
        const user = await User.findById(userId)
        if (!user || user.wallet != walletId) {
          return res.status(HttpStatus.BAD_REQUEST).json({
            status: 'failed',
            message: 'Invalid user',
            data: []
          })
        }
        var transaction = await new TransactionModel() 
        const wallet = await WalletModel.findById(user.wallet)

        // Transaction params
        const amount = req.body.amount
        const remark = req.body.remark
        const toAccount = wallet.active_account
        const fromAccount = config.appNairaAccount

        if (amount > wallet.balance) {
          return res.status(HttpStatus.PRECONDITION_FAILED).json({
            status: 'failed',
            message: 'Insufficient wallet balance!',
            data: {wallet}
          })
        }

        // Call IBS Service
        var referenceid = await crypto.randomBytes(10)
        referenceid = referenceid.toString('hex')
        const transferSuccess = await transfer(referenceid,fromAccount, toAccount, amount, remark)

        if (!transferSuccess) {
          return res.status(HttpStatus.PRECONDITION_FAILED).json({
            status: 'failed',
            message: 'Wallet withdrawal failed!',
            data: {wallet}
          })
        }

        transaction.user = user.id
        transaction.from = fromAccount
        transaction.to = toAccount
        transaction.txHash = referenceid
        transaction.amount = amount
        transaction.type = TransactionModel.Type.WITHDRAW
        transaction.status = TransactionModel.Status.COMPLETED
        await transaction.save()

        wallet.balance -= amount
        wallet.transactions.push(transaction._id)
        await wallet.save()

        return res.status(HttpStatus.OK).json({ 
          status: 'success', 
          message: 'Wallet withdrawer successfully!', 
          data: {wallet} 
        });

    } catch (error) {
      console.log('error >> ', error)
      const err = {
        http: HttpStatus.SERVER_ERROR,
        status: 'failed',
        message: 'Could not withdraw from wallet!',
        devError: error
      }
      next(err)
    }

  },

};

module.exports = walletController;
