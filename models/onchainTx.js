/**
 * THIS CAPTURES ALL Authorizations INITIATED BY THE INITIATORS(ADMIN)
 */
const { Schema, model } = require('mongoose')

const txType = Object.freeze({
  NEW_SCHEDULE: 'New Schedule',
  MINT_TOKEN: 'Mint Token',
  LOAN: 'Loan',
  WITHOLD_TOKEN: 'Withold Token',
  LOAN_ESCROW: 'Loan Escrow',
  MARKET_ESCROW: 'Market Escrow',
  SHARE_HOLDER: 'Share Holder',
  SHARE_UPDATE: 'Share Update'
})

const txSchema = new Schema(
  {
    user: { type: Schema.ObjectId, ref: 'User', required: true },
    description: { type: Schema.Types.String },
    type: {
      type: Schema.Types.String,
      enum: Object.values(txType),
      default: txType.SELL,
      required: true
    },
    from: { type: Schema.Types.String }, // sender
    to: { type: Schema.Types.String }, // default => blockchain address
    txHash: { type: Schema.Types.String },
  },
  { timestamps: true }, { toObject: { virtuals: true }, toJSON: { virtuals: true } }
)

txSchema.statics.Type = txType

const tx = model('TX', txSchema)
module.exports = tx
