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
  ENTRYLEVEL: 'ET',
  SENIOREXECUTIVE: 'SE',
  ASSTBANKOFFICER: 'ABO',
  SENIORBANKOFFICER: 'SBO',
  ASSTMANAGER: 'AMG',
  MANAGER: 'MG',
})

const UserSchema = new Schema(
  {
    userType: {
      type: Schema.Types.ObjectId,
      ref: "roles",
      required: true
    },
    employmentStatus: {
      type: Schema.Types.String,
      enum: Object.values(Employment),
      default: Employment.EMPLOYED,
      required: true
    },
    userGroup: {
      type: Schema.Types.String,
      enum: Object.values(UserGroup),
      default: UserGroup.ET,
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
    fullname: { type: Schema.Types.String, required: true},
    isVesting : {type: Schema.Types.Boolean, required: true},
    lienPeriod: {type: Schema.Types.Number, required: true},
    accountNo: { type: Schema.Types.String },
    beneficiary: { type: Schema.Types.String },
    mnemonic: { type: Schema.Types.String, required: true},
    publicKey: { type: Schema.Types.String, required: true},
    privateKey: { type: Schema.Types.String, required: true},
    address: { type: Schema.Types.String, required: true},
    password: { type: Schema.Types.String,required: true},
    workflow: { type: Schema.Types.Boolean, required: true},
    status: { type: Schema.Types.String },
  },
  { timestamps: true }, { toObject: { virtuals: true }, toJSON: { virtuals: true } }
)

UserSchema.statics.Type = UserGroup
UserSchema.statics.Type = Employment

UserSchema.pre('save',function(next) {
  let hashedPassword =  bcrypt.hashSync(this.password , bcrypt.genSaltSync(5), null)
  this.password = hashedPassword;
  next();
});

UserSchema.statics.encryptPassword = function encrypt(password) {
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
