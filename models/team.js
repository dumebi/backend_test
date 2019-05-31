const { Schema, model } = require('mongoose')
const TeamSchema = new Schema(
  {
    name: { type: Schema.Types.String },
    logo: { type: Schema.Types.String },
    owner: { type: Schema.Types.String },
    manager: { type: Schema.Types.String },
    stadium: { type: Schema.Types.String },
    established: { type: Schema.Types.String },
    __v: { type: Number, select: false }
  },
  { timestamps: true }, { toObject: { virtuals: true }, toJSON: { virtuals: true } }
)

const Team = model('Team', TeamSchema)

module.exports = Team
