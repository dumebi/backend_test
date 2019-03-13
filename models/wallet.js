const { Schema, model } = require('mongoose')

const Wallet = new Schema({
  balance: { type: Schema.Types.Number, required: true, default: 0 },
  transactions: [{ type: Schema.Types.ObjectId, ref: 'Transaction' }],
  account_number: [{type : Schema.Types.String}]
}, { timestamps: true }, { toObject: { virtuals: true }, toJSON: { virtuals: true } })

module.exports = model('Wallet', Wallet);
