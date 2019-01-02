/** THIS CAPTURED THE USERS AND PROFILES INFORMATION
 * FailedMax : Max number of failed login attempt
 * Failed : Number of failed login attempt
 * mnemonics : This is the user's account recorvery seed phrase, encrypted and backedup for  them.
 */
const { Schema, model } = require('mongoose')

const LienSchema = new Schema(
  {
    userId: {type: Schema.ObjectId, ref:'User', required:true},
    startDate:{type:Date, required:true},
    endDate:{type:Date, required:true},
    lienDuration:{type: Number, required:true},
    amount:{type: Number, required:true},
    isMoved:{type: Schema.Types.Boolean, required:true, default:false },
    blockIndex:{type: Number , required:true},
    transactionId:{type: Schema.ObjectId, ref:'Transaction', required:true},
  },
  { timestamps: true }, { toObject: { virtuals: true }, toJSON: { virtuals: true } }
)

const Lien = model('Lien', LienSchema)

module.exports = Lien
