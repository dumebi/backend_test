const { Schema, model } = require('mongoose')

const TokenSchema = new Schema(
  {
    name: { type: Schema.Types.String },
    min: { type: Schema.Types.Number, min: 0, default: 0 },
    max: { type: Schema.Types.Number, min: 0, default: 0 },
    price: { type: Schema.Types.Number, min: 0, default: 0 },
    high: { type: Schema.Types.Number, min: 0, default: 0 },
    // open: { type: Schema.Types.Number, min: 0, default: 0 },
    // close: { type: Schema.Types.Number, min: 0, default: 0 },
    low: { type: Schema.Types.Number, min: 0, default: 0 },
    vol: { type: Schema.Types.Number, min: 0, default: 0 },
    __v: { type: Number, select: false }
  },
  { timestamps: true }, { toObject: { virtuals: true }, toJSON: { virtuals: true } }
)

const Token = model('Token', TokenSchema)

module.exports = Token
