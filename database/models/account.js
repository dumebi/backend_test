/** THIS IS TO ENABLE DIFFERENT TRADING ACCOUNTS OF A USER
 * userId : This connects an account to a user
 * accountType : This specifies the type of trading account i.e Shares, Investment, Property etc...
 * workflow : An account can either be enabled or disabled for transaction 
 */

const {Schema, model} = require('mongoose')
const Token = require('./Token');
const User = require('./User');

const Account = new Schema({

    userId : {required : true, type: Schema.ObjectId, ref: User},
    tokenId : {required : true, type: Schema.ObjectId, ref: Token },
    privatekey : {required : true, type: string},
    publickey : {required : true, type: string},
    address   : {required : true, type : string},
    enabled : {required : true, type : boolean}
    
},{  toObject : {virtuals : true}, toJSON : {virtuals :true}}, {timestamps : true})

module.exports = model('trading_accounts', Account)