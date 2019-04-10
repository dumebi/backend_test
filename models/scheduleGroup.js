
const {
  Schema,
  model
} = require('mongoose')

const UserModel = require('../models/user');

const ScheduleSchema = new Schema({
  schedule: { type: Schema.ObjectId, ref: 'Schedule', required: true },
  level: {
    type: Schema.Types.String, enum: Object.values(UserModel.UserGroup), default: UserModel.UserGroup.ENTRYLEVEL, required: true
  },
  amount: { type: Schema.Types.String },
}, { timestamps: true }, { toObject: { virtuals: true }, toJSON: { virtuals: true } })

const Schedule = model('ScheduleGroup', ScheduleSchema)

module.exports = Schedule
