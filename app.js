// Package Dependencies
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const winston = require('winston');
const cors = require('cors');
const compression = require('compression');
const flash = require('connect-flash');
const redis = require('redis');

const app = express();
require('dotenv').config();
require('./helpers/connection');

const client = redis.createClient();
client.on('connect', () => {
  console.log('connected to redis server');
})

// redis-server --maxmemory 10mb --maxmemory-policy allkeys-lru

//logger settings
var logger = new (winston.Logger)({
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
app.use(function(req, res, next) {
    var error = {
      status : 404,
      success : false,
      errMsg : "Page Not Found"
    };
    next(error);
  });

// error handler
app.use(function(err, req, res, next) {
  
    //We log the error internaly 
    logger.error(err);
  
    //  Remove Error's `stack` property. We don't want users to see this at the production env
    if (req.app.get('env') !== 'development') {
        delete err.stack;
        delete err.devError;
    }
        
    // This responds to the request 
        res.status(err.status || 500).json(err);
  });

module.exports = app;
