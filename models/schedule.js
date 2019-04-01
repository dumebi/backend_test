
const {
  Schema,
  model
} = require('mongoose')

const UserModel = require('../models/user');

const ScheduleStatus = Object.freeze({
  PENDING: 'Pending',
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
    default: ScheduleStatus.PENDING,
    required: true
  },
  createdby: { type: Schema.ObjectId, ref: 'User', required: true },
  authorizedby: { type: Schema.ObjectId, ref: 'User' },
  disabledby: { type: Schema.ObjectId, ref: 'User' },
}, { timestamps: true }, { toObject: { virtuals: true }, toJSON: { virtuals: true } })

ScheduleSchema.statics.Status = ScheduleStatus

const Schedule = model('Schedule', ScheduleSchema)

module.exports = Schedule
