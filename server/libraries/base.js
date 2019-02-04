// Import libraries
const Web3 = require('web3')
const contract = require('truffle-contract')
const path = require('path')
const ethUtil = require("ethereumjs-util")
const EthereumTx = require("ethereumjs-tx")
const utils = require('../helpers/utils')


// const UserContractJson = require(path.join(
//   __dirname,
//   '../blockchain/build/contracts/SterlingUser.json'
// ))

let coinbase_amount = 0
let coinbase = ''

// Setup RPC connection
const provider = utils.config.blockchain
const web3 = new Web3(provider)

console.log(provider)

// Read JSON and attach RPC connection (Provider)
// const UserContract = contract(UserContractJson)
// UserContract.setProvider(provider)

/**
 * Get Coinbase address and amount, store them.
 */
exports.getCoinbase = () => {
  console.log('coinbase')
  try {
    web3.eth.getCoinbase((err, account) => {
      if (err === null) {
        console.log(err, coinbase)
        coinbase = account
        // $('#account').text(account);
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
}

exports.web3 = web3
// exports.UserContract = UserContract
exports.coinbase = coinbase
exports.coinbase_amount = coinbase_amount
exports.ethUtil = ethUtil
exports.EthereumTx = EthereumTx
