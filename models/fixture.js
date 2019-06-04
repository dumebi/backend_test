const { Schema, model } = require('mongoose')

const Status = Object.freeze({
  PENDING: 'Pending',
  CONTRACT: 'Contract',
  COMPLETED: 'Completed',
  TERMINATED: 'Terminated',
  INPROGRESS: 'In Progress'
})

const Fixturechema = new Schema(
  {
    fixture_id: { type: Schema.Types.Number },
    home: { 
      team: { 
        type: Schema.Types.ObjectId,
        ref: 'Team' 
      },
      score: { type: Schema.Types.Number, default: 0 }
    },
    away: { 
      team: { 
        type: Schema.Types.ObjectId,
        ref: 'Team' 
      },
      score: { type: Schema.Types.Number, enum: Object.values(Status), default: 0 }
    },
    status: { type: Schema.Types.String, default: Status.PENDING },
    date: { type: Schema.Types.String },
    __v: { type: Number, select: false }
  },
  { timestamps: true }, { toObject: { virtuals: true }, toJSON: { virtuals: true } }
)

Fixturechema.statics.Status = Status
const Fixture = model('Fixture', Fixturechema)

module.exports = Fixture
