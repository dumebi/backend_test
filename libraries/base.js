// Import libraries
const ethers = require("ethers");
const ethUtil = require("ethereumjs-util");
const {config} = require("../helpers/utils")

let coinbase_amount = 0;
let coinbase = '';

// Setup RPC connection
const ethProvider = new ethers.providers.JsonRpcProvider(config.blockchain)

exports.ethers = ethers;
exports.ethProvider = ethProvider
exports.coinbase = coinbase
exports.coinbase_amount = coinbase_amount
exports.ethUtil = ethUtil
