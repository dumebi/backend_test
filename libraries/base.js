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
    web3.eth.getCoinbase((err, account) => {
      if (err === null) {
        console.log(err, coinbase)
        coinbase = account
        web3.eth.getBalance(account, (error, balance) => {
          if (error === null) {
            console.log(error, balance)
            coinbase_amount = web3.utils.fromWei(balance, 'ether')
            console.log(coinbase, coinbase_amount)
          }
        })
      } else {
        console.log(err)
      }
    })
  } catch (err) {
    console.log('error')
    console.log(err)
  }
};

exports.ethers = ethers;
exports.ethProvider = ethProvider
exports.coinbase = coinbase
exports.coinbase_amount = coinbase_amount
exports.ethUtil = ethUtil
