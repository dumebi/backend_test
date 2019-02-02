const redis = require('redis');

const client = redis.createClient();
const { promisify } = require('util');

const getAsync = promisify(client.get).bind(client);

exports.getAsync = getAsync;
exports.client = client;
