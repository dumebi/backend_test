/**
 * THIS CAPTURES ALL Authorizations INITIATED BY THE INITIATORS(ADMIN)
 */
const { Schema, model } = require('mongoose')

const TransactionStatus = Object.freeze({
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  TERMINATED: 'Terminated',
  INPROGRESS: 'In Progress'
})

const TransactionType = Object.freeze({
  BUY: 'Buy',
  SELL: 'Sell',
  FUND: 'Fund',
  WITHDRAW: 'Withdraw',
  PRICE: 'Price',
})

const WalletType = Object.freeze({
  NAIRA: 'Naira',
  SIT: 'SIT',
})

const PaymentMode = Object.freeze({
  CARD: 'Card',
  ACCOUNT: 'Account',
})

const TransactionSchema = new Schema(
  {
    user: { type: Schema.ObjectId, ref: 'User', required: true },
    type: {
      type: Schema.Types.String,
      enum: Object.values(TransactionType),
      default: TransactionType.SELL,
      required: true
    },
    from: { type: Schema.Types.String }, // sender
    to: { type: Schema.Types.String }, // receiver
    wallet: {
      type: Schema.Types.String,
      enum: Object.values(WalletType),
      default: WalletType.NAIRA,
      required: true
    }, // Or token
    mode: {
      type: Schema.Types.String,
      enum: Object.values(PaymentMode)
    }, 
    volume: { type: Schema.Types.Number },
    amount: { type: Schema.Types.Number },
    min: { type: Schema.Types.Number },
    max: { type: Schema.Types.Number },
    txHash: { type: Schema.Types.String },
    remark: { type: Schema.Types.String },
    status: {
      type: Schema.Types.String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.PENDING,
      required: true
    },
  },
  { timestamps: true }, { toObject: { virtuals: true }, toJSON: { virtuals: true } }
)

TransactionSchema.statics.Status = TransactionStatus
TransactionSchema.statics.Type = TransactionType
TransactionSchema.statics.Wallet = WalletType 
TransactionSchema.statics.PaymentMode  = PaymentMode 

const transaction = model('Transaction', TransactionSchema)
module.exports = transaction
