const { Schema, model } = require('mongoose')

const TokenSchema = new Schema(
  {
    name: { type: Schema.Types.String },
    price: { type: Schema.Types.Number, min: 0, default: 0 },
    __v: { type: Number, select: false }
  },
  { timestamps: true }, { toObject: { virtuals: true }, toJSON: { virtuals: true } }
)

const Token = model('Token', TokenSchema)

module.exports = Token
