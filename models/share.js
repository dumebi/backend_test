const { Schema, model } = require('mongoose')

const RepaymentScheme = Object.freeze({
    MONTHLY: 'Monthly',
    QUATERLY: 'Quaterly',
    BIANNUAL: 'Biannual',
    ANNUAL: 'Annual'
})

const LienSchema = new Schema({
    userID: { type: Schema.ObjectId, ref: 'User', required: true },
    period: { type: Schema.Types.Number, required: true },
    date_added: { type: Schema.Types.Date },
})

const LienModel = model('Lien', LienSchema)

module.exports = { LienModel }