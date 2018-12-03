/** THIS CAPTURED THE USERS AND PROFILES INFORMATION
 * FailedMax : Max number of failed login attempt
 * Failed : Number of failed login attempt
 * mnemonics : This is the user's account recorvery seed phrase, encrypted and backedup for  them.
 */
const {Schema, model} = require('mongoose')

const UserProfile = new Schema({

    firstname : {required : true, type: string},
    lastname : {required : true, type: string},
    mobile : {required : true, type: string},
    dob : {required : true, type: string},
    gender : {required : true, type: string},
    maritalStatus  : {required : true, type: string},
    street : {required : true, type: string}, 
    city : {required : true, type: string}, 
    state : {required : true, type: string}, 
    country : {required : true, type: string},
    image : {required : true, type: string},
    stateOfOrigin : {required : true, type: string},
    localGovtArea : {required : true, type: string},
	BVNNo : {required : true, type: string}

}, {_id : false})

const User = new Schema({

    username : {required : true, type: string, unique: true},
    email : {required : true, type: email, unique : true},
    password : {required : true, type: string},
    FailedMax : {required : true, type: string}, 
    Failed : {required : true, type: string},
    Profile : UserProfile,
    mnemonics : {required : true, type: string}

}, {timestamps : true}, {  toObject : {virtuals : true}, toJSON : {virtuals :true}})

module.exports = model('users', User)