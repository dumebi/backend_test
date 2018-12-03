/**
 * THIS CAPTURES ALL PERMISSIONS WITHIN THE SYSTEM
 */
const {Schema, model} = require('mongoose')

const Permission = new Schema({

    method : {required : true, type : string},

    action : {required : true, type: string},

    description : string
        
}, {timestamps : true}, {  toObject : {virtuals : true}, toJSON : {virtuals :true}})

module.exports = model('permissions', Permission)