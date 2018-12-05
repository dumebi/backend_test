/**
 * THIS CAPTURES ALL Authorizations INITIATED BY THE INITIATORS(ADMIN)
 */
const { Schema, model } = require('mongoose')

const AuthStatus = Object.freeze({
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  TERMINATED: 'Terminated',
  INPROGRESS: 'In Progress'
})

const AuthSchema = new Schema(
  {
    initiatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    purpose: { type: Schema.Types.String },
    txHash: { type: Schema.Types.String },
    status: {
      type: Schema.Types.String,
      enum: Object.values(AuthStatus),
      default: AuthStatus.PENDING,
      required: true
    },
  },
  { timestamps: true }, { toObject: { virtuals: true }, toJSON: { virtuals: true } }
)

AuthSchema.statics.Status = AuthStatus

module.exports = model('Authorization', AuthSchema)
