/** THIS CAPTURED THE USERS AND PROFILES INFORMATION
 * FailedMax : Max number of failed login attempt
 * Failed : Number of failed login attempt
 * mnemonics : This is the user's account recorvery seed phrase, encrypted and backedup for  them.
 */
const { Schema, model } = require('mongoose')


const RoleSchema = new Schema(
  {
    role:String,
    permissions : [
        {
            method : {required : true, type : String},

            action : {required : true, tye: Array},

            slug : String

        }
    ]
  },
  { timestamps: true }, { toObject: { virtuals: true }, toJSON: { virtuals: true } }
)

const Role = model('roles', RoleSchema)

module.exports = Role
