const { Schema, model } = require('mongoose')

const UserModel = require('../models/user');

const ScheduleType = Object.freeze({
  SHARE: 'Share Based',
  UPFRONT: 'Upfront'
})

const AllocationSchema = new Schema(
  {
    type: {
      type: Schema.Types.String, enum: Object.values(ScheduleType), default: ScheduleType.SHARE, required: true
    },
    group: {
      type: Schema.Types.String, enum: Object.values(UserModel.UserGroup), default: UserModel.UserGroup.ENTRYLEVEL, required: true
    },
    amount: { type: Schema.Types.String },
    users: [
      { type: Schema.ObjectId, ref: 'User', required: true }
    ]
  },
  { timestamps: true }, { toObject: { virtuals: true }, toJSON: { virtuals: true } }
)

const Allocated = model('Allocation', AllocationSchema)

module.exports = Allocated
