const { Schema, model } = require('mongoose')
const Fixturechema = new Schema(
  {
    fixture_id: { type: Schema.Types.Number },
    home: { 
      team: { 
        type: Schema.Types.ObjectId,
        ref: 'Team' 
      },
      score: { type: Schema.Types.Number }
    },
    away: { 
      team: { 
        type: Schema.Types.ObjectId,
        ref: 'Team' 
      },
      score: { type: Schema.Types.Number }
    },
    date: { type: Schema.Types.String },
    __v: { type: Number, select: false }
  },
  { timestamps: true }, { toObject: { virtuals: true }, toJSON: { virtuals: true } }
)

const Fixture = model('Fixture', Fixturechema)

module.exports = Fixture
