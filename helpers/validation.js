const Joi = require('joi');
const HttpStatus = require('./status')
  
exports.wallet = async (req, res, next) => {
  try {
    const schema = Joi.object().keys({
      account: Joi.string().required().label("Account is required!")
    })

    await Joi.validate(req.body, schema);
    next()

  } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: 'failed',
        message: error.details,
      })
  }
}