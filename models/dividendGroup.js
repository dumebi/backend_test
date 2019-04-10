
const {
  Schema,
  model
} = require('mongoose')

const UserModel = require('../models/user');

const DividendSchema = new Schema({
  dividend: { type: Schema.ObjectId, ref: 'Dividend', required: true },
  level: {
    type: Schema.Types.String, enum: Object.values(UserModel.UserGroup), default: UserModel.UserGroup.ENTRYLEVEL, required: true
  },
  amount: { type: Schema.Types.String },
}, { timestamps: true }, { toObject: { virtuals: true }, toJSON: { virtuals: true } })

const Dividend = model('DividendGroup', DividendSchema)

module.exports = Dividend
