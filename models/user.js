/** THIS CAPTURED THE USERS AND PROFILES INFORMATION
 * FailedMax : Max number of failed login attempt
 * Failed : Number of failed login attempt
 * mnemonics : This is the user's account recorvery seed phrase, encrypted and backedup for  them.
 */
const { Schema, model } = require('mongoose')

const bcrypt = require('bcrypt-nodejs')

const UserType = Object.freeze({
  USER: 'User',
  ADMIN: 'Admin',
  AUTHORIZER: 'Authorizer'
})

const UserGroup = Object.freeze({
  EntryLevel: 'ET',
  SeniorExe: 'SE',
  AssitBankOfficer: 'ABO',
  SenoirBankOfficer: 'SBO',
  AssitManager: 'AMG',
  Manager: 'MG',

})

const UserSchema = new Schema(
  {
    userId: {
      type: Schema.Types.Number,
      unique: true,
      dropDups: true
    },
    user_type: {
      type: Schema.Types.String,
      enum: Object.values(UserType),
      default: UserType.USER,
      required: true
    },
    user_group: {
      type: Schema.Types.String,
      enum: Object.values(UserGroup),
      default: UserType.ET,
      required: true
    },
    staff_id: {
      type: Schema.Types.String,
      unique: true,
      required: true,
      dropDups: true
    },
    fullname: {
      type: Schema.Types.String
    },
    email: {
      type: Schema.Types.String,
      unique: true,
      required: true,
      dropDups: true
    },
    mnemonic: { type: Schema.Types.String },
    address: { type: Schema.Types.String },
    publicKey: { type: Schema.Types.String },
    privateKey: { type: Schema.Types.String },
    password: { type: Schema.Types.String },
  },
  { timestamps: true }, { toObject: { virtuals: true }, toJSON: { virtuals: true } }
)

UserSchema.statics.Type = UserType

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
