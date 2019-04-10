// Import lbraries
const UserModel = require('../models/user');
const HttpStatus = require('./status')
require('dotenv').config();
const {
  checkToken,
  config
} = require('../helpers/utils');
const ethUser = require('../libraries/ethUser')
const { Token } = require("../libraries/tokenContract");
const secure = require('../helpers/encryption.js');

/**
 * Check Query originates from resource with at user rights
 */
exports.isUser = async (req, res, next) => {
  // console.log("req > ", req, "res > ", res, "next > ", next)
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
 * Check Query originates from resource with admin rights
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
      req.jwtUser = token.data.id
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


/**
 * Pre-fund Users blockchain account, for transaction gas
 */
exports.fundAcctFromCoinbase = async (req, res, next) => {
  try {
    const userId = req.jwtUser
    const user = await UserModel.findById(userId)
    
    const etherBalance = await ethUser.balance(user.address)
    console.log("etherBalance >> ", etherBalance)
    if (etherBalance >= 90000) {
      return next()
    }
    const transfered = await ethUser.transfer(user.address, "1000000", config.coinbaseKey)
    console.log("transfered >> ", transfered)
    return next()

  } catch (err) {
    console.log("err >> ", err)
    return res.status(HttpStatus.SERVER_ERROR).json({
      status: 'failed',
      data: 'Server error!.'
    })
  }
}

/**
   * Token Contract
   */
  const _initializeToken = async (userId) => {
    try {
      const user = await UserModel.findById(userId).select('+privateKey')
      const privateKey = await secure.decrypt(user.privateKey)
      const sit = new Token('0x'+privateKey);
      return sit
  
    } catch (error) {
      console.log("err >> ", error)
      throw error
    }
  }
  exports._initializeToken = _initializeToken

/**
 * Initialize Token Contract
 */
exports.initializeToken = async (req, res, next) => {
  try {
    const token = await checkToken(req);
    const sit = await _initializeToken(token.data.id)
    req.SIT = sit

    return next()

  } catch (err) {
    console.log("err >> ", err)
    return res.status(HttpStatus.SERVER_ERROR).json({
      status: 'failed',
      data: 'Server error!.'
    })
  }
}

