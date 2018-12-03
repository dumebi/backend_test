/** THIS IS TO CAPTURE THE DIFFERENT USER ROLES WWITHIN THE PLATFORM
 */

const {Schema, model} = require('mongoose')

const TradingType = new Schema({

    title : {required : true, type: string}

}, {timestamps : true}, {  toObject : {virtuals : true}, toJSON : {virtuals :true}})

module.exports = model('trading_types', TradingType)