const { web3, EthereumTx, ethUtil } = require("./base.js");
const axios = require("axios");
const { encrypt, decrypt } = require("../helpers/encryption.js");

const deployedContractAddr = "0x8dbf2b7a5ed19e1baed4e8d44c3aa24fea6e6d61";
const contractABI = [
  {
    constant: false,
    inputs: [
      {
        name: "_scheduleId",
        type: "uint256"
      },
      {
        name: "_amount",
        type: "uint256"
      },
      {
        name: "_scheduleType",
        type: "uint8"
      },
      {
        name: "_data",
        type: "bytes"
      }
    ],
    name: "createSchedule",
    outputs: [
      {
        name: "scheduleId",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_spender",
        type: "address"
      },
      {
        name: "_amount",
        type: "uint256"
      }
    ],
    name: "approve",
    outputs: [
      {
        name: "success",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "_code",
        type: "uint8"
      }
    ],
    name: "messageExists",
    outputs: [
      {
        name: "exist",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_holder",
        type: "address"
      },
      {
        name: "_amount",
        type: "uint256"
      },
      {
        name: "_sitCat",
        type: "uint8"
      },
      {
        name: "_reason",
        type: "bytes"
      }
    ],
    name: "withdraw",
    outputs: [
      {
        name: "reason",
        type: "bytes"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "sSymbol",
    outputs: [
      {
        name: "",
        type: "string"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_from",
        type: "address"
      },
      {
        name: "_to",
        type: "address"
      },
      {
        name: "_amount",
        type: "uint256"
      }
    ],
    name: "transferFrom",
    outputs: [
      {
        name: "success",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "aCoinbaseAcct",
    outputs: [
      {
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_scheduleId",
        type: "uint256"
      },
      {
        name: "_scheduleType",
        type: "uint8"
      }
    ],
    name: "getSchedule",
    outputs: [
      {
        name: "amount",
        type: "uint256"
      },
      {
        name: "activeAmount",
        type: "uint256"
      },
      {
        name: "isApproved",
        type: "bool"
      },
      {
        name: "isRejected",
        type: "bool"
      },
      {
        name: "isActive",
        type: "bool"
      },
      {
        name: "scheduleType",
        type: "uint8"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "_holder",
        type: "address"
      }
    ],
    name: "isWithhold",
    outputs: [
      {
        name: "",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "uGranularity",
    outputs: [
      {
        name: "",
        type: "uint8"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_holder",
        type: "address"
      },
      {
        name: "_sitCat",
        type: "uint8"
      },
      {
        name: "_catIndex",
        type: "uint256"
      }
    ],
    name: "getRecordByCat",
    outputs: [
      {
        name: "amount",
        type: "uint256"
      },
      {
        name: "dateAdded",
        type: "uint256"
      },
      {
        name: "lienPeriod",
        type: "uint256"
      },
      {
        name: "isMovedToTradable",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_holder",
        type: "address"
      },
      {
        name: "_sitCat",
        type: "uint8"
      },
      {
        name: "_catIndex",
        type: "uint256"
      }
    ],
    name: "moveToTradable",
    outputs: [
      {
        name: "success",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "_approver",
        type: "address"
      }
    ],
    name: "isAuthorizer",
    outputs: [
      {
        name: "",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_errorString",
        type: "string"
      },
      {
        name: "_message",
        type: "string"
      }
    ],
    name: "addMessage",
    outputs: [
      {
        name: "errorString",
        type: "string"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_scheduleId",
        type: "uint256"
      },
      {
        name: "_reason",
        type: "bytes"
      }
    ],
    name: "rejectSchedule",
    outputs: [
      {
        name: "scheduleId",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_beneficiary",
        type: "bytes32"
      }
    ],
    name: "changeBeneficiary",
    outputs: [
      {
        name: "success",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "_tokenOwner",
        type: "address"
      }
    ],
    name: "balanceOf",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_errorString",
        type: "string"
      },
      {
        name: "_message",
        type: "string"
      }
    ],
    name: "updateMessage",
    outputs: [
      {
        name: "success",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_scheduleId",
        type: "uint256"
      },
      {
        name: "_authorizerIndex",
        type: "uint256"
      }
    ],
    name: "getScheduleAuthorizer",
    outputs: [
      {
        name: "authorizer",
        type: "address"
      },
      {
        name: "reason",
        type: "bytes"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "restrictionCode",
        type: "uint8"
      }
    ],
    name: "messageForTransferRestriction",
    outputs: [
      {
        name: "message",
        type: "string"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_scheduleIndex",
        type: "uint256"
      },
      {
        name: "_holder",
        type: "address"
      },
      {
        name: "_amount",
        type: "uint256"
      },
      {
        name: "_sitCat",
        type: "uint8"
      },
      {
        name: "_lienPeriod",
        type: "uint256"
      },
      {
        name: "_data",
        type: "bytes"
      }
    ],
    name: "mint",
    outputs: [
      {
        name: "success",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "_holder",
        type: "address"
      }
    ],
    name: "isValid",
    outputs: [
      {
        name: "",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_approver",
        type: "address"
      }
    ],
    name: "removeAuthorizer",
    outputs: [
      {
        name: "success",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_holder",
        type: "address"
      },
      {
        name: "_isEnabled",
        type: "bool"
      },
      {
        name: "_isWithhold",
        type: "bool"
      },
      {
        name: "_beneficiary",
        type: "bytes32"
      }
    ],
    name: "addShareholder",
    outputs: [
      {
        name: "success",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "owner",
    outputs: [
      {
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_scheduleId",
        type: "uint256"
      },
      {
        name: "_reason",
        type: "bytes"
      }
    ],
    name: "approveSchedule",
    outputs: [
      {
        name: "scheduleId",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_holder",
        type: "address"
      },
      {
        name: "_updateData",
        type: "bool"
      },
      {
        name: "_updateSpec",
        type: "uint8"
      }
    ],
    name: "updateShareHolder",
    outputs: [
      {
        name: "success",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_to",
        type: "address"
      },
      {
        name: "_amount",
        type: "uint256"
      }
    ],
    name: "transfer",
    outputs: [
      {
        name: "success",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_errorString",
        type: "string"
      }
    ],
    name: "removeMessage",
    outputs: [
      {
        name: "success",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_scheduleId",
        type: "uint256"
      },
      {
        name: "_reason",
        type: "bytes"
      }
    ],
    name: "removeSchedule",
    outputs: [
      {
        name: "scheduleId",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "_from",
        type: "address"
      },
      {
        name: "_to",
        type: "address"
      },
      {
        name: "_amount",
        type: "uint256"
      }
    ],
    name: "detectTransferRestriction",
    outputs: [
      {
        name: "restrictionCode",
        type: "uint8"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "_holder",
        type: "address"
      }
    ],
    name: "getShareHolder",
    outputs: [
      {
        name: "isEnabled",
        type: "bool"
      },
      {
        name: "isWithhold",
        type: "bool"
      },
      {
        name: "beneficiary",
        type: "bytes32"
      },
      {
        name: "tradable",
        type: "uint256"
      },
      {
        name: "allocated",
        type: "uint256"
      },
      {
        name: "vesting",
        type: "uint256"
      },
      {
        name: "lien",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_approver",
        type: "address"
      },
      {
        name: "_type",
        type: "uint8"
      }
    ],
    name: "addAuthorizer",
    outputs: [
      {
        name: "success",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "sName",
    outputs: [
      {
        name: "",
        type: "string"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "_holder",
        type: "address"
      },
      {
        name: "_spender",
        type: "address"
      }
    ],
    name: "allowance",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "newOwner",
        type: "address"
      }
    ],
    name: "transferOwnership",
    outputs: [
      {
        name: "success",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        name: "_symbol",
        type: "string"
      },
      {
        name: "_name",
        type: "string"
      },
      {
        name: "_granular",
        type: "uint8"
      },
      {
        name: "_coinbase",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    payable: false,
    stateMutability: "nonpayable",
    type: "fallback"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "_from",
        type: "address"
      },
      {
        indexed: true,
        name: "_to",
        type: "address"
      },
      {
        indexed: false,
        name: "_amount",
        type: "uint256"
      },
      {
        indexed: true,
        name: "_date",
        type: "uint256"
      }
    ],
    name: "NewTradable",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: "_from",
        type: "address"
      },
      {
        indexed: true,
        name: "_to",
        type: "address"
      },
      {
        indexed: false,
        name: "_amount",
        type: "uint256"
      },
      {
        indexed: true,
        name: "_dateAdded",
        type: "uint256"
      }
    ],
    name: "NewAllocated",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: "_from",
        type: "address"
      },
      {
        indexed: true,
        name: "_to",
        type: "address"
      },
      {
        indexed: false,
        name: "_amount",
        type: "uint256"
      },
      {
        indexed: true,
        name: "_date",
        type: "uint256"
      }
    ],
    name: "NewVesting",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: "_from",
        type: "address"
      },
      {
        indexed: true,
        name: "_to",
        type: "address"
      },
      {
        indexed: false,
        name: "_amount",
        type: "uint256"
      },
      {
        indexed: true,
        name: "_startDate",
        type: "uint256"
      },
      {
        indexed: true,
        name: "_lienPeriod",
        type: "uint256"
      }
    ],
    name: "NewLien",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "_holder",
        type: "address"
      },
      {
        indexed: false,
        name: "_sitCat",
        type: "uint8"
      },
      {
        indexed: false,
        name: "catIndex",
        type: "uint256"
      }
    ],
    name: "MovedToTradable",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "__holder",
        type: "address"
      }
    ],
    name: "NewShareholder",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "_holder",
        type: "address"
      },
      {
        indexed: false,
        name: "updateData",
        type: "bool"
      },
      {
        indexed: false,
        name: "_updateSpecification",
        type: "uint8"
      }
    ],
    name: "shareHolderUpdated",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: "_scheduleId",
        type: "uint256"
      },
      {
        indexed: false,
        name: "_scheduleType",
        type: "uint8"
      },
      {
        indexed: false,
        name: "_amount",
        type: "uint256"
      },
      {
        indexed: false,
        name: "_data",
        type: "bytes"
      }
    ],
    name: "NewSchedule",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: "_requestId",
        type: "uint256"
      },
      {
        indexed: false,
        name: "_authorizer",
        type: "address"
      },
      {
        indexed: false,
        name: "_reason",
        type: "bytes"
      }
    ],
    name: "ScheduleApproved",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: "_requestId",
        type: "uint256"
      },
      {
        indexed: false,
        name: "_authorizer",
        type: "address"
      },
      {
        indexed: false,
        name: "_reason",
        type: "bytes"
      }
    ],
    name: "ScheduleRejected",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: "_from",
        type: "uint8"
      },
      {
        indexed: true,
        name: "_holder",
        type: "address"
      },
      {
        indexed: false,
        name: "_sitCat",
        type: "uint8"
      },
      {
        indexed: false,
        name: "_amount",
        type: "uint256"
      },
      {
        indexed: false,
        name: "_scheduleType",
        type: "uint256"
      },
      {
        indexed: false,
        name: "_data",
        type: "bytes"
      }
    ],
    name: "Minted",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: "initiator",
        type: "address"
      },
      {
        indexed: true,
        name: "_holder",
        type: "address"
      },
      {
        indexed: false,
        name: "_sitCat",
        type: "uint8"
      },
      {
        indexed: false,
        name: "_amount",
        type: "uint256"
      },
      {
        indexed: false,
        name: "_data",
        type: "bytes"
      }
    ],
    name: "Withdrawn",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "_from",
        type: "address"
      },
      {
        indexed: true,
        name: "_to",
        type: "address"
      },
      {
        indexed: false,
        name: "_value",
        type: "uint256"
      }
    ],
    name: "Transfer",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "_owner",
        type: "address"
      },
      {
        indexed: true,
        name: "_spender",
        type: "address"
      },
      {
        indexed: false,
        name: "_value",
        type: "uint256"
      }
    ],
    name: "Approval",
    type: "event"
  }
];
const contractInst = new web3.eth.Contract(contractABI, deployedContractAddr);

