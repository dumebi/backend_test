const TransactionModel = require('../models/transaction');
const HttpStatus = require('../helpers/status');
const WalletModel = require('../models/wallet');
const User = require('../models/user');
const {verifyAccount, checkBalance, transfer} = require('../helpers/ibs');
// const validate = require("../helpers/validation.js");
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

      // Request Params
      const userId = req.jwtUser
      const walletId = req.params.id
      const userWallet = req.body.account

      // Get Users
      const user = await User.findById(userId)
      if (!user || user.wallet != walletId) {
        return next({
          http:HttpStatus.BAD_REQUEST,
          status: 'failed',
          message: 'Invalid user wallet',
          devError: {}
        })
      }

      // Get User Wallet
      const wallet = await WalletModel.findById(user.wallet)
      if (!wallet) {
        return next({
          http:HttpStatus.BAD_REQUEST,
          status: 'failed',
          message: 'No wallet found for this user',
          devError: {}
        })
      }

      if (wallet.account_number.length > 0) {
        wallet.account_number.forEach(result => {
          if (result.account == userWallet) {
            return next({
              http:HttpStatus.BAD_REQUEST,
              status: 'failed',
              message: 'This account has already been added',
              devError: {}
            })
          }
        });
        // Validate account
        const isValidAccount = await verifyAccount(userWallet, user.fname, user.lname)
        if (!isValidAccount) {
          return next({
            http:HttpStatus.BAD_REQUEST,
            status: 'failed',
            message: 'Account is not valid',
            devError: {}
          })
        }  
        wallet.account_number.push({account : userWallet, isActive : false})
      } else {

        // Validate account
        const isValidAccount = await verifyAccount(userWallet, user.fname, user.lname)
        if (!isValidAccount) {
          return next({
            http:HttpStatus.BAD_REQUEST,
            status: 'failed',
            message: 'Account is not valid',
            devError: {}
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
          return next({
            http:HttpStatus.BAD_REQUEST,
            status: 'failed',
            message: 'Invalid user',
            devError: {}
          })
        }

        const wallet = await WalletModel.findById(user.wallet)
        if (!wallet) {
          return next({
            http:HttpStatus.BAD_REQUEST,
            status: 'failed',
            message: 'No wallet was found for this user',
            devError: {}
          })
        }
        
        if (wallet.account_number.length == 1) {
          return next({
            http:HttpStatus.BAD_REQUEST,
            status: 'failed',
            message: 'Unable to delete. You need at least one account tied to your wallet.',
            devError: {}
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
          return next({
            http:HttpStatus.BAD_REQUEST,
            status: 'failed',
            message: 'Invalid user.',
            devError: {}
          })
        }

        const wallet = await WalletModel.findById(user.wallet)
        if (!wallet) {
          return next({
            http:HttpStatus.BAD_REQUEST,
            status: 'failed',
            message: 'No wallet was found for this user.',
            devError: {}
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
          return next({
            http:HttpStatus.BAD_REQUEST,
            status: 'failed',
            message: 'Account number does not exist in user wallet.',
            devError: {}
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
   * Fund Wallet From Account
   * @description Allow user fund wallet by direct debit from account
   * @param {object} wallet        user naira wallet
   */
  async fundFromAccount(req, res, next) {
    try {
      
        const userId = req.jwtUser
        const walletId = req.params.id
        const user = await User.findById(userId)
        if (!user || user.wallet != walletId) {
          return next({
            http:HttpStatus.BAD_REQUEST,
            status: 'failed',
            message: 'Invalid user',
            devError: {}
          })
        }

        var transaction = await new TransactionModel() 
        const wallet = await WalletModel.findById(user.wallet)
        
        if (!wallet.active_account) {
          return next({
            http:HttpStatus.BAD_REQUEST,
            status: 'failed',
            message: 'Please set an active account!',
            devError: {}
          })
        }

        var referenceid = await crypto.randomBytes(10)
        referenceid = referenceid.toString('hex')

        const amount = req.body.amount
        const remark = req.body.remark
        const fromAccount = wallet.active_account
        const toAccount = config.appNairaAccount

        // Call IBS Service
        const transferSuccess = await transfer(referenceid,fromAccount, toAccount, amount, remark)

        if (!transferSuccess) {
          return next({
            http:HttpStatus.PRECONDITION_FAILED,
            status: 'failed',
            message: 'Wallet funding failed for '+wallet,
            devError: wallet
          })
        }

        transaction.user = user.id
        transaction.from = fromAccount
        transaction.to = toAccount
        transaction.txHash = referenceid
        transaction.amount = amount
        transaction.remark = remark
        transaction.mode = TransactionModel.PaymentMode.ACCOUNT
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
   * Fund Wallet From Card
   * @description Allow user fund wallet from card
   * @param {object} wallet        user naira wallet
   */
  async fundFromCard(req, res, next) {
    try {
        const userId = req.jwtUser
        const walletId = req.params.id
        const user = await User.findById(userId)
        if (!user || user.wallet != walletId) {
          return next({
            http:HttpStatus.BAD_REQUEST,
            status: 'failed',
            message: 'Invalid user',
            devError: {}
          })
        }
        var transaction = await new TransactionModel() 
        const wallet = await WalletModel.findById(user.wallet)

        const amount = req.body.amount
        const referenceId = req.body.referenceId
        const remark = req.body.remark

        transaction.user = user.id
        transaction.txHash = referenceId
        transaction.amount = amount
        transaction.remark = remark
        transaction.mode = TransactionModel.PaymentMode.CARD
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
          return next({
            http:HttpStatus.BAD_REQUEST,
            status: 'failed',
            message: 'Invalid user',
            devError: {}
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
          return next({
            http: HttpStatus.PRECONDITION_FAILED,
            status: 'failed',
            message: 'Insufficient wallet balance!',
            devError: wallet
          })
        }

        // Call IBS Service
        var referenceid = await crypto.randomBytes(10)
        referenceid = referenceid.toString('hex')
        const transferSuccess = await transfer(referenceid,fromAccount, toAccount, amount, remark)

        if (!transferSuccess) {
          return next({
            http: HttpStatus.PRECONDITION_FAILED,
            status: 'failed',
            message: 'Wallet withdrawal failed!',
            devError: wallet
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
