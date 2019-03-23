// Import libraries
const ethers = require("ethers");
const {config} = require("../helpers/utils");
const ethUtil = require("ethereumjs-util");
const Ganache = require("ganache-cli");

let coinbase_amount = 0;
let coinbase = '';

// Setup RPC connection
const provider = config.blockchain;
const ethProvider = new ethers.providers.JsonRpcProvider("http://localhost:8545")

// const ganache = Ganache.provider();
// const provider = new ethers.providers.Web3Provider(ganache);
// const ethProvider = provider
// const signer = provider.getSigner();

const server = Ganache.server();
server.listen(7545, function(err, blockchain) {
});

/**
 * Get Coinbase address and amount
 */
// exports.getCoinbase = async () => {
//   try {
//     // console.log('coinbase')
//     web3.eth.getCoinbase((err, account) => {
//       if (err === null) {
//         // console.log(err, coinbase)
//         coinbase = account
//         // $('#account').text(account);
//         web3.eth.getBalance(account, (error, balance) => {
//           if (error === null) {
//             console.log(error, balance)
//             coinbase_amount = web3.utils.fromWei(balance, 'ether')
//             console.log(coinbase, coinbase_amount)
//           }
//         })
//       } else {
//         console.log(err)
//       }
//     })
//   } catch (err) {
//     console.log('error')
//     console.log(err)
//   }
// };

exports.ethers = ethers;
exports.ethProvider = ethProvider
exports.provider = provider;
// exports.signer = signer;
// exports.coinbase = coinbase
// exports.coinbase_amount = coinbase_amount
exports.ethUtil = ethUtil
