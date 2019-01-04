const { Schema, model } = require('mongoose')

const Wallet = new Schema({
	user: { type: Schema.ObjectId, ref: 'User', required: true },
  balance: { type: Schema.Types.Number, required: true, default: 0 },
  transactions: [{ type: Schema.Types.ObjectId, ref: 'Transaction' }],
  bank: [{
    account_number: Schema.Types.String,
    code: Schema.Types.String,
    name: Schema.Types.String
  }]
}, { timestamps: true }, { toObject: { virtuals: true }, toJSON: { virtuals: true } );

module.exports = model('Wallet', Wallet);
