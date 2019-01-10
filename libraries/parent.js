// Import libraries
const Web3 = require('web3')
const contract = require('truffle-contract')
const path = require('path')
const utils = require('../helpers/utils')


// const UserContractJson = require(path.join(
//   __dirname,
//   '../blockchain/build/contracts/SterlingUser.json'
// ))

let coinbase_amount = 0
let coinbase = ''

// Setup RPC connection
const provider = new Web3.providers.HttpProvider(utils.config.blockchain)
// const provider = new Web3.providers.HttpProvider(process.env.GETH);
// var provider = new Web3.providers.HttpProvider(process.env.GETH_SERVER);
const web3 = new Web3(provider)

// Read JSON and attach RPC connection (Provider)
// const UserContract = contract(UserContractJson)
// UserContract.setProvider(provider)

/**
 * Get Coinbase address and amount, store them.
 */
exports.getCoinbase = () => {
  try {
    web3.eth.getCoinbase((err, account) => {
      if (err === null) {
        coinbase = account
        // $('#account').text(account);
        web3.eth.getBalance(account, (error, balance) => {
          if (error === null) {
            coinbase_amount = web3.utils.fromWei(balance, 'ether')
            console.log(coinbase, coinbase_amount)
          }
        })
      }
    })
  } catch (err) {
    console.log(err)
  }
}

exports.web3 = web3
exports.UserContract = UserContract
exports.coinbase = coinbase
exports.coinbase_amount = coinbase_amount
