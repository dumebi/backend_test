// Import lbraries
const UserModel = require('../models/user');
const HttpStatus = require('./status')
const {
  checkToken
} = require('../helpers/utils');

/**
 * Check Query originates from resource with at user rights
 */
exports.isUser = async (req, res, next) => {
  try {
    const token = await checkToken(req);
    if (token.status === 'failed') {
      return res.status(token.data).json({
        status: 'failed',
        message: token.message
      })
    }
    if (
      token.data.type === UserModel.UserType[0]
      || token.user_type === UserModel.UserType[1]
      || token.user_type === UserModel.UserType[2]
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
      token.user_type === UserModel.UserType[1]
      || token.user_type === UserModel.UserType[2]
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
      token.user_type === UserModel.UserType[2]
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
