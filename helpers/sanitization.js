const { sanitizeBody } = require('express-validator/filter');

module.exports = {
    users : function() {

        return [
        sanitizeBody('userType').escape(),
        sanitizeBody('employmentStatus').escape(),
        sanitizeBody('userGroup').escape(),
        sanitizeBody('staffId').escape(),
        sanitizeBody('email').normalizeEmail(),
        sanitizeBody('isVesting').toBoolean(),
        sanitizeBody('lienPeriod').toInt(),
        sanitizeBody('dividendAcct').escape(),
        sanitizeBody('beneficiary').escape(),
        sanitizeBody('password').escape(),
        sanitizeBody('workflow').toBoolean(),
        sanitizeBody('status').escape()
        ]
    }
}