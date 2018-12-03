/** THIS IS TO ASSOCIATE A SET OF PERMISSIONS TO A SET OF USERS OR ROLES
 * 
 */

const {Schema, model} = require('mongoose')
const Role = require('./Role');
const Permission = require('./Permission');

const UserRolePermission = new Schema({


    roleId   : {required : true, type : Schema.ObjectId, ref: Role},

    permissionId : [{required : true, type : Schema.ObjectId, ref: Permission}]

},{_id : fasle}, {timestamps : true}, {  toObject : {virtuals : true}, toJSON : {virtuals :true}})

module.exports = model('user_roles_permissions', UserRolePermission)