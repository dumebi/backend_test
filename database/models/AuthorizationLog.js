/**
 * THIS CAPTURES ALL TRANSACTIONS INITIATED BY THE INITIATORS(ADMIN)
 */
const {Schema, model} = require('mongoose')

const Transaction = new Schema({

    initiatorId : {required : true, type: Schema.ObjectId, ref : Account},

    purpose : {required : true, type: string},

    transactionHash   : {required : true, type : string},

    authorized : {required : true, type : boolean, default : false },
        
}, {timestamps : true}, {  toObject : {virtuals : true}, toJSON : {virtuals :true}})

module.exports = model('transactions', Transaction)