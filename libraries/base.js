// Import libraries
const Web3 = require('web3')
const ethers = require("ethers");
const ethUtil = require("ethereumjs-util");
const {config} = require("../helpers/utils")

let coinbase_amount = 0;
let coinbase = '';

// Setup RPC connection
const web3 = new Web3(config.blockchain);
const ethProvider = new ethers.providers.JsonRpcProvider(config.blockchain)
/**
 * Get Coinbase address and amount
 */
exports.getCoinbase = async () => {
  try {
    // console.log('coinbase')
    const account = await web3.eth.getCoinbase() 
        coinbase = account
        const balance = await web3.eth.getBalance(account)
        coinbase_amount = web3.utils.fromWei(balance, 'ether')
        console.log(coinbase, coinbase_amount)
  } catch (err) {
    console.log(err)
  }
};

exports.ethers = ethers;
exports.ethProvider = ethProvider
exports.coinbase = coinbase
exports.coinbase_amount = coinbase_amount
exports.ethUtil = ethUtil
