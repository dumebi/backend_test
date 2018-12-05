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
  SELL: 'Sell'
})

const TransactionSchema = new Schema(
  {
    type: {
      type: Schema.Types.String,
      enum: Object.values(TransactionType),
      default: TransactionType.SELL,
      required: true
    },
    from: { type: Schema.Types.String },
    to: { type: Schema.Types.String },
    token: { type: Schema.Types.String }, // Or wallet
    volume: { type: Schema.Types.Number },
    amount: { type: Schema.Types.Number },
    txHash: { type: Schema.Types.String },
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

module.exports = model('Transaction', TransactionSchema)