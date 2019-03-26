const redis = require('redis');
const {promisify} = require('util');
const client = redis.createClient(process.env.REDIS_URL);

client.on('connect', () => {
  console.log('connected to redis server');
})
const { promisify } = require('util');

const getAsync = promisify(client.get).bind(client);

exports.getAsync = getAsync;
exports.client = client;

// const redis = require('redis');
// const {promisify} = require('util');
// const client = redis.createClient(process.env.REDIS_URL);

// module.exports = {
//   ...client,
//   getAsync: promisify(client.get).bind(client),
//   setAsync: promisify(client.set).bind(client),
//   keysAsync: promisify(client.keys).bind(client)
// };
