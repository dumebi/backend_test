/**
 * THIS IS TO CAPTURE THE DIFFERENT TRADING ACTIVITIES ON THE TOKENIZED TRADE PLATFORM
 */

const {Schema, model} = require('mongoose')

const TokenSchema = new Schema({

    Name : {required : true, type: string, unique: true},

    Type : {required : true, type: string, unique: true},

    Symbol : {required : true, type: string, unique: true}

}, {timestamps : true}, {  toObject : {virtuals : true}, toJSON : {virtuals :true}})

module.exports = model('tokens', TokenSchema)