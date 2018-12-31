const {
  getAsync,
  client
} = require('../helpers/redis');

const {
  web3,
  UserContract,
  coinbase
} = require('../libraries/parent');

/**
 * Create a blockchain account for a user
 * @param {model} UserModel
 * @param {id} id
 */
exports.createAccount = async () => {
  try {
    const address = await web3.eth.personal.newAccount('pass@123')
    await this.transferCoins(coinbase, address)
    return address
  } catch (err) {
    console.log(err)
  }
}

/**
 * Check and cresit account if balance is low
 * @param {string} address
 */
exports.checkCredit = async (address) => {
  try {
    await web3.eth.personal.unlockAccount(address, 'pass@123', 1000)
    let balance = await web3.eth.getBalance(address)
    balance = web3.utils.fromWei(balance, 'ether')
    if (balance < 5) {
      const addrBal = await this.transferCoins(coinbase, address)
      return addrBal
    }
    return balance
  } catch (err) {
    console.log(err)
  }
}

/**
 * Transfer crypto from coinbase to an address
 * @param {string} coinbase_address
 * @param {string} address
 */
exports.transferCoins = async (coinbase_address, address) => {
  try {
    await web3.eth.personal.unlockAccount(coinbase_address, 'pass@123', 100000)
    await web3.eth.personal.unlockAccount(address, 'pass@123', 1000)
    const result = await web3.eth.sendTransaction({
      from: coinbase_address,
      to: address,
      value: web3.utils.toWei('10', 'ether')
    })
    if (result) {
      // console.log("sent money");
      // console.log(result)
      // const coinbaseBal = await web3.eth.getBalance(coinbase_address);
      // console.log("coinbase balance" + web3.utils.fromWei(coinbaseBal, "ether") + " ETH");
      const addressBal = await web3.eth.getBalance(address)
      // console.log("address balance" + web3.utils.fromWei(addressBal, "ether") + " ETH");
      return web3.utils.fromWei(addressBal, 'ether')
    }
  } catch (err) {
    console.log(err)
  }
}

// /**
//  * Add a User
//  * @param {object} deal
//  */
// exports.addUser = async (user) => {
//   try {
//     await web3.eth.personal.unlockAccount(user.address, 'pass@123', 1000)
//     // let price = `${deal.price}`;
//     const instance = await UserContract.deployed()
//     const result = await instance.postDeal(
//       deal.offer,
//       deal.seller,
//       deal.buyer,
//       deal.shipmentdate,
//       deal.origin,
//       deal.destination,
//       {
//         from: deal.seller,
//         gas: 3000000
//       }
//     )
//     console.log(result)
//     const posted_deal = await this.getDeal(result.logs[0].args._id)
//     if (posted_deal != null) {
//       await this.addDealCache(posted_deal)
//     }
//     return posted_deal
//   } catch (err) {
//     console.log('user posted deal err')
//     console.log(err)
//     return false
//   }
// }

// /**
//  * Update a deal
//  * @param {string} address
//  * @param {object} deal
//  */
// exports.updateDeal = async (deal) => {
//   try {
//     await web3.eth.personal.unlockAccount(deal.seller, 'pass@123', 1000)
//     // let price = `${deal.price}`;
//     const instance = await UserContract.deployed()
//     await instance.updateDeal(
//       deal.offer,
//       deal.seller,
//       deal.buyer,
//       deal.shipmentdate,
//       deal.origin,
//       deal.destination, {
//         from: deal.seller,
//         gas: 3000000
//       }
//     )
//     const updatedDeal = await this.updateDealCache(deal.id)
//     return updatedDeal
//   } catch (err) {
//     console.log(err)
//     return false
//   }
// }

// /**
//  * Get all deals
//  */
// exports.getDeals = async () => {
//   try {
//     let deals = []
//     const result = await getAsync('comflodeals');
//     if (result != null && JSON.parse(result).length > 0) {
//       deals = JSON.parse(result);
//     } else {
//       const instance = await UserContract.deployed()
//       const noDeals = await instance.getNoOfDeals()

//       const promises = [];
//       for (let i = 1; i <= noDeals; i++) {
//         promises.push(instance.deals(i))
//       }
//       deals = await Promise.all(promises);
//       await client.set('comflodeals', JSON.stringify(deals));
//     }
//     return deals
//   } catch (err) {
//     console.log(err)
//     return false
//   }
// }

// /**
//  * Get deal
//  * @param {int} id
//  */
// exports.getDeal = async (id) => {
//   try {
//     const instance = await UserContract.deployed()
//     const deal = await instance.deals(id)
//     return deal
//   } catch (err) {
//     console.log(err)
//     return false
//   }
// }

// exports.updateDealCache = async (id) => {
//   try {
//     const instance = await UserContract.deployed()
//     const result = await getAsync('comflodeals');
//     let deal;
//     if (result != null && JSON.parse(result).length > 0) {
//       const deals = JSON.parse(result);
//       deal = await instance.deals(id)
//       deals[parseInt(id, 10) - 1] = deal
//       await client.set('comflodeals', JSON.stringify(deals));
//     } else {
//       deal = await this.getDeal(deal.id)
//     }
//     return deal;
//   } catch (err) {
//     console.log(err)
//     return false
//   }
// }

// exports.addDealCache = async (deal) => {
//   try {
//     const comflodeals = await getAsync('comflodeals');
//     if (comflodeals != null && JSON.parse(comflodeals).length > 0) {
//       const deals = JSON.parse(comflodeals);
//       deals.push(deal)
//       await client.set('comflodeals', JSON.stringify(deals));
//     }
//   } catch (err) {
//     console.log(err)
//   }
// }
