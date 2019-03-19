// Import lbraries
const UserModel = require('../models/user');
const HttpStatus = require('./status')
const Joi = require('joi');
const {
  checkToken
} = require('../helpers/utils');

/**
 * Check Query originates from resource with at user rights
 */
exports.isUser = async (req, res, next) => {
  console.log("req > ", req, "res > ", res, "next > ", next)
  try {
    const token = await checkToken(req);
    if (token.status === 'failed') {
        return res.status(token.data).json({
          status: 'failed',
          message: token.message
        })
      }
    if (token.data.type === Object.values(UserModel.UserType)[0]
      || token.data.type === Object.values(UserModel.UserType)[1]
      || token.data.type === Object.values(UserModel.UserType)[2]
    ) {
      req.jwtUser = token.data.id
      next()
    } else {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        status: 'failed',
        data: 'Access not granted to this resource.'
      })
    }
  } catch (err) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      status: 'failed',
      data: 'Failed to authenticate token.'
    })
  }
}

/**
 * Check Query originates from resource with  company or admin rights
 */
exports.isAdmin = async (req, res, next) => {
  try {
    const token = await checkToken(req);
    if (token.status === 'failed') {
      return res.status(token.data).json({
        status: 'failed',
        message: token.message
      })
    }
    if (
      token.data.type === Object.values(UserModel.UserType)[1]
      || token.data.type === Object.values(UserModel.UserType)[2]
    ) {
      next()
    } else {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        status: 'failed',
        data: 'Access not granted to this resource.'
      })
    }
  } catch (err) {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .json({ status: 'failed', data: 'Failed to authenticate token.' })
  }
}

/**
 * Check Query originates from resource with partner or admin rights
 */
exports.isSuperAdmin = async (req, res, next) => {
  try {
    const token = await checkToken(req);
    if (token.status === 'failed') {
      return res.status(token.data).json({
        status: 'failed',
        message: token.message
      })
    }
    if (
      token.data.type === Object.values(UserModel.UserType)[2]
    ) {
      next()
    } else {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        status: 'failed',
        data: 'Access not granted to this resource.'
      })
    }
  } catch (err) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      status: 'failed',
      data: 'Failed to authenticate token.'
    })
  }
}


exports.validateWallet = async (req, res, next) => {
  try {
    const schema = Joi.object().keys({
      account: Joi.string().required().label("Account is required!")
    })

    await Joi.validate(req.body, schema);
    next()

  } catch (error) {
      return res.status(400).json({
        status: 'failed',
        message: error.details,
      })
  }
},

exports.validateWalletAction =  async (req, res, next) => {
  try {
    const schema = Joi.object().keys({
      amount: Joi.number().required().label("Amount is required!"),
      remark: Joi.string().label("Remark must be a string!")
    })

    await Joi.validate(req.body, schema);
    next()
    
  } catch (error) {
    return res.status(400).json({
      status: 'failed',
      message: error.details,
    })
  }
}