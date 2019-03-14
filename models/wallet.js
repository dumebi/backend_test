const { Schema, model } = require('mongoose')

const Wallet = new Schema({
  balance: { type: Schema.Types.Number, required: true, default: 0 },
  transactions: [{ type: Schema.Types.ObjectId, ref: 'Transaction' }],
  account_number: [{type : {account : Schema.Types.String, isActive : {type : Schema.Types.Boolean, default : false} }}],
  active_account: Schema.Types.String
}, { timestamps: true }, { toObject: { virtuals: true }, toJSON: { virtuals: true } })

module.exports = model('Wallet', Wallet);
