const Joi = require('joi');

module.exports = {
 
    users : async function(userObj) {
        
        try {

            const schema = Joi.object().keys({
                userType: Joi.string().alphanum().required(),
                employmentStatus: Joi.string().required(),
                userGroup: Joi.string().required(),
                staffId: Joi.string().required(),
                email: Joi.string().email({ minDomainAtoms: 2 }).required(),
                fullname: Joi.string().required(),
                isVesting : Joi.boolean().required(),
                lienPeriod: Joi.number().integer().required(),
                dividendAcct: Joi.string().allow(""),
                beneficiary: Joi.string().allow(""),
                password: Joi.string().required(),
                workflow: Joi.boolean().default(false),
                status: Joi.string().allow("")
            })
            
            var result = "me"
             result = await Joi.validate(userObj, schema);

            return result

        } catch (error) {
            throw error
        }
    }
}