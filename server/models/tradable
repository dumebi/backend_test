/** THIS CAPTURED THE USERS AND PROFILES INFORMATION
 * FailedMax : Max number of failed login attempt
 * Failed : Number of failed login attempt
 * mnemonics : This is the user's account recorvery seed phrase, encrypted and backedup for  them.
 */
const { Schema, model } = require('mongoose')

const TradableSchema = new Schema(
  {
    userId: { type: Schema.ObjectId, ref: 'User', required: true },
    dateAdded: { type: Date, required: true },
    amount: { type: Number, required: true },
    blockIndex: { type: Number, required: true },
    transactionId: { type: Schema.ObjectId, ref: 'Transaction', required: true },
  },
  { timestamps: true }, { toObject: { virtuals: true }, toJSON: { virtuals: true } }
)

const Tradable = model('tradables', TradableSchema)

module.exports = Tradable
