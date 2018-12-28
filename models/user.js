/** THIS CAPTURED THE USERS AND PROFILES INFORMATION
 * FailedMax : Max number of failed login attempt
 * Failed : Number of failed login attempt
 * mnemonics : This is the user's account recorvery seed phrase, encrypted and backedup for  them.
 */
const { Schema, model } = require('mongoose')
const bcrypt = require('bcrypt-nodejs')

const Employment = Object.freeze({
  EMPLOYED: 'Employed',
  RETIRED: 'Retired',
  RESIGNED: 'Resigned',
  RETRENCHED: 'Retrenched',
  DISMISSED: 'Dismissed'
})

const UserGroup = Object.freeze({
  EntryLevel: 'ET',
  SeniorExec: 'SE',
  AssetBankOfficer: 'ABO',
  SeniorBankOfficer: 'SBO',
  AssetManager: 'AMG',
  Manager: 'MG',
})

const UserSchema = new Schema(
  {
    userId: {
      type: Schema.Types.Number,
      unique: true,
      dropDups: true
    },
    userType: {
      type: Schema.Types.ObjectId,
      ref: "roles",
      required: true
    },
    employmentStatus: {
      type: Schema.Types.String,
      enum: Object.values(UserType),
      default: Employment.EMPLOYED,
      required: true
    },
    userGroup: {
      type: Schema.Types.String,
      enum: Object.values(UserGroup),
      default: UserType.ET,
      required: true
    },
    staffId: {
      type: Schema.Types.String,
      unique: true,
      required: true,
      dropDups: true
    },
    email: {
      type: Schema.Types.String,
      unique: true,
      required: true,
      dropDups: true
    },
    fullname: { type: Schema.Types.String },
    isVesting : {type: Schema.Types.Boolean},
    lienPeriod: {type: Schema.Types.Number},
    accountNo: { type: Schema.Types.String },
    beneficiary: { type: Schema.Types.String },
    mnemonic: { type: Schema.Types.String },
    publicKey: { type: Schema.Types.String },
    privateKey: { type: Schema.Types.String },
    address: { type: Schema.Types.String },
    addreseKey: { type: Schema.Types.String },
    password: { type: Schema.Types.String },
    workflow: { type: Schema.Types.String },
    status: { type: Schema.Types.String },
  },
  { timestamps: true }, { toObject: { virtuals: true }, toJSON: { virtuals: true } }
)

UserSchema.statics.Type = UserType
UserSchema.statics.Type = UserGroup
UserSchema.statics.Type = Employment

UserSchema.statics.encrypt = function encrypt(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null)
}

UserSchema.statics.validatePassword = function validatePassword(password) {
  return bcrypt.compareSync(password, this.password)
}

UserSchema.statics.validateToken = function validateToken(token) {
  return bcrypt.compareSync(token, this.recover_token)
}

const User = model('users', UserSchema)

module.exports = User
