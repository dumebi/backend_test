// Package Dependencies
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const winston = require('winston');
const cors = require('cors');

// Routes Dependencies
const usersRouter = require('./routes/users');

const app = express();

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
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Request Routes
app.use('/users', usersRouter);

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
