/** THIS IS TO ASSOCIATE A USER TO A DEFINED ROLE
 * 
 */

const {Schema, model} = require('mongoose')
const User = require('./User');
const Role = require('./Role');
const Token = require('./Token');

const UserRole = new Schema({

    userId : [{required : true, type: Schema.ObjectId, ref: User}],

    roleId   : {required : true, type : Schema.ObjectId, ref: Role},

    tokenId : {required : true, type : Schema.ObjectId, ref: Token},

    workflow : {type: boolean, default: false}

},{_id : fasle}, {timestamps : true}, {  toObject : {virtuals : true}, toJSON : {virtuals :true}})

module.exports = model('user_roles', UserRole)