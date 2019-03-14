const TransactionModel = require('../models/transaction');
const HttpStatus = require('../helpers/status');
const WalletModel = require('../models/wallet');
const User = require('../models/user');
const {verifyAccount, checkBalance, transfer} = require('../helpers/ibs');
const {
  checkToken,
  config
} = require('../helpers/utils');

// add account
// remove account
// active account
// fund wallet
// withdraw from wallet


const walletController = {

  /**
     * Add Bank Account
     * @description Allow users add a new bank account to their list of accounts
     * @return {object} wallet
     */
  async addAccount(req, res, next) {
    try {
      
      const userId = req.params.id
      const userWallet = req.body.account

      const user = await User.findById(userId)
      if (!user) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: 'failed',
          message: 'Invalid user',
          data: []
        })
      }

      // Validate account
      const isValidAccount = await verifyAccount(userWallet, user.fname, user.lname)
      if (!isValidAccount) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: 'failed',
          message: 'Account is not valid',
          data: []
        })
      }

      const wallet = await WalletModel.findById(user.wallet)
      if (!wallet) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: 'failed',
          message: 'There is no wallet associated with this user',
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
        wallet.account_number.push({account : userWallet, isActive : false})
      } else {

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
        
        const userId = req.params.id
        const userWallet = req.body.account
  
        const user = await User.findById(userId)
        if (!user) {
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
            message: 'There is no wallet associated with this user',
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
    async activate_account(req, res, next) {
      try {
        
        const userId = req.params.id
        const userWallet = req.body.account
  
        const user = await User.findById(userId)
        if (!user) {
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
            message: 'There is no wallet associated with this user',
            data: []
          })
        }
        
        for (let i = 0; i < wallet.account_number.length; i++) {
          if (wallet.account_number[i].isActive) {
            wallet.account_number[i].isActive = false
          }
          if (wallet.account_number[i].account == userWallet) {
            wallet.account_number[i].isActive = true
            wallet.active_account = userWallet
            break
          }
        }
        await wallet.save()
  
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
    
        const userId = req.params.id
        const user = await User.findById(userId)
        const transaction = await new TransactionModel()
        const wallet = await WalletModel.findById(user.wallet)

        const amount = req.body.amount
        fromAccount = wallet.activate_account.
        toAccount = config.appNairaAccount

        // Call IBS Service
        const balance = await checkBalance(fromAccount)
        if (balance < amount) {
          return res.status(HttpStatus.PRECONDITION_FAILED).json({
            status: 'failed',
            message: 'Your active account has insufficient balance for this transaction',
            data: {wallet}
          })
        }

        const transferSuccess = await transfer(fromAccount, toAccount, amount)

        if (!transferSuccess) {
          return res.status(HttpStatus.PRECONDITION_FAILED).json({
            status: 'failed',
            message: 'Wallet funding failed!',
            data: {wallet}
          })
        }

        wallet.balance = wallet.balance + amount
        wallet.transactions.push(transaction.id)
        await wallet.save()

        const userWallet = await new WalletModel.create({
          user: user.id,
          balance: 0,
          account_number: req.body.account
        })
        console.log("userWallet >> " , userWallet)

        transaction.user = user.id
        transaction.type = transaction.TransactionType.FUND
        transaction.from = wallet.activate_account.
        transaction.to = config.appNairaAccount
        transaction.amount = amount
        transaction.status = transaction.TransactionStatus.Completed
        await transaction.save()

        return res.status(HttpStatus.OK).json({ 
          status: 'success', 
          message: 'Account funded successfully!', 
          data: userWallet 
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
  
      const userId = req.params.id
      const user = await User.findById(userId)
      const transaction = await new TransactionModel()
      const wallet = await WalletModel.findById(user.wallet)

      const amount = req.body.amount
      fromAccount = wallet.activate_account.
      toAccount = config.appNairaAccount

      // Call IBS Service
      const balance = await checkBalance(fromAccount)
      if (balance < amount) {
        return res.status(HttpStatus.PRECONDITION_FAILED).json({
          status: 'failed',
          message: 'Your active account has insufficient balance for this transaction',
          data: {wallet}
        })
      }

      const transferSuccess = await transfer(fromAccount, toAccount, amount)

      if (!transferSuccess) {
        return res.status(HttpStatus.PRECONDITION_FAILED).json({
          status: 'failed',
          message: 'Wallet funding failed!',
          data: {wallet}
        })
      }

      wallet.balance = wallet.balance + amount
      wallet.transactions.push(transaction.id)
      await wallet.save()

      const userWallet = await new WalletModel.create({
        user: user.id,
        balance: 0,
        account_number: req.body.account
      })
      console.log("userWallet >> " , userWallet)

      transaction.user = user.id
      transaction.type = transaction.TransactionType.FUND
      transaction.from = wallet.activate_account.
      transaction.to = config.appNairaAccount
      transaction.amount = amount
      transaction.status = transaction.TransactionStatus.Completed
      await transaction.save()

      return res.status(HttpStatus.OK).json({ 
        status: 'success', 
        message: 'Account funded successfully!', 
        data: userWallet 
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

};

module.exports = walletController;
