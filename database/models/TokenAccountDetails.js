/** THIS CAPTURES THE USER'S ACCOUNT TOKENS
 *  balance : Captures how much of the token a user has in his possession
 */
const {Schema, model} = require('mongoose')

const TokenAccountSchema = new Schema({

    balance : {required : true, type: string, unique: true},
    accountId : {required : true, type: string, unique: true},
    tokenId : {required : true, type: string, unique: true},
    status : {required : true, type: string, unique: true}

}, {timestamps : true}, {  toObject : {virtuals : true}, toJSON : {virtuals :true}})

module.exports = model('token_accounts', TokenAccountSchema)