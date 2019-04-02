const mongoose = require('mongoose');
const socketio = require('socket.io');
const io = require('socket.io-client');

const server = socketio.listen(3001);
const TokenController = require('../controllers/token');
const utils = require('../helpers/utils');
const RabbitMQ = require('./rabbitmq')
const subscriber = require('./rabbitmq')

const TxModel = require('../models/onchainTx');

const { addUserOrUpdateCache } = require('../controllers/user');
const { create_schedule_on_blockchain } = require('../helpers/schedule');
const { sendUserToken, sendUserSignupEmail } = require('../helpers/emails');
const { sendMail } = require('../helpers/utils');
require('dotenv').config();

// Socket config
const ioClient = io.connect('http://localhost:3001');
module.exports = {
  mongo() {
    mongoose.promise = global.promise;
    mongoose
      .connect(utils.config.mongo, {
        keepAlive: true,
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        reconnectTries: Number.MAX_VALUE,
        reconnectInterval: 500
      })
      .then(() => {
        console.log('MongoDB is connected')
      })
      .catch((err) => {
        console.log(err)
        console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
        setTimeout(this.mongo, 5000)
      })
  },
  async rabbitmq() {
    RabbitMQ.init(utils.config.amqp_url);
  },
  async subscribe() {
    await subscriber.init(utils.config.amqp_url);

    // Add to redis cache
    subscriber.consume('ADD_OR_UPDATE_USER_STTP_CACHE', (msg) => {
      const data = JSON.parse(msg.content.toString());
      console.log('ADD_OR_UPDATE_USER_STTP_CACHE')
      addUserOrUpdateCache(data.newUser)
      subscriber.acknowledgeMessage(msg);
    }, 3);

    // Create lien to the blockchain
    subscriber.consume('CREATE_LIEN_BLOCKCHAIN', (msg) => {
      const data = JSON.parse(msg.content.toString());
      // console.log(msg.content.toString());
      
    }, 3);

    // Schedule..
    subscriber.consume('CREATE_SCHEDULE_ON_BLOCKCHAIN', async (msg) => {
      const data = JSON.parse(msg.content.toString());
      const result = await create_schedule_on_blockchain(data.userId, data.scheduleId, data.amount, data.scheduleType, data.reason)

      // If fails return false and delete by id from mongodb

      // save to transaction
      var tx = await new TxModel()

      tx.user = data.userId
      tx.description = 'Created a new schedule'
      tx.type = 'New Schedule'
      tx.from = result.transactionDetails.from
      tx.to = result.transactionDetails.to
      tx.txHash = result.transactionDetails.hash

      await tx.save()

      // Return success to use via socket

      ioClient.emit('broadcast', { user: data.user, message: 'Schedule created successfully' })
      subscriber.acknowledgeMessage(msg);
      
      
    }, 3);

    // Send User Signup Mail
    subscriber.consume('SEND_USER_STTP_SIGNUP_EMAIL', (msg) => {
      const data = JSON.parse(msg.content.toString());
      const userTokenMailBody = sendUserSignupEmail(data.user, data.link)
      const mailparams = {
        email: data.user.email,
        body: userTokenMailBody,
        subject: 'Activate your account'
      };
      sendMail(mailparams, (error, result) => {
        console.log(error)
        console.log(result)
      });
      subscriber.acknowledgeMessage(msg);
    }, 3);

    // Send User Token Mail
    subscriber.consume('SEND_USER_STTP_TOKEN_EMAIL', (msg) => {
      const data = JSON.parse(msg.content.toString());
      const userTokenMailBody = sendUserToken(data.user, data.token)
      const mailparams = {
        email: data.user.email,
        body: userTokenMailBody,
        subject: 'Recover your password'
      };
      sendMail(mailparams, (error, result) => {
        console.log(error)
        console.log(result)
      });
      subscriber.acknowledgeMessage(msg);
    }, 3);

    /**
     * Token Exchange
     */
    // Limit Buy token
    subscriber.consume('LIMIT_BUY', async (msg) => {
      const data = JSON.parse(msg.content.toString());
      const result = await TokenController.limitBuy(data.token, data.price, data.user, data.amount)
      console.log(result)
      ioClient.emit('broadcast', { user: data.user, result })
      subscriber.acknowledgeMessage(msg);
    }, 3);

    // Market Buy token
    subscriber.consume('MARKET_BUY', async (msg) => {
      const data = JSON.parse(msg.content.toString());
      const result = await TokenController.marketBuy(data.token, data.user, data.amount)
      console.log(result)
      ioClient.emit('broadcast', { user: data.user, result })
      subscriber.acknowledgeMessage(msg);
    }, 3);

    // Limit Sell token
    subscriber.consume('LIMIT_SELL', async (msg) => {
      const data = JSON.parse(msg.content.toString());
      const result = await TokenController.limitSell(data.token, data.price, data.user, data.amount)
      console.log(result)
      ioClient.emit('broadcast', { user: data.user, result })
      subscriber.acknowledgeMessage(msg);
    }, 3);

    // Market Sell token
    subscriber.consume('MARKET_SELL', async (msg) => {
      const data = JSON.parse(msg.content.toString());
      const result = await TokenController.marketSell(data.token, data.user, data.amount)
      console.log(result)
      ioClient.emit('broadcast', { user: data.user, result })
      subscriber.acknowledgeMessage(msg);
    }, 3);
  },
  async socket() {
    server.on('connection', (socket) => {
      console.info(`Client connected [id=${socket.id}]`);

      // Broadcast to all connected sockets
      socket.on('broadcast', (message) => {
        server.emit('message', message)
      });
      // when socket disconnects, remove it from the list:
      socket.on('disconnect', () => {
        // sequenceNumberByClient.delete(socket);
        console.info(`Client gone [id=${socket.id}]`);
      });
    });
  }
}
