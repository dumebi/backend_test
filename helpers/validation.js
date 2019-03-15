const Joi = require('joi');

module.exports = {
  
  async wallet(req,res,next) {
    try {
      const schema = Joi.object().keys({
        account: Joi.string().required().label("Account is required!")
      })

      await Joi.validate(req.body, schema);
      next()

    } catch (error) {
      next(error)
    }
  },

  async walletAction(req,res,next) {
    try {
      const schema = Joi.object().keys({
        amount: Joi.number().required().label("Amount is required!"),
        remark: Joi.string().label("Remark must be a string!")
      })

      await Joi.validate(req.body, schema);
      next()
      
    } catch (error) {
      next(error)
    }
  }
}
