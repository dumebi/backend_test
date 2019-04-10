
const {
  Schema,
  model
} = require('mongoose')

const UserModel = require('../models/user');

const DividendStatus = Object.freeze({
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  TERMINATED: 'Terminated',
  INPROGRESS: 'In Progress'
})

const DividendSchema = new Schema({
  dividendId: { type: Schema.Types.Number, unique: true, dropDups: true },
  name: { type: Schema.Types.String },
  date: { type: Schema.Types.Date },
  status: {
    type: Schema.Types.String,
    enum: Object.values(DividendStatus),
    default: DividendStatus.PENDING,
    required: true
  },
  enabled: { type: Schema.Types.Boolean, default: false },
  createdby: { type: Schema.ObjectId, ref: 'User', required: true },
  authorizedby: { type: Schema.ObjectId, ref: 'User' },
  disabledby: { type: Schema.ObjectId, ref: 'User' },
}, { timestamps: true }, { toObject: { virtuals: true }, toJSON: { virtuals: true } })

const Dividend = model('Dividend', DividendSchema)

module.exports = Dividend
