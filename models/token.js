const { Schema, model } = require('mongoose')

const TokenSchema = new Schema(
  {
    address: { type: Schema.Types.String },
    name: { type: Schema.Types.String },
    buyBook: { type: Schema.Types.String },
    sellBook: { type: Schema.Types.String },
    curBuyPrice: { type: Schema.Types.Number },
    lowestBuyPrice: { type: Schema.Types.Number },
    amountBuyPrices: { type: Schema.Types.Number },
    curSellPrice: { type: Schema.Types.Number },
    highestSellPrice: { type: Schema.Types.Number },
    amountSellPrices: { type: Schema.Types.Number },
    balances: [{
      user: { type: Schema.ObjectId, ref: 'User' },
      amount: { type: Schema.Types.String }
    }],
    __v: { type: Number, select: false }
  },
  { timestamps: true }, { toObject: { virtuals: true }, toJSON: { virtuals: true } }
)

const Token = model('Token', TokenSchema)

module.exports = Token
