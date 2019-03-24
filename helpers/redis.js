
const redis = require('redis');

const client = redis.createClient(process.env.REDIS_URL);

client.on('connect', () => {
  console.log('connected to redis server');
})
// console.log("client >> ", client)
const { promisify } = require('util');

const getAsync = promisify(client.get).bind(client);

exports.getAsync = getAsync;
exports.client = client;
