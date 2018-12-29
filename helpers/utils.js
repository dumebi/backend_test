const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken')
const Constants = require('./constants')
require('dotenv').config();

exports.config = {
  jwt: process.env.JWT_SECRET,
  blockchain: '',
  mongo: '',
  userHost: '',
  adminHost: ''
}

if (process.env.NODE_ENV === 'development') {
  this.config.blockchain = process.env.GANACHE
  this.config.mongo = process.env.MONGO_DB_DEV_EXCHANGE
  this.config.userHost = `http://localhost:${process.env.PORT}/v1/user/`
  this.config.adminHost = `http://localhost:${process.env.PORT}/v1/admin/`
  this.config.db = 'exchange-test'
} else {
  this.config.blockchain = process.env.GETH
  this.config.mongo = process.env.MONGO_DB_PROD_EXCHANGE
  this.config.userHost = `http://localhost:${process.env.PORT}/v1/user/`
  this.config.adminHost = `http://localhost:${process.env.PORT}/v1/admin/`
  this.config.db = 'exchange'
}

exports.sendMail = (params, callback) => {
  const email = params.email;
  // let from_email = params.from_email;
  const body = params.body;
  const subject = params.subject;
  if (email == null || body == null || subject == null) { return { status: 'failed', err: 'the required parameters were not supplied' }; }
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    service: 'Gmail',
    auth: {
      user: 'dikejude49@gmail.com',
      pass: 'dyke2010'
    }
  });

  const mailOptions = {
    from: 'Altmall Support <support@altmall.com>',
    to: email,
    subject,
    html: body
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      callback(error, null);
    } else {
      callback(error, info.response);
    }
  });
}

exports.generateTransactionReference = () => {
  // 463309364588305
  let text = '';
  const possible = '0123456789';
  for (let i = 0; i < 15; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
  return ''.concat(text);
}

exports.paramsNotValid = (...args) => args
  .map(param => param !== undefined && param != null && param !== '')
  .includes(false)

/**
 * Check token was sent
 */
exports.checkToken = async (req) => {
  try {
    let token = null
    if (req.headers.usertoken) {
      token = req.headers.usertoken;
    }
    if (req.params.usertoken) {
      token = req.params.usertoken
    }
    if (req.body.usertoken) {
      token = req.body.usertoken
    }
    if (!token) {
      return {
        status: 'failed',
        data: Constants.UNAUTHORIZED,
        message: 'Not authorized'
      }
    }
    const decryptedToken = await jwt.verify(token, this.config.jwt)
    // if (user_id && decryptedToken.id !== user_id) {
    //   return {
    //     status: 'failed',
    //     data: Constants.UNAUTHORIZED,
    //     message: 'Not authorized'
    //   }
    // }
    return {
      status: 'success',
      data: decryptedToken
    }
  } catch (err) {
    return {
      status: 'failed',
      data: Constants.BAD_REQUEST,
      message: 'failed to authenticate token'
    }
  }
}

/**
 * Create Jwt token
 */
exports.createToken = async (email, id) => {
  try {
    const jwtToken = jwt.sign({ email, id }, this.config.jwt, { expiresIn: 60 * 60 * 24 * 31 });
    return jwtToken
  } catch (error) {
    return false
  }
}
