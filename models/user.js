/* eslint-disable object-curly-newline */
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
  ENTRYLEVEL: 'ENTRY LEVEL',
  SENIOREXECUTIVE: 'SENIOR EXECUTIVE',
  ASSTBANKOFFICER: 'ASSISTANT BANK OFFICER',
  SENIORBANKOFFICER: 'SENIOR BANK OFFICER',
  ASSTMANAGER: 'ASSISTANT MANAGER',
  MANAGER: 'MANAGER',
})

const UserType = Object.freeze({
  USER: 'User',
  ADMIN: 'Admin',
  SUPERADMIN: 'SuperAdmin'
})

const UserSchema = new Schema(
  {
    // Access levels
    type: { type: Schema.Types.String, enum: Object.values(UserType), default: UserType.USER, required: true },
    // role: { type: Schema.ObjectId, ref: 'Role', required: true },
    employment: { type: Schema.Types.String, enum: Object.values(Employment), default: Employment.EMPLOYED, required: true },
    group: { type: Schema.Types.String, enum: Object.values(UserGroup), default: UserGroup.ENTRYLEVEL, required: true },
    // Official details
    staffId: { type: Schema.Types.String, unique: true, required: true, dropDups: true },
    email: { type: Schema.Types.String, unique: true, required: true, dropDups: true },
    bank: { type: Schema.Types.String },
    beneficiary: { type: Schema.Types.String },
    address: { type: Schema.Types.String, required: true },
    // Authentication
    enabled: { type: Schema.Types.Boolean, required: true },
    password: { type: Schema.Types.String, required: true },
    token: { type: Schema.Types.String }, // JWT token
    recover_token: { type: Schema.Types.String },
    // Blockchain details
    vesting: { type: Schema.Types.Boolean, required: true },
    mnemonic: { type: Schema.Types.String, required: true },
    publicKey: { type: Schema.Types.String, required: true },
    privateKey: { type: Schema.Types.String, required: true },
    preferences: {
      email: { type: Schema.Types.Boolean, default: false }, // Email Notifications
      push: { type: Schema.Types.Boolean, default: false }, // Push Notifications
      _2fa: { type: Schema.Types.Boolean, default: false } // 2 factor authentication
    }
  },
  { timestamps: true }, { toObject: { virtuals: true }, toJSON: { virtuals: true } }
)

UserSchema.statics.UserType = UserType
UserSchema.statics.UserGroup = UserGroup
UserSchema.statics.EmploymentStatus = Employment

UserSchema.pre('save', (next) => {
  const hashedPassword = bcrypt.hashSync(this.password, bcrypt.genSaltSync(5), null)
  this.password = hashedPassword;
  next();
});

UserSchema.statics.encrypt = function encrypt(text) {
  return bcrypt.hashSync(text, bcrypt.genSaltSync(5), null)
}

UserSchema.statics.validatePassword = function validatePassword(password) {
  return bcrypt.compareSync(password, this.password)
}

UserSchema.statics.validateToken = function validateToken(token) {
  return bcrypt.compareSync(token, this.recover_token)
}

const User = model('User', UserSchema)

module.exports = User
