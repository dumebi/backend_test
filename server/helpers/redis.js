const redis = require('redis');

const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  retry_strategy: () => 1000
});
const { promisify } = require('util');

const getAsync = promisify(client.get).bind(client);

exports.getAsync = getAsync;
exports.client = client;
