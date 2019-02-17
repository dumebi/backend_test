/* eslint-disable object-curly-newline */
/** THIS CAPTURED THE USERS AND PROFILES INFORMATION
 * FailedMax : Max number of failed login attempt
 * Failed : Number of failed login attempt
 * mnemonics : This is the user's account recorvery seed phrase, encrypted and backedup for  them.
 */
const { Schema, model } = require('mongoose')
const bcrypt = require('bcrypt-nodejs')
const Wallet = require('../models/wallet')

const Employment = Object.freeze({
  EMPLOYED: 'Employed',
  RETIRED: 'Retired',
  RESIGNED: 'Resigned',
  RETRENCHED: 'Retrenched',
  DISMISSED: 'Dismissed'
})

const UserGroup = Object.freeze({
  ET: 'Executive Trainee',
  SE: 'Senior Executive',
  BO: 'Bank Officer',
  SBO: 'Senior Bank Officer',
  AM: 'Assistant Manager',
  DM: 'Deputy Manager',
  MGR: 'Manager',
  SM: 'Senior Manager',
  AGM: 'Assistant General Manager',
  DGM: 'Deputy General Manager',
  ED: 'Executive Director',
  MD: 'Managing Director'
})

const UserType = Object.freeze({
  USER: 'User',
  ADMIN: 'Admin',
  SUPERADMIN: 'SuperAdmin'
})

const UserSchema = new Schema(
  {
    // Personal Details
    fname: { type: Schema.Types.String },
    mname: { type: Schema.Types.String },
    lname: { type: Schema.Types.String },
    email: {
      type: Schema.Types.String, unique: true, required: true, dropDups: true
    },
    phone: { type: Schema.Types.String },
    image: { type: Schema.Types.String },
    // bvn: { type: Schema.Types.String },
    sex: { type: Schema.Types.String },
    dob: { type: Schema.Types.String },
    state: { type: Schema.Types.String },
    city: { type: Schema.Types.String },
    country: { type: Schema.Types.String },
    // houseAddress: { type: Schema.Types.String },
    // Access levels
    type: { type: Schema.Types.String, enum: Object.values(UserType), default: UserType.USER, required: true },
    employment: { type: Schema.Types.String, enum: Object.values(Employment), default: Employment.EMPLOYED, required: true },
    group: { type: Schema.Types.String, enum: Object.values(UserGroup), default: UserGroup.ENTRYLEVEL, required: true },
    // Official details
    staffId: { type: Schema.Types.String, unique: true, required: true, dropDups: true },
    // bank: { type: Schema.Types.String }, Wallet already contains bank details
    beneficiary: { type: Schema.Types.String },
    address: { type: Schema.Types.String, required: true },
    // Authentication
    activated: { type: Schema.Types.Boolean, required: true },
    enabled: { type: Schema.Types.Boolean, required: true },
    password: { type: Schema.Types.String, required: true, select: false },
    token: { type: Schema.Types.String, select: true }, // JWT token
    recover_token: { type: Schema.Types.String, select: false },
    // Blockchain details
    vesting: { type: Schema.Types.Boolean, required: true },
    mnemonic: { type: Schema.Types.String, required: true, select: false },
    publicKey: { type: Schema.Types.String, required: true, select: false },
    privateKey: { type: Schema.Types.String, required: true, select: false },
    preferences: {
      email: { type: Schema.Types.Boolean, default: false }, // Email Notifications
      push: { type: Schema.Types.Boolean, default: false }, // Push Notifications
      _2fa: { type: Schema.Types.Boolean, default: false } // 2 factor authentication
    },
    wallet: { type: Schema.Types.ObjectId, ref: 'Wallet' },
    __v: { type: Number, select: false }
  },
  { timestamps: true }, { toObject: { virtuals: true }, toJSON: { virtuals: true } }
)

UserSchema.statics.UserType = UserType
UserSchema.statics.UserGroup = UserGroup
UserSchema.statics.EmploymentStatus = Employment

UserSchema.pre('save', async function pre(next) {
  if (this.isNew) {
    const hashedPassword = bcrypt.hashSync(this.password, bcrypt.genSaltSync(5), null)
    console.log(hashedPassword)
    this.password = hashedPassword;
    const wallet = await new Wallet({
      balance: 0,
      transactions: [],
      bank: []
    }).save()
    this.wallet = wallet._id
  }
  next();
});

UserSchema.methods.encrypt = function encrypt(text) {
  return bcrypt.hashSync(text, bcrypt.genSaltSync(5), null)
}

UserSchema.methods.validatePassword = function validatePassword(password) {
  return bcrypt.compareSync(password, this.password)
}

UserSchema.methods.validateToken = function validateToken(token) {
  return bcrypt.compareSync(token, this.recover_token)
}
const User = model('User', UserSchema)

module.exports = User
