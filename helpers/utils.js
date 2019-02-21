<<<<<<< HEAD
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken')
const Constants = require('./status')
require('dotenv').config();

exports.config = {
  jwt: process.env.JWT_SECRET,
  blockchain: '',
  mongo: '',
  host: '',
  amqp_url: ''
}

if (process.env.NODE_ENV === 'development') {
  this.config.blockchain = process.env.GANACHE
  this.config.mongo = process.env.MONGO_LAB_DEV_EXCHANGE
  this.config.host = `http://localhost:${process.env.PORT}/v1/`
  this.config.db = 'STTP'
  this.config.amqp_url = `${process.env.AMQP_URL}`
} else {
  this.config.blockchain = process.env.GETH
  this.config.mongo = process.env.MONGO_LAB_PROD_EXCHANGE
  this.config.host = `http://localhost:${process.env.PORT}/v1/`
  this.config.db = 'STTP'
  this.config.amqp_url = `${process.env.AMQP_URL}`
=======
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const Constants = require("./status");
const config = require("../config");
// require("dotenv").config();

exports.config = {
  jwt: config.JWT_SECRET,
  blockchain: "",
  mongo: "",
  userHost: "",
  adminHost: ""
};
if (config.NODE_ENV === "development") {
  this.config.blockchain = config.GANACHE;
  this.config.mongo = config.MONGO_LAB_DEV_EXCHANGE;
  this.config.userHost = `http://localhost:${config.PORT}/v1/user/`;
  this.config.adminHost = `http://localhost:${config.PORT}/v1/admin/`;
  this.config.db = "exchange-test";
} else {
  this.config.blockchain = config.GETH;
  this.config.mongo = config.MONGO_DB_PROD_EXCHANGE;
  this.config.userHost = `http://localhost:${config.PORT}/v1/user/`;
  this.config.adminHost = `http://localhost:${config.PORT}/v1/admin/`;
  this.config.db = "exchange";
>>>>>>> 36a8fee4e427f91acf3ace77e9a415ba266e0945
}

exports.sendMail = (params, callback) => {
  const email = params.email;
  // let from_email = params.from_email;
  const body = params.body;
  const subject = params.subject;
  if (email == null || body == null || subject == null) {
    return {
      status: "failed",
      err: "the required parameters were not supplied"
    };
  }
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    service: "Gmail",
    auth: {
      user: "dikejude49@gmail.com",
      pass: "dyke2010"
    }
  });

  const mailOptions = {
<<<<<<< HEAD
    from: 'Sterling Support <support@sterlingbankng.com>',
=======
    from: "Sterling Support <support@sterlingbankng.com>",
>>>>>>> 36a8fee4e427f91acf3ace77e9a415ba266e0945
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
};

exports.generateTransactionReference = () => {
  // 463309364588305
  let text = "";
  const possible = "0123456789";
  for (let i = 0; i < 15; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return "".concat(text);
};

exports.paramsNotValid = (...args) =>
  args
    .map(param => param !== undefined && param != null && param !== "")
    .includes(false);

/**
 * Check token was sent
 */
exports.checkToken = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization) {
      token = req.headers.authorization;
      const tokenArray = token.split(" ");
      token = tokenArray[1];
    }
    if (req.query.token) {
      token = req.query.token;
    }
    if (req.body.token) {
<<<<<<< HEAD
      token = req.body.token
=======
      token = req.body.token;
>>>>>>> 36a8fee4e427f91acf3ace77e9a415ba266e0945
    }
    if (!token) {
      return {
        status: "failed",
        data: Constants.UNAUTHORIZED,
        message: "Not authorized"
      };
    }
    const decryptedToken = await jwt.verify(token, this.config.jwt);
    // if (user_id && decryptedToken.id !== user_id) {
    //   return {
    //     status: 'failed',
    //     data: Constants.UNAUTHORIZED,
    //     message: 'Not authorized'
    //   }
    // }
    // let dateNow = new Date()
    // console.log(isExpiredToken)
    return {
      status: "success",
      data: decryptedToken
<<<<<<< HEAD
    }
=======
    };
>>>>>>> 36a8fee4e427f91acf3ace77e9a415ba266e0945
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return {
        status: "failed",
        data: Constants.UNAUTHORIZED,
        message: "Token expired"
      };
    }
    return {
      status: "failed",
      data: Constants.UNAUTHORIZED,
<<<<<<< HEAD
      message: 'failed to authenticate token'
    }
=======
      message: "failed to authenticate token"
    };
>>>>>>> 36a8fee4e427f91acf3ace77e9a415ba266e0945
  }
};

/**
 * Create Jwt token
 */
exports.createToken = (email, id, type) => {
  try {
<<<<<<< HEAD
    const jwtToken = jwt.sign({ email, id, type }, this.config.jwt, { expiresIn: 60 * 60 * 24 });
    return jwtToken
=======
    const jwtToken = jwt.sign({ email, id, type }, this.config.jwt, {
      expiresIn: 60 * 60 * 24
    });
    return jwtToken;
>>>>>>> 36a8fee4e427f91acf3ace77e9a415ba266e0945
  } catch (error) {
    return false;
  }
};
