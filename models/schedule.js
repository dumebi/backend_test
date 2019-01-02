
const {
  Schema,
  model
} = require('mongoose')


const ScheduleSchema = new Schema({
  scheduleId: {
    type: Schema.Types.Number,
    unique: true,
    dropDups: true
  },
  staffId: {
    type: Schema.Types.String,
    unique: true,
    required: true,
    dropDups: true
  },
  amount: { type: Schema.Types.Number },
  date: { type: Schema.Types.Date },
  workflow: { type: Schema.Types.String },
  authorizedby: { type: Schema.Types.Array },
}, {
  timestamps: true
}, {
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
})

const Schedule = model('SCHEDULE', ScheduleSchema)

module.exports = Schedule
