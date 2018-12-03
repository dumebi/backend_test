/** THIS IS TO CAPTURE THE DIFFERENT STATUS A TRANSACTION CAN TAKE
 */

const {Schema, model} = require('mongoose')

const TransactionStatus = new Schema({

    title : {required : true, type: string}

}, {timestamps : true},  {  toObject : {virtuals : true}, toJSON : {virtuals :true}})

module.exports = model('transaction_status', TransactionStatus)