const express = require('express');
const path = require('path');
const compression = require('compression');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const cors = require('cors');
const bluebird = require('bluebird');
const bodyParser = require('body-parser')

const app = express();
require('dotenv').config();
const redis = require('redis');
const utils = require('./helpers/utils');

// const client = redis.createClient({
//   port: 19768,
//   host: 'redis-19768.c14.us-east-1-3.ec2.cloud.redislabs.com',
//   password: 'your password'
// });

const client = redis.createClient();
client.on('connect', () => {
  console.log('connected to redis server');
})

// redis-server --maxmemory 10mb --maxmemory-policy allkeys-lru

mongoose.Promise = bluebird;
const connectWithRetry = () => {
  mongoose
    .connect(
      utils.config.mongo,
      {
        keepAlive: true,
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        reconnectTries: Number.MAX_VALUE,
        reconnectInterval: 500
      }
    )
    .then(() => {
      console.log('MongoDB is connected')
    })
    .catch((err) => {
      console.log(err)
      console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
      setTimeout(connectWithRetry, 5000)
    })
}
connectWithRetry()

app.use(cors());
app.use(compression());
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
  extended: true
}));
app.use(flash());

/* Application Routes */
app.use('/v1/', require('./routes'));

app.use(express.static(path.join(__dirname, 'node_modules')));
const port = process.env.PORT;

app.listen(port);
console.log(`server started ${port}`);
