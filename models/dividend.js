
const {
  Schema,
  model
} = require('mongoose')

const DividendStatus = Object.freeze({
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  TERMINATED: 'Terminated',
  INPROGRESS: 'In Progress'
})

const DividendSchema = new Schema({
  dividendId: { type: Schema.Types.Number, unique: true, dropDups: true },
  staffId: {
    type: Schema.Types.String, unique: true, required: true, dropDups: true
  },
  amount: { type: Schema.Types.Number },
  date: { type: Schema.Types.Date },
  status: {
    type: Schema.Types.String,
    enum: Object.values(DividendStatus),
    default: DividendStatus.PENDING,
    required: true
  },
  authorizedby: { type: Schema.ObjectId, ref: 'User', required: true }
}, { timestamps: true }, { toObject: { virtuals: true }, toJSON: { virtuals: true } })

const Dividend = model('Dividend', DividendSchema)

module.exports = Dividend
