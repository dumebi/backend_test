// Package Dependencies
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const winston = require('winston');
const cors = require('cors');
const compression = require('compression');
const flash = require('connect-flash');
// const redis = require('redis');
const base = require('./libraries/base')

const app = express();
require('dotenv').config();
require('./helpers/connection').start();

// const client = redis.createClient(process.env.REDIS_URL);
// client.on('connect', () => {
//   console.log('connected to redis server');
// })

// Redis Client Setup
const redis = require('redis');
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  retry_strategy: () => 1000
});
client.on('connect', () => {
  console.log('connected to redis server');
})

// redis-server --maxmemory 10mb --maxmemory-policy allkeys-lru

// logger settings
const appLogger = winston.createLogger({
  transports: [
    new (winston.transports.File)({
      name: 'info-file',
      filename: 'logs/sttp.log',
      level: 'info'
    }),
    new (winston.transports.File)({
      name: 'error-file',
      filename: 'logs/sttp.log',
      level: 'error'
    })
  ]
});

// Midelware stack
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(cors());
app.use(compression());
app.use(flash());
app.use(logger('dev'));


/* Application Routes */
app.use('/v1/', require('./routes'));

// catch 404 and forward to error handler
app.use((req, res, next) => {
  let error = {
    status: 404,
    success: 'failed',
    message: 'Page Not Found'
  };
  next(error);
});

// error handler
app.use((err, req, res, next) => {
  // We log the error internaly
  appLogger.error(err);

  //  Remove Error's `stack` property. We don't want users to see this at the production env
  if (req.app.get('env') !== 'development') {
    delete err.stack;
    delete err.devError;
  }

  const httpErr = err.http
  delete err.http

  // This responds to the request
  res.status(httpErr || 500).json(err);
});

base.getCoinbase()

module.exports = app;
