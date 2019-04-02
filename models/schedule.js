
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
  name: { type: Schema.Types.String, required: true },
  group: { type: Schema.Types.String, required: true },
  amount: { type: Schema.Types.Number, required: true },
  schedule_type: { type: Schema.Types.String,
    enum: Object.values(ScheduleType),
    default: ScheduleType.PAY_SCHEME,
    required: true
  },
  Schedule_status: { type: Schema.Types.String,
    enum: Object.values(ScheduleStatus),
    default: ScheduleStatus.INPROGRESS,
    required: true
  },
  date_created: { type: Schema.Types.Date } 
})

ScheduleSchema.statics.Status = ScheduleStatus

const Schedule = model('Schedule', ScheduleSchema)

module.exports = Schedule 
