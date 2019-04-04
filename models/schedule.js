
const {
  Schema,
  model
} = require('mongoose')

const UserModel = require('../models/user');

const ScheduleType = Object.freeze({
  PAY_SCHEME: 'Pay Scheme',
  UPFRONT_SCHEME: 'Upfront Scheme'
})

const ScheduleStatus = Object.freeze({
  COMPLETED: 'Completed',
  TERMINATED: 'Terminated',
  INPROGRESS: 'In Progress'
})

const ScheduleSchema = new Schema({
  scheduleId: { type: Schema.Types.Number, unique: true, dropDups: true },
  name: { type: Schema.Types.String },
  reason: { type: Schema.Types.String },
  type: { type: Schema.Types.String },
  date: { type: Schema.Types.Date },
  enabled: { type: Schema.Types.Boolean, default: false },
  status: {
    type: Schema.Types.String,
    enum: Object.values(ScheduleStatus),
    default: ScheduleStatus.INPROGRESS,
    required: true
  },
  date_created: { type: Schema.Types.Date } 
})

ScheduleSchema.statics.Status = ScheduleStatus

const Schedule = model('Schedule', ScheduleSchema)

module.exports = Schedule 
