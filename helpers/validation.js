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

  exports.lien = async (req, res, next) => {
    try {
      const schema = Joi.object().keys({
        userID: Joi.string().required().label("User ID is required!"),
        amount: Joi.number().required().label("Amount is required!"),
        date_added: Joi.date().required().label("Date added is required!"),
        isWithdrawn: Joi.boolean().required().label("isWithdrawn is required!"),
        isMovedToTraddable: Joi.boolean().required().label("isMovedToTraddable is required!")
      })

      await Joi.validate(req.body, schema)
      next()

    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: 'failed',
        message: error.details,
      })
    }
  }

  exports.schedule = async (req, res, next) => {
    try {
      const schema = Joi.object().keys({
        name: Joi.string().required().label("Schedule name is required!"),
        group: Joi.string().required().label("Group is required!"),
        amount: Joi.number().required().label("Amount is required!"),
        scheduleType: Joi.string().required().label("Schedule type is not required!"),
      })

      await Joi.validate(req.body, schema)
      next()

    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: 'failed',
        message: error.details,
      })
    }
  }