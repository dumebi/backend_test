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


/**
 * Pre-fund Users blockchain account, for transaction gas
 */
exports.fundAcctFromCoinbase = async (req, res, next) => {
  try {
    const token = await checkToken(req);
    const user = await UserModel.findById(token.data.id)
    
    const etherBalance = await ethUser.balance(user.address)
    if (etherBalance <= "90000") {
      return next()
    }
    const transfered = await ethUser.transfer(user.address,"3000000000",config.coinbaseKey)
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
 * Initialize Token Contract
 */
exports.initializeToken = async (req, res, next) => {
  try {
    const token = await checkToken(req);
    const user = await UserModel.findById(token.data.id).select('+privateKey')
    
    const privateKey = await secure.decrypt(user.privateKey)
    const sit = new Token('0x'+privateKey);
    
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
