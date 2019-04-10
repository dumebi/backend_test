const { Schema, model } = require('mongoose')

const OHLVCSchema = new Schema(
  {
    high: { type: Schema.Types.Number, min: 0, default: 0 },
    open: { type: Schema.Types.Number, min: 0, default: 0 },
    close: { type: Schema.Types.Number, min: 0, default: 0 },
    low: { type: Schema.Types.Number, min: 0, default: 0 },
    vol: { type: Schema.Types.Number, min: 0, default: 0 },
    __v: { type: Number, select: false }
  },
  { timestamps: true }, { toObject: { virtuals: true }, toJSON: { virtuals: true } }
)

const OHLVC = model('OHLVC', OHLVCSchema)

module.exports = OHLVC
