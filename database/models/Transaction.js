
const {Schema, model} = require('mongoose')
const Trading = require('./Trading')
const Token = require('./Token')
const TransactionStatus = require('./TransactionStatus')

const Transaction = new Schema({

    tradingId : {required : true, type: Schema.ObjectId, ref : Trading},

    buyerId : {required : true, type: Schema.ObjectId, ref : Account},

    tokenId : {required : true, type: Schema.ObjectId, ref : Token},

    transactionHash   : {required : true, type : String},

    transactionDate : {required : true, type : Date},

    transactionStatusId : {required : true, type : Schema.ObjectId , ref : TransactionStatus}

}, {timestamps : true}, {  toObject : {virtuals : true}, toJSON : {virtuals :true}})

module.exports = model('transactions', Transaction)