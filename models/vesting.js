/** THIS CAPTURED THE USERS AND PROFILES INFORMATION
 * FailedMax : Max number of failed login attempt
 * Failed : Number of failed login attempt
 * mnemonics : This is the user's account recorvery seed phrase, encrypted and backedup for  them.
 */
const { Schema, model } = require('mongoose')

const VestingSchema = new Schema(
  {
    userId: {type: Schema.ObjectId, ref:'users', required:true},
    dateAllocated:{type :Date , required:true},
    amount:{type: Number , required:true},
    isMoved:{type: boolean , required:true, default:false},
    blockIndex:{type: Number , required:true},
    transactionId:{type: Schema.ObjectId, ref:'transactions', required:true},
  },
  { timestamps: true }, { toObject: { virtuals: true }, toJSON: { virtuals: true } }
)

const Vesting = model('vestings', VestingSchema)

module.exports = Vesting
