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
  },

  exports.walletAction =  async (req, res, next) => {
    try {
      const schema = Joi.object().keys({
        amount: Joi.number().required().label("Amount is required!"),
        remark: Joi.string().label("Remark must be a string!")
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

  exports.fundCard =  async (req, res, next) => {
    try {
      const schema = Joi.object().keys({
        amount: Joi.number().required().label("Amount is required!"),
        remark: Joi.string().label("Remark must be a string!"),
        referenceId: Joi.string().required().label("referenceid is required!")
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
