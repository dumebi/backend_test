const { Schema, model } = require('mongoose')

const OfferSchema = new Schema(
  {
    type: { type: Schema.Types.String, required: true },
    amount: { type: Schema.Types.Number, default: 0 },
    price: { type: Schema.Types.Number, default: 0 },
    user: { type: Schema.ObjectId, ref: 'User' },
    token: { type: Schema.ObjectId, ref: 'Token' },
    sold: { type: Schema.Types.Boolean, default: false },
    __v: { type: Number, select: false }
  },
  { timestamps: true }, { toObject: { virtuals: true }, toJSON: { virtuals: true } }
)

const Offer = model('Offer', OfferSchema)

module.exports = Offer
