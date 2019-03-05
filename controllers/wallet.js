// const TransactionModel = require('../models/transaction');
// const HttpStatus = require('../helpers/status');
// const Wallet = require('../models/wallet');
// const soap = require('../helpers/soap');
// const {
//   checkToken
// } = require('../helpers/utils');


// const walletController = {

//   /**
//      * Get User Naira Balance
//      * @description Get User Naira Balance
//      * @return {number} balance
//      */
//   async balance(req, res, next) {
//     try {

//       var args = {ReferenceID: 1, RequestType: 201, Account :  "0070134307"};
//       const soapResponse = await soap(args)
//       console.log("soapResponse >> ", soapResponse)
//       // const token = await checkToken(req);
//       // if (token.status === 'failed') {
//       //   return res.status(token.data).json({
//       //     status: 'failed',
//       //     message: token.message
//       //   })
//       // }

//       // const userId = req.params.id

//       // const wallet = await walletModel.find({ user: userId })
//       // console.log("wallet >> ", wallet)
//       // if (wallet) {
//       //   return res.status(HttpStatus.OK).json({
//       //     status: 'success',
//       //     message: 'User transactions gotten successfully',
//       //     data: wallet.balance
//       //   })
//       // }
//       // return res.status(HttpStatus.BAD_REQUEST).json({
//       //   status: 'failed',
//       //   message: 'There is no wallet associated to this user',
//       //   data: []
//       // })
//     } catch (error) {
//       console.log('error >> ', error)
//       const err = {
//         http: HttpStatus.SERVER_ERROR,
//         status: 'failed',
//         message: 'Error getting user wallet',
//         devError: error
//       }
//       next(err)
//     }
//   },

//     /**
//    * Create Use
//    * @description Create a user
//    * @param {string} fname        First name
//    */
//   async fund(req, res, next) {
//     try {
    
//         const userId = req.params.id
//         const transaction = await new TransactionModel()
//         const wallet = await WalletModel.find({user :userId })

//         // Call SOAP Endpoint
        
//         var args = {ReferenceID: 1, RequestType: 102, FromAccount: args.FromAccount, ToAccount: args.ToAccount, Amount : args.Amount,  PaymentReference : "IFO Bolanle"};
//         const soapResponse = await soap(args)
//         console.log("soapResponse >> ", soapResponse)

//     //     transaction.user: userId
//     //     transaction.type: transaction.TransactionType.FUND
//     //     from: ""
//     //     to: "" 
//     //     volume: { type: Schema.Types.Number }
//     //     amount: { type: Schema.Types.Number }
//     //     status: transaction.TransactionStatus.Completed

//     //     await transaction.save()

//     //     wallet.balance = ,
//     //     wallet.transactions.push(transaction.id)

//     //     await wallet.save()

//     //   const userWallet = await new WalletModel.create({
//     //     user: user.id,
//     //     balance: 0,
//     //     account_number: req.body.account
//     //   })

//     //   console.log("userWallet >> " , userWallet)

//     //   return res.status(HttpStatus.OK).json({ status: 'success', message: 'Account funded successfully!', data: userWallet });
//     } catch (error) {
//       console.log('error >> ', error)
//       const err = {
//         http: HttpStatus.SERVER_ERROR,
//         status: 'failed',
//         message: 'Could not fund wallet!',
//         devError: error
//       }
//       next(err)
//     }

//   },

// };

// module.exports = UserController;
