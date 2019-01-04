const {web3, EthereumTx, ethUtil} = require("./base.js")
const axios = require('axios')

const deployedContractAddr = "0x0230033f2e71cc61d09b922039af91474f51913c"
const contractABI = [
	{
		"constant": false,
		"inputs": [
			{
				"name": "_user",
				"type": "address"
			}
		],
		"name": "addAuthorizer",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_holder",
				"type": "address"
			},
			{
				"name": "_holderAccess",
				"type": "bool"
			},
			{
				"name": "_beneficiary",
				"type": "string"
			},
			{
				"name": "_tadableBal",
				"type": "uint256"
			},
			{
				"name": "_allocatedBal",
				"type": "uint256"
			},
			{
				"name": "_vestingBal",
				"type": "uint256"
			},
			{
				"name": "_lienBal",
				"type": "uint256"
			}
		],
		"name": "addSitHolder",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_spender",
				"type": "address"
			},
			{
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [
			{
				"name": "success",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_holder",
				"type": "address"
			}
		],
		"name": "disableHolder",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_holder",
				"type": "address"
			}
		],
		"name": "enableHolder",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_user",
				"type": "address"
			}
		],
		"name": "removeAuthorizer",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_maxTotalSupply",
				"type": "uint256"
			}
		],
		"name": "setMaxSupply",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_to",
				"type": "address"
			},
			{
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_from",
				"type": "address"
			},
			{
				"name": "_to",
				"type": "address"
			},
			{
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"name": "_symbol",
				"type": "string"
			},
			{
				"name": "_name",
				"type": "string"
			},
			{
				"name": "_total",
				"type": "uint256"
			},
			{
				"name": "_maxSupply",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "__holder",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "__holderAccess",
				"type": "bool"
			}
		],
		"name": "NewSitHolder",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "__holder",
				"type": "address"
			}
		],
		"name": "SitHolderEnabled",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "__holder",
				"type": "address"
			}
		],
		"name": "SitHolderDisabled",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "_from",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "_to",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "_amount",
				"type": "uint256"
			},
			{
				"indexed": true,
				"name": "_date",
				"type": "uint256"
			}
		],
		"name": "NewTradable",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "Maxsupply",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "_authorizer",
				"type": "address"
			}
		],
		"name": "NewAuthorizer",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "_authorizer",
				"type": "address"
			}
		],
		"name": "AuthorizerRemoved",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "_from",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "_to",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "_value",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "_owner",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "_spender",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "_value",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "address"
			},
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "allocations",
		"outputs": [
			{
				"name": "amount",
				"type": "uint256"
			},
			{
				"name": "dueDate",
				"type": "uint256"
			},
			{
				"name": "isMovedToTradable",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_owner",
				"type": "address"
			},
			{
				"name": "_spender",
				"type": "address"
			}
		],
		"name": "allowance",
		"outputs": [
			{
				"name": "remaining",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_holder",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "decimals",
		"outputs": [
			{
				"name": "",
				"type": "uint8"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "getMaxSupply",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_holder",
				"type": "address"
			}
		],
		"name": "getSitHolder",
		"outputs": [
			{
				"name": "_isEnabled",
				"type": "bool"
			},
			{
				"name": "_beneficiary",
				"type": "bytes32"
			},
			{
				"name": "_tradable",
				"type": "uint256"
			},
			{
				"name": "_allocated",
				"type": "uint256"
			},
			{
				"name": "_vesting",
				"type": "uint256"
			},
			{
				"name": "_lien",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_user",
				"type": "address"
			}
		],
		"name": "isAuthorizer",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "isOwner",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_holder",
				"type": "address"
			}
		],
		"name": "isValidSitHolder",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "address"
			},
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "liens",
		"outputs": [
			{
				"name": "amount",
				"type": "uint256"
			},
			{
				"name": "startDate",
				"type": "uint256"
			},
			{
				"name": "endDate",
				"type": "uint256"
			},
			{
				"name": "lienPeriod",
				"type": "uint256"
			},
			{
				"name": "isMovedToTradable",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"name": "",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "random",
		"outputs": [
			{
				"name": "",
				"type": "uint8"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_holder",
				"type": "address"
			}
		],
		"name": "SitHolderBalance",
		"outputs": [
			{
				"name": "_tradable",
				"type": "uint256"
			},
			{
				"name": "_allocated",
				"type": "uint256"
			},
			{
				"name": "_inVesting",
				"type": "uint256"
			},
			{
				"name": "_onLien",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"name": "",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "totalSupply",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "address"
			},
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "tradables",
		"outputs": [
			{
				"name": "amount",
				"type": "uint256"
			},
			{
				"name": "dateGiven",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_from",
				"type": "address"
			},
			{
				"name": "_to",
				"type": "address"
			}
		],
		"name": "verifyTransfer",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "address"
			},
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "vestings",
		"outputs": [
			{
				"name": "amount",
				"type": "uint256"
			},
			{
				"name": "dateGiven",
				"type": "uint256"
			},
			{
				"name": "isMovedToTradable",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	}
]
const contractInst = new web3.eth.Contract(contractABI, deployedContractAddr)

const getCurrentGasPrices = async () => {
    let response = await axios.get('https://ethgasstation.info/json/ethgasAPI.json')
    let prices = {
        low: response.data.safeLow / 10,
        medium: response.data.average / 10,
        high: response.data.fast / 10
    }
    return prices
}

module.exports = {

    getAdminBal : async (fromAddress) => {
        try {

            const result = await contractInst.methods.balanceOf(fromAddress).call({from : fromAddress})

            return result

        } catch (error) {
            throw error
        }
    },
    getHolderBal : async (fromAddress) => {
        try {

            const result = await contractInst.methods.SitHolderBalance(fromAddress).call({from : fromAddress})

            return result

        } catch (error) {
            throw error
        }
    },
    addSitHolder : async (_privateKey, fromAddress, holder, isEnabled, beneficiary, tradable = 0, allocated = 0, vesting = 0, lien = 0) => {
        try {
            
            const isValidHolder = await web3.utils.isAddress(holder)

			if (!isValidHolder) {
				return "Invalid from address"
            } 
            
            if (isNaN(tradable) || isNaN(allocated) || isNaN(vesting || isNaN(lien))) {
                return "SIT balances must be a number"
            }


			const gasPrice = await getCurrentGasPrices()

            const data = await contractInst.methods.addSitHolder(holder, isEnabled, beneficiary, tradable, allocated, vesting, lien).encodeABI()

            const privateKey = Buffer.from(_privateKey, 'hex')

            var nounce = await web3.eth.getTransactionCount(fromAddress)
            
			const gasUsed = await contractInst.methods.addSitHolder(holder, isEnabled, beneficiary, tradable, allocated, vesting, lien).estimateGas({
				from: fromAddress,
			})
           
			const txParams = {
				nonce: nounce++,
				gas: 190000,
                from: fromAddress,
                to : deployedContractAddr,
                data,
				chainId: 4
			}

            const tx = await new EthereumTx(txParams)

            tx.gasPrice = gasPrice.high * 1000000000
            tx.sign(privateKey)
            
			const serializedTx = tx.serialize()
            const transactionId = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex') )
        
			return transactionId

        } catch (error) {
            throw error
        }

    }
}