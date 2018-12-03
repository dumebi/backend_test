/** THIS CAPTURES THE DIFFERENT WORKFLOWS OR CLASSES OF A TOKEN i.e for SAT Tokens, it can be fully owned and available to trade
 */

const {Schema, model} = require('mongoose')
const Token = require('./Token')

const Workflow = new Schema({

    tokenID : {required : false, type: Schema.ObjectId, ref : Token},
    status : [{required : false, type: string}]

}, {timestamps : true}, {  toObject : {virtuals : true}, toJSON : {virtuals :true}})

module.exports = model('tokens_workflow', Workflow)