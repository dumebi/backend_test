const HD = require('ethereumjs-wallet')
const bip39 = require('bip39')
var HDKey = require('hdkey')
const ethUtil = require("ethereumjs-util")
const Web3 = require("web3")
const provider = "https://rinkeby.infura.io/afn70dBlA0QivCgkPipn"
const web3 = new Web3(provider)
const EthereumTx = require("ethereumjs-tx")
const axios = require('axios');


module.exports = {

    newMnemonic : function() {
        const mnemonic = bip39.generateMnemonic()
        return mnemonic
    },

    validateMnemonic :function (mnemonic) {
        return bip39.validateMnemonic(mnemonic)
    },

    generateSeed :function (mnemonic) {
        return bip39.mnemonicToSeedHex(mnemonic)
    },

    generateKeys : function (mnemonicSeed) {

        const root = HDKey.fromMasterSeed(new Buffer(mnemonicSeed, 'hex'))

		const childKey = root.derive("m/44'/60'/0'/0/0");
		const childPrivKey = childKey._privateKey; // Child private key
		const childPubKey = ethUtil.privateToPublic(childPrivKey); // 64bits only used to generate child address
		const addr = ethUtil.publicToAddress(childPubKey).toString('hex');
		const childAddress = ethUtil.toChecksumAddress(addr);

		return {
			xmasterPrivateKey : root.privateExtendedKey.toString('hex'),
			childPrivKey: childPrivKey.toString('hex'),
			childPubKey: childKey._publicKey.toString('hex'),
			childAddress: childAddress
		}
    
	},
	
	ethAccountBal : async function (address) {

		try {
			const balance = await web3.eth.getBalance(address)
			const balanceToEther = await web3.utils.fromWei(balance,"ether")
			console.log("balanceToEther >> ", balanceToEther)
			return balanceToEther
			
		} catch (error) {
			console.log(error)
		}
	},
	
	EthAccountTransfer : async function (fromAddress, toAddress, amount, _privateKey ) {

		try {
			
			const isValidFrom = await ethUtil.isValidAddress(fromAddress)
			const isValidTo = await ethUtil.isValidAddress(toAddress)

			if (!isValidFrom) {
				return "Invalid from address"
			} else if (!isValidTo) {
				return "Invalid to address"
			}
			
			const privateKey = Buffer.from(_privateKey, 'hex')
			var nounce = await web3.eth.getTransactionCount(fromAddress)
			const gasUsed = await web3.eth.estimateGas({
				to: toAddress, 
				value: web3.utils.toHex(web3.utils.toWei(amount, "ether")), 
				chainId: 4
			})
			const getCurrentGasPrices = async () => {
				let response = await axios.get('https://ethgasstation.info/json/ethgasAPI.json')
				let prices = {
					low: response.data.safeLow / 10,
					medium: response.data.average / 10,
					high: response.data.fast / 10
				}
				return prices
			}

			const txParams = {
				nonce: nounce++,
				gasLimit: gasUsed,
				to: toAddress, 
				value: web3.utils.toHex(web3.utils.toWei(amount, "ether")), 
				chainId: 4
			}

			const tx = await new EthereumTx(txParams)
			const gasPrice = await getCurrentGasPrices()
			tx.gasPrice = gasPrice.high * 1000000000
			tx.sign(privateKey)
			const serializedTx = tx.serialize()
			const transactionId = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex') )
			console.log("transactionId", transactionId)
			return transactionId

		} catch (error) {
			console.log("error >> ", error)
		}
	
	}
	
}
