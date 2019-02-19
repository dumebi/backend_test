const amqp = require('amqplib/callback_api');

const url = process.env.AMQP_URL || 'amqp://guest:guest@localhost:5672';


function createQueueChannel(queue, cb) {
  function onceConnected(err, conn) {
    if (err) {
      cb(err);
    } else {
      console.log('connected');
    }
  }
  amqp.connect(url, onceConnected);
}

module.exports = createQueueChannel;
