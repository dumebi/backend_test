// Import libraries
const ethers = require("ethers");
const ethUtil = require("ethereumjs-util");
const Ganache = require("ganache-cli");
const {config} = require('../helpers/utils');

let coinbase_amount = 0;
let coinbase = '';

// Setup RPC connection
const ethProvider = new ethers.providers.JsonRpcProvider("http://10.0.12.71:8545")
 
// async function GanacheGeneralHttpWebSockerServer() {
//     try {
//         const server = await Ganache.server({
//             default_balance_ether : 3000000000,
//             total_accounts : 10,
//             ws : true
//         });
//         server.listen(8545, async function(err, blockchain) {
//             if (err) {
//                 throw err
//             }
//             console.log("blockchain >> ", blockchain)
//             provider = "http://localhost:8545";
//             // console.log(ethProvider)
//         });

//     } catch (error) {
//         console.log("error >> ", error)
//     }
//     // server.listen(8545, function(err, blockchain) {
//     //     console.log("blockchain >> ", blockchain)
//     //     provider = config.blockchain;
//     //     ethProvider = new ethers.providers.Json/RpcProvider("http://localhost:8545")
//     // });
// }
// GanacheGeneralHttpWebSockerServer()

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
// exports.coinbase = coinbase
// exports.coinbase_amount = coinbase_amount
exports.ethUtil = ethUtil