// const getCurrentGasPrices = async () => {
//   let response = await axios.get(
//     "https://ethgasstation.info/json/ethgasAPI.json"
//   );
//   let prices = {
//     low: response.data.safeLow / 10,
//     medium: response.data.average / 10,
//     high: response.data.fast / 10
//   };
//   return prices;
// };

module.exports = {
  getTokenbase: async () => {
    try {
      const token = await contractInst.methods;
      const result = await token.aCoinbaseAcct().call();
      return result;
    } catch (error) {
      throw error;
    }
  },
  getTokenbaseBal: async () => {
    try {
      const token = await contractInst.methods;
      const tokenbase = await token.aCoinbaseAcct().call();
      const result = await token.balanceOf(tokenbase).call();
      return result;
    } catch (error) {
      throw error;
    }
  },
  getBal: async (fromAddress, holder) => {
    try {
      const result = await contractInst.methods
        .balanceOf(holder)
        .call({ from: fromAddress });
      return result;
    } catch (error) {
      throw error;
    }
  },
  getShareholder: async (fromAddress, holderAddress) => {
    try {
      const {
        isEnabled,
        isWithhold,
        beneficiary,
        tradable,
        allocated,
        vesting,
        lien
      } = await contractInst.methods
        .getShareHolder(holderAddress)
        .call({ from: fromAddress });
      const _beneficiary = await web3.utils.toString(beneficiary);
      console.log("_beneficiary >> ", _beneficiary);
      return {
        isEnabled,
        isWithhold,
        beneficiary: _beneficiary,
        tradable,
        allocated,
        vesting,
        lien
      };
    } catch (error) {
      throw error;
    }
  },

  addShareholder: async (
    _privateKey,
    fromAddress,
    holder,
    isEnabled,
    isWithhold,
    beneficiaryInfo
  ) => {
    try {
      const isValidAddress = await web3.utils.isAddress(holder);
      const beneficiary = await web3.utils.toHex(beneficiaryInfo);

      if (!isValidAddress) {
        return "Invalid from address";
      }

      //   if (
      //     isNaN(tradable) ||
      //     isNaN(allocated) ||
      //     isNaN(vesting || isNaN(lien))
      //   ) {
      //     return "SIT balances must be a number";
      //   }
      //   const gasPrice = await getCurrentGasPrices();

      const data = await contractInst.methods
        .addShareholder(holder, isEnabled, isWithhold, beneficiary)
        .encodeABI();

      const privateKey = Buffer.from(_privateKey, "hex");

      var nounce = await web3.eth.getTransactionCount(fromAddress, "pending");

      const gasUsed = await contractInst.methods
        .addShareholder(holder, isEnabled, isWithhold, beneficiary)
        .estimateGas({
          from: fromAddress
        });
      console.log("nounce >> ", nounce);
      const txParams = {
        nonce: nounce++,
        gasLimit: gasUsed || 1200000,
        gasPrice: gasPrice.high * 1000000000,
        from: fromAddress,
        to: deployedContractAddr,
        data,
        chainId: 4
      };

      const tx = await new EthereumTx(txParams);

      tx.gasPrice = tx.sign(privateKey);

      const serializedTx = tx.serialize();
      const transactionId = await web3.eth.sendSignedTransaction(
        "0x" + serializedTx.toString("hex")
      );

      return transactionId;
    } catch (error) {
      throw error;
    }
  },
  updateHolderStatus: async (_privateKey, fromAddress, holder, access) => {
    try {
      const result = await contractInst.methods
        .updateHolderAccess(holder, access)
        .call({ from: fromAddress });

      const isValidHolder = await web3.utils.isAddress(holder);
      const isValidFrom = await web3.utils.isAddress(fromAddress);

      if (!isValidHolder) {
        return "Invalid shareholder address";
      }
      if (!isValidFrom) {
        return "Invalid initiator address";
      }

      if (typeof access != "boolean") {
        return "Can only set shareholders status to true or false";
      }

      const gasPrice = await getCurrentGasPrices();

      const data = await contractInst.methods
        .updateHolderAccess(holder, access)
        .encodeABI();

      const privateKey = Buffer.from(_privateKey, "hex");

      var nounce = await web3.eth.getTransactionCount(fromAddress);

      const gasUsed = await contractInst.methods
        .updateHolderAccess(holder, access)
        .estimateGas({
          from: fromAddress
        });

      const txParams = {
        nonce: nounce++,
        gasLimit: gasUsed || 1200000,
        gasPrice: gasPrice.high * 1000000000,
        from: fromAddress,
        to: deployedContractAddr,
        data,
        chainId: 4
      };

      const tx = await new EthereumTx(txParams);

      tx.sign(privateKey);

      const serializedTx = tx.serialize();
      const transactionId = await web3.eth.sendSignedTransaction(
        "0x" + serializedTx.toString("hex")
      );

      return transactionId;
    } catch (error) {
      throw error;
    }
  }
};
