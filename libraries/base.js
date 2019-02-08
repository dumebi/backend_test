// Import libraries
const Web3 = require("web3");
const utils = require("../helpers/utils");
const ethUtil = require("ethereumjs-util");
const EthereumTx = require("ethereumjs-tx");

let coinbase_amount = 0;
let coinbase = "";

// Setup RPC connection
const provider = utils.config.blockchain;
const wsProvider = new Web3.providers.WebsocketProvider("ws://localhost:7545");
const web3 = new Web3(wsProvider);
// const ganache = require("ganache-cli");
// const server = ganache.server();
// server.listen(7545, function(err, blockchain) {
//   console.log("blockchain >> ", blockchain);
// });

/**
 * Get Coinbase address and amount, store them.
 */
exports.getCoinbase = () => {
  try {
    web3.eth.getCoinbase((err, account) => {
      if (err === null) {
        coinbase = account;
        web3.eth.getBalance(account, (error, balance) => {
          if (error === null) {
            coinbase_amount = web3.utils.fromWei(balance, "ether");
          }
        });
      }
    });
  } catch (err) {
    console.log(err);
  }
};

exports.web3 = web3;
exports.coinbase = coinbase;
exports.coinbase_amount = coinbase_amount;
exports.ethUtil = ethUtil;
exports.EthereumTx = EthereumTx;
