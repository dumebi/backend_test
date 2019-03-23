// /* eslint-disable no-nested-ternary */
// /* eslint-disable class-methods-use-this */
// /* eslint-disable no-useless-constructor */
// const { web3, EthereumTx } = require('./base.js');
// const { compiledTokenContract } = require('./deploy/compile.js');

// const deployedContractAddr = "0xc9cdd5ddea427852c518f81f703028013f18fa1f";
// const contractABI = compiledTokenContract.abi;
// const contractInst = new web3.eth.Contract(contractABI, deployedContractAddr);

// // Steps to Replicate
// // => Copy contract folder from the Blockcjhain directory into remix
// // => Compile and deploy the token, this will as part of it's dependencies deploy the associated libraries
// // => Copy the deployed contract address from remix and replace the "deployedContractAddr" variable with it
// // => Call libraryu functions to talk with the blockchain



// // Contract Deployment Params

// // _symbol {string}  The Token Symbol
// // _name:  {string}  The Token Name
// // _granular: {uint8} The Token Granularity
// // _tokenbase: {address} The Tokenbase address, where withdrawed tokens will sit
// // owner: {address}    The Token Contract owner Address



// // Error Meaning

// // errorCode: "UNVERIFIED_HOLDER",
// // Meaning: "Only verified SIT holders can perform this transaction"
// // errorCode: "RECEIPT_TRANSFER_BLOCKED",
// // Meaning: "Recipient not authorized"
// // errorCode: "SEND_TRANSFER_BLOCKED", 
// // Meaning: "Sender not authorized"
// // errorCode: "TOKEN_GRANULARITY_ERROR",
// // Meaning: "Token cannot be granular below the specified granularity"
// // errorCode: "TRANSFER_VERIFIED_ERROR",
// // Meaning: "Off-Chain approval for restricted token"
// // errorCode: "INSUFFICIENT_BALANCE_ERROR",
// // Meaning: "You do not have sufficient balance for this transaction"
// // errorCode: "INVALID_AMOUNT_ERROR",
// // Meaning: "Token amount specified is invalid"
// // errorCode: "SPENDER_BALANCE_ERROR",
// // Meaning: "Amount specified is morethan spendable amount"
// // errorCode: "ACCOUNT_WITHHOLD_ERROR", 
// // Meaning: "Account on hold"
// // errorCode: "MOVE_LIEN_ERROR",
// // Meaning: "Lien cannot be moved to tradable balance, lien period not over yet"
// // errorCode: "UNIQUE_SHAREHOLDER_ERROR",
// // Meaning: "Shareholder already added before!"


// // Available Functionality
// // [
// // 		"Function": "approve",
// // 		"Function": "removeAdmin",
// // 		"Function": "totalSupply"
// // 		"Function": "totalInEscrow",
// // 		"Function": "sSymbol",
// // 		"Function": "transferFrom",
// // 		"Function": "isAdmin",
// // 		"Function": "isWithhold",
// // 		"Function": "uGranularity",
// // 		"Function": "addAdmin",
// // 		"Function": "balanceOf"
// // 		"Function": "messageForTransferRestriction",
// // 		"Function": "isValid",
// // 		"Function": "transfer",
// // 		"Function": "aTokenbase",
// // 		"Function": "addToEscrow",
// // 		"Function": "removeFromEscrow",
// // 		"Function": "addShareholder",
// // 		"Function": "detectTransferRestriction",
// // 		"Function": "getShareHolder",
// // 		"Function": "sName",
// // 		"Function": "allowance"
// // 		"Function": "aManager"
// // ]


// exports.Token = class {

//   errorHandler(error){
//     console.log("er > ", error)
//     // solidity error
//     if (error.name == "RuntimeError"){
//       console.log("RuntimeError")
//       return {
//         ok : false,
//         reason : error.reason,
//         field : error.arg
//       }
//     }
//     if (error.code == "-32000"){
//       console.log("32000")
//       return {
//         ok : false,
//         reason : error.reason,
//         field : error.arg
//       }
      
//     }
//     if (!error.reason){
//       return {
//         ok : false,
//         reason : error.Error
//       }
      
//     }
//   }

//   /**
//    * @description : This function allows the owner transfer ownership to another account
//    * @dev : This function should be called by the contract owner
//    * @params : {
//    *  fromAddress{address} : "Address of the function caller",
//    *  _privateKey{string} : "Private key of the function caller, used to sign the message",
//    *  newOwner{string} : "Address of new owner"
//    * }
//    * @returns 
//    *  transactionDetails : {}
//    */
//   async transferOwnership(fromAddress, _privateKey, newOwner) {
//     try {
//       const isValidAddress = await web3.utils.isAddress(newOwner);
//       if (!isValidAddress) {
//         return 'Invalid New Owner Address';
//       }

//       const privateKey = Buffer.from(_privateKey, 'hex');
//       const data = await contractInst.methods
//         .transferOwnership(newOwner)
//         .encodeABI();

//       const gasPrice = 2000;
//       const nounce = await web3.eth.getTransactionCount(fromAddress, 'pending');
//       const gasUsed = await contractInst.methods
//         .transferOwnership(newOwner)
//         .estimateGas({
//           from: fromAddress
//         });

//       const txParams = {
//         nonce: nounce,
//         gasLimit: gasUsed || 1200000,
//         gasPrice: gasPrice * 1000000000,
//         from: fromAddress,
//         to: deployedContractAddr,
//         data,
//         chainId: 5777
//       };

//       const tx = await new EthereumTx(txParams);
//       tx.sign(privateKey);
//       const serializedTx = tx.serialize();
//       const transactionId = await web3.eth.sendSignedTransaction(
//         `0x${serializedTx.toString('hex')}`
//       );

//       return {
//         transactionDetails : transactionId
//       };
//     } catch (error) {
//       return this.errorHandler(error);
//     }
//   }


  
//   /**
//    * @description : This function returns the owner address (Super Admin)
//    * @dev : This function should be called by the either the contract manager/developer | admin "owner"
//    * @params : {
//    *  fromAddress{address} : "Address of the function caller"
//    * }
//    * @returns {address} Address of the contract owner, super admin
//    */
//   async getOwner(fromAddress) {
//     try {
//       const token = await contractInst.methods;
//       const result = await token.owner().call({ from: fromAddress });
//       return result;
//     } catch (error) {
//       return this.errorHandler(error);
//     }
//   }

//   /**
//    * @description : This function returns the manager / developer address
//    * @dev : This function should be called by the either the contract manager/developer | admin "owner"
//    * @params : {
//    *  fromAddress{address} : "Address of the function caller"
//    * }
//    * @returns {address} Address of the contract owner, super admin
//    */
//   async getManager(fromAddress) {
//     try {
//       const token = await contractInst.methods;
//       const result = await token.aManager().call({ from: fromAddress });
//       return result;
//     } catch (error) {
//       return this.errorHandler(error);
//     }
//   }

//   /**
//    * @description : This function returns details of the contract
//    * @dev : Can be called by any account
//    * @params : {
//    *    fromAddress{address} : "Address of the function caller"
//    * }
//    * @returns 
//         name{string}          Token Name
//         symbol{string}        Token Symbol
//         granularity{number}   Token Granularity
//    * 
//    */
//   async getTokenInfo(fromAddress) {
//     try {
//       const token = await contractInst.methods;
//       const name = await token.sName().call({ from: fromAddress });
//       const symbol = await token.sSymbol().call({ from: fromAddress });
//       const granularity = await token
//         .uGranularity()
//         .call({ from: fromAddress });

//       return {
//         name,
//         symbol,
//         granularity
//       };

//     } catch (error) {
//       return this.errorHandler(error);
//     }
//   }

//   /**
//    * @description : This function returns the token base account of the contract, where withdrawers are kept
//    * @dev : Can be called by either the Owner | Manage/developer | Admins
//    * @params : {
//    *  fromAddress{address} : "Address of the function caller"
//    * }
//    * @returns {address} : "Address of the token base"
//    */
//   async getTokenbase() {
//     try {
//       const token = await contractInst.methods;
//       const result = await token.aTokenbase().call();
//       return result;
//     } catch (error) {
//       return this.errorHandler(error);
//     }
//   }

//   /**
//    * @description : This function returns the token base balance of the contract, where withdrawers are kept
//    * @dev : Can be called by either the Owner | Manage/developer | Admins
//    * @params : {
//    *  fromAddress{address} : "Address of the function caller",
//    *  tokenbase {address} : "Address of token base"
//    * }
//    * @returns {Number}  Token base balance
//    */
//   async getTokenbaseBal(fromAddress, tokenbase) {
//     try {
//       const token = await contractInst.methods;
//       const result = await token
//         .balanceOf(tokenbase)
//         .call({ from: fromAddress });
//       return result
//     } catch (error) {
//       return this.errorHandler(error);
//     }
//   }

//   /**
//    * @description : This function returns the total supplies of token in the contract
//    * @dev : Can be called by either the Owner | Manage/developer | Admins
//    * @params : {
//    *  fromAddress{address} : "Address of the function caller"
//    * }
//    * @returns {Number}    Total supply of tokens at any given time
//    */
//   async getTotalSupply(fromAddress) {
//     try {
//       const token = await contractInst.methods;
//       const result = await token.totalSupply().call({from: fromAddress});
//       return result
//     } catch (error) {
//       return this.errorHandler(error);
//     }
//   }

//   /**
//    * @description : This function allows the contract owner change contract manager
//    * @dev : Can be called by only the owner
//    * @params : {
//     *  fromAddress{address} : "Address of the function caller",
//     *  _privateKey{string} : "Private key of the function caller, used to sign the message",
//     *  manager{string} : "address of the new account to be made manager",}
//    * @returns 
//         transactionDetails: {}
//    */
//   async changeManager(_privateKey, fromAddress, manager) {
//     try {
      
//       const isValidAddress = await web3.utils.isAddress(manager);
//       if (!isValidAddress) {
//         return "Invalid manager address";
//       }

//       const privateKey = Buffer.from(_privateKey, "hex");
//       const data = await contractInst.methods
//         .changeManager(manager)
//         .encodeABI();

//       const gasPrice = 2000;
//       var nounce = await web3.eth.getTransactionCount(fromAddress, "pending");
//       const gasUsed = await contractInst.methods
//       .changeManager(manager)
//         .estimateGas({
//           from: fromAddress
//         });

//       const txParams = {
//         nonce: nounce,
//         gasLimit: gasUsed || 1200000,
//         gasPrice: gasPrice * 1000000000,
//         from: fromAddress,
//         to: deployedContractAddr,
//         data,
//         chainId: 5777
//       };

//       const tx = await new EthereumTx(txParams);
//       tx.sign(privateKey);
//       const serializedTx = tx.serialize();
//       const transactionId = await web3.eth.sendSignedTransaction(
//         "0x" + serializedTx.toString("hex")
//       );

//       return {
//         transactionDetails : transactionId
//       };
//     } catch (error) {
//       return this.errorHandler(error);
//     }
//   }

//   /**
//    * @description : This function allows the contract owner add an admin to the contract
//    * @dev : Can be called by only the owner
//    * @params : {
//     *  fromAddress{address} : "Address of the function caller",
//     *  _privateKey{string} : "Private key of the function caller, used to sign the message",
//     *  admin{string} : "address of the account to be made an admin",}
//    * @returns 
//         transactionDetails: {}
//    */
//   async addAdmin(_privateKey, fromAddress, admin) {
//     try {
      
//       const isValidAddress = await web3.utils.isAddress(admin);
//       if (!isValidAddress) {
//         return "Invalid admin address";
//       }

//       const privateKey = Buffer.from(_privateKey, "hex");
//       const data = await contractInst.methods
//         .addAdmin(admin)
//         .encodeABI();

//       const gasPrice = 2000;
//       var nounce = await web3.eth.getTransactionCount(fromAddress, "pending");
//       const gasUsed = await contractInst.methods
//       .addAdmin(admin)
//         .estimateGas({
//           from: fromAddress
//         });

//       const txParams = {
//         nonce: nounce,
//         gasLimit: gasUsed || 1200000,
//         gasPrice: gasPrice * 1000000000,
//         from: fromAddress,
//         to: deployedContractAddr,
//         data,
//         chainId: 5777
//       };

//       const tx = await new EthereumTx(txParams);
//       tx.sign(privateKey);
//       const serializedTx = tx.serialize();
//       const transactionId = await web3.eth.sendSignedTransaction(
//         "0x" + serializedTx.toString("hex")
//       );

//       return {
//         transactionDetails : transactionId
//       };
//     } catch (error) {
//       return this.errorHandler(error);
//     }
//   }
// /**
//    * @description : This function allows the contract owner remove an admin from the contract
//    * @dev : Should be called by the contract Owner
//    * @params : {
//     *  fromAddress{address} : "Address of the function caller",
//     *  _privateKey{string} : "Private key of the function caller, used to sign the message",
//     *  admin : "address of the account to be removed as an admin"
//    * }
//    * @returns 
//    *  transactionDetails: {}
//    */
//   async removeAdmin(_privateKey, fromAddress , admin) {
//     try {
      
//       const isValidAddress = await web3.utils.isAddress(admin);
//       if (!isValidAddress) {
//         return "Invalid admin address";
//       }

//       const privateKey = Buffer.from(_privateKey, "hex");
//       const data = await contractInst.methods
//         .removeAdmin(admin)
//         .encodeABI();

//       const gasPrice = 2000;
//       var nounce = await web3.eth.getTransactionCount(fromAddress, "pending");
//       const gasUsed = await contractInst.methods
//         .removeAdmin(admin)
//         .estimateGas({
//           from: fromAddress
//         });

//       const txParams = {
//         nonce: nounce,
//         gasLimit: gasUsed || 1200000,
//         gasPrice: gasPrice * 1000000000,
//         from: fromAddress,
//         to: deployedContractAddr,
//         data,
//         chainId: 5777
//       };

//       const tx = await new EthereumTx(txParams);
//       tx.sign(privateKey);
//       const serializedTx = tx.serialize();
//       const transactionId = await web3.eth.sendSignedTransaction(
//         "0x" + serializedTx.toString("hex")
//       );

//       return {
//         transactionDetails :transactionId
//       };
//     } catch (error) {
//       return this.errorHandler(error);
//     }
//   }

//   /**
//    * @description : This function allows the contract owner / admin add an authorizer to the contract
//    * @dev : Can be called by either the Owner | Admins
//    * @params : {
//     *  fromAddress{address} : "Address of the function caller",
//     *  _privateKey{string} : "Private key of the function caller, used to sign the message",
//     *  authorizer{address} : "address of the account to be made an authhorizer",
//     *  type{string} : "What schedule type this authorizer is allowed to authorize, accepts string as 'Pay Scheme' or 'Upfront Scheme' schedule"
//    * }
//    * @returns 
//         transactionDetails: {}
//    */
//   async addAuthorizer(_privateKey, fromAddress, authorizer, type) {
//     try {
      
//       const isValidAddress = await web3.utils.isAddress(authorizer);
//       if (!isValidAddress) {
//         return 'Invalid authorizer address';
//       }

//       const privateKey = Buffer.from(_privateKey, 'hex');
//       const data = await contractInst.methods
//         .addAuthorizer(authorizer, type == 'Pay Scheme' ? 0 : 1)
//         .encodeABI();

//       const gasPrice = 2000;
//       const nounce = await web3.eth.getTransactionCount(fromAddress, 'pending');
//       const gasUsed = await contractInst.methods
//         .addAuthorizer(authorizer, type == 'Pay Scheme' ? 0 : 1)
//         .estimateGas({
//           from: fromAddress
//         });

//       const txParams = {
//         nonce: nounce,
//         gasLimit: gasUsed || 1200000,
//         gasPrice: gasPrice * 1000000000,
//         from: fromAddress,
//         to: deployedContractAddr,
//         data,
//         chainId: 5777
//       };

//       const tx = await new EthereumTx(txParams);
//       tx.sign(privateKey);
//       const serializedTx = tx.serialize();
//       const transactionId = await web3.eth.sendSignedTransaction(
//         `0x${serializedTx.toString('hex')}`
//       );

//       return {
//         transactionDetails :transactionId
//       };
//     } catch (error) {
//       return this.errorHandler(error);
//     }
//   }

//   /**
//    * @description : This function allows the contract owner / admin remove an authorizer from the contract
//    * @dev : Can be called by either the Owner | Admins
//    * @params : {
//     *  fromAddress{address} : "Address of the function caller",
//     *  _privateKey{string} : "Private key of the function caller, used to sign the message",
//    *  authorizer{address} : "address of the account to be removed as an authhorizer"
//    * }
//    * @returns 
//    *  transactionDetails: {}
//    */
//   async removeAuthorizer(_privateKey, fromAddress , authorizer) {
//     try {
      
//       const isValidAddress = await web3.utils.isAddress(authorizer);
//       if (!isValidAddress) {
//         return 'Invalid authorizer address';
//       }

//       const privateKey = Buffer.from(_privateKey, 'hex');
//       const data = await contractInst.methods
//         .removeAuthorizer(authorizer)
//         .encodeABI();

//       const gasPrice = 2000;
//       const nounce = await web3.eth.getTransactionCount(fromAddress, 'pending');
//       const gasUsed = await contractInst.methods
//         .removeAuthorizer(authorizer)
//         .estimateGas({
//           from: fromAddress
//         });

//       const txParams = {
//         nonce: nounce,
//         gasLimit: gasUsed || 1200000,
//         gasPrice: gasPrice * 1000000000,
//         from: fromAddress,
//         to: deployedContractAddr,
//         data,
//         chainId: 5777
//       };

//       const tx = await new EthereumTx(txParams);
//       tx.sign(privateKey);
//       const serializedTx = tx.serialize();
//       const transactionId = await web3.eth.sendSignedTransaction(
//         `0x${serializedTx.toString('hex')}`
//       );

//       return {
//         transactionDetails :transactionId
//       };

//     } catch (error) {
//       return this.errorHandler(error);
//     }
//   }

//   /**
//    * @description : This function allows the contract owner / admin get details of an authorizer in the contract
//    * @dev : Can be called by either the Owner | Admins
//    * @params : {
//     *  fromAddress{address} : "Address of the function caller",
//    *  authorizer{address} : "address of the account to be removed as an authhorizer",
//    * }
//    * @returns 
//    *  authorizer{address}   Authorizer address
//    *  type{string}          Authorization type
//    */
//   async getAuthorizer(fromAddress, authorizer) {
//     try {
//       const token = await contractInst.methods;
//       const result = await token
//         .getAuthorizer(authorizer)
//         .call({ from: fromAddress });

//       return {
//         authorizer: result.authorizerAddr,
//         type: result.authorizerType == 0 ? 'Pay Scheme' : 'Upfront Scheme'
//       };
//     } catch (error) {
//       return this.errorHandler(error);
//     }
//   }

//   /**
//    * @description : This function allows the contract owner / admin get authorizers of a schedule, approved or not
//    * @dev : Can be called by either the Owner | Admins
//    * @params : {
//    *  fromAddress{address} : "Address of the function caller",
//    *  scheduleId : "Unique schedule id",
//    *  authorizerId : "Unique position of authorizer in the schedule, always within [0,1,2]"
//    * }
//    * @returns 
//    *  authorizer{address}             address of the authorizer
//    *  reason{string}            Reason for approval or rejection
//    */
//   async getScheduleAuthorizer(fromAddress, scheduleId, authorizerIndex) {
//     try {
//       const token = await contractInst.methods;
//       const result = await token
//         .getScheduleAuthorizer(scheduleId, authorizerIndex)
//         .call({ from: fromAddress });
//       const reason = await web3.utils.toString(result.reason);
//       return {
//         authorizer: result.authorizerAddress,
//         reason
//       };
//     } catch (error) {
//       return this.errorHandler(error);
//     }
//   }

//   /**
//    * @description : This function allows the contract owner / admin check if a shareholder is valid or not
//    * @dev : Can be called by either the Owner | Admins
//    * @params : {
//    *  fromAddress{address} : "Address of the function caller",
//    *  holder : "address of the shareholder"
//    * }
//    * @returns {boolean}
//    */
//   async isValidShareholder(fromAddress, holder) {
//     try {
//       const token = await contractInst.methods;
//       const result = await token.isValid(holder).call({ from: fromAddress });

//       return result;
//     } catch (error) {
//       return this.errorHandler(error);
//     }
//   }

//   /**
//    * @description : This function allows the contract owner / admin check if a shareholder is withheld from operations
//    * @dev : Can be called by either the Owner | Admins
//    * @params : {
//    *  fromAddress{address} : "Address of the function caller",
//    *  holder{address} : "address of the shareholder"
//    * }
//    * @returns {boolean}
//    */
//   async isWithhold(fromAddress, holder) {
//     try {
//       const token = await contractInst.methods;
//       const result = await token.isWithhold(holder).call({ from: fromAddress });

//       return result;
//     } catch (error) {
//       return this.errorHandler(error);
//     }
//   }

//   /**
//    * @description : This returns the tradable balance of a shareholder
//    * @dev : Can be called by anyone
//    * @params : {
//    *  fromAddress{address} : "Address of the function caller",
//    *  holder{address} : "address of the shareholder"
//    * }
//    * @returns {Number}  Share holder balance
//    */
//   async getBalance(fromAddress, holder) {
//     try {
//       const result = await contractInst.methods
//         .balanceOf(holder)
//         .call({ from: fromAddress });
//       return result;
//     } catch (error) {
//       return this.errorHandler(error);
//     }
//   }

//   /**
//    * @description : This function allows a shareholder make a transfer of token
//    * @dev : Called by only shareholders
//    * @params : {
//    *  holder{address} : "address of the recipient",
//    *  amount{Number} : "Amount to transfer"
//    */
//   async transfer(_privateKey, fromAddress, recipient, amount) {
//     try {
//       const isValidHolder = await web3.utils.isAddress(recipient);
//       const isValidFrom = await web3.utils.isAddress(fromAddress);

//       if (!isValidHolder) {
//         return 'Invalid shareholder address';
//       }
//       if (!isValidFrom) {
//         return 'Invalid initiator address';
//       }

//       const gasPrice = 4;

//       const data = await contractInst.methods
//         .transfer(recipient, amount)
//         .encodeABI();

//       const privateKey = Buffer.from(_privateKey, 'hex');

//       const nounce = await web3.eth.getTransactionCount(fromAddress);

//       const gasUsed = await contractInst.methods
//         .transfer(recipient, amount)
//         .estimateGas({
//           from: fromAddress
//         });

//       const txParams = {
//         nonce: nounce,
//         gasLimit: gasUsed || 1200000,
//         gasPrice: gasPrice * 1000000000,
//         from: fromAddress,
//         to: deployedContractAddr,
//         data,
//         chainId: 4
//       };

//       const tx = await new EthereumTx(txParams);

//       tx.sign(privateKey);

//       const serializedTx = tx.serialize();
//       const transactionId = await web3.eth.sendSignedTransaction(
//         `0x${serializedTx.toString('hex')}`
//       );

//       return transactionId;
//     } catch (error) {
//       return this.errorHandler(error);
//     }
//   }

//   /**
//    * @description : This function allows a shareholder approve an account to transfer a certain amount from his/her account
//    * @dev : Called by only shareholders
//    * @params : 
//     *  fromAddress{address}           Address of the function caller
//     *  _privateKey{string}          Private key of the function caller, used to sign the message
//    *  spender           address of the spender
//    *  amount          Amount to allow for the spender 
//    * @returns :
//    *  transactionDetails : {}
//    */

//   async approveSender(_privateKey, fromAddress, spender, amount) {
//     try {
//       const isValidHolder = await web3.utils.isAddress(spender);
//       const isValidFrom = await web3.utils.isAddress(fromAddress);

//       if (!isValidHolder) {
//         return 'Invalid shareholder address';
//       }
//       if (!isValidFrom) {
//         return 'Invalid initiator address';
//       }

//       const gasPrice = 4;

//       const data = await contractInst.methods
//         .approve(spender, amount)
//         .encodeABI();

//       const privateKey = Buffer.from(_privateKey, 'hex');

//       const nounce = await web3.eth.getTransactionCount(fromAddress);

//       const gasUsed = await contractInst.methods
//         .approve(spender, amount)
//         .estimateGas({
//           from: fromAddress
//         });

//       const txParams = {
//         nonce: nounce,
//         gasLimit: gasUsed || 1200000,
//         gasPrice: gasPrice * 1000000000,
//         from: fromAddress,
//         to: deployedContractAddr,
//         data,
//         chainId: 4
//       };

//       const tx = await new EthereumTx(txParams);

//       tx.sign(privateKey);

//       const serializedTx = tx.serialize();
//       const transactionId = await web3.eth.sendSignedTransaction(
//         `0x${serializedTx.toString('hex')}`
//       );

//       return {
//         transactionDetails : transactionId
//       };

//     } catch (error) {
//       return this.errorHandler(error);
//     }
//   }

//   /**
//    * @description : This function returns how much a spender has on a holders account
//    * @dev : Called by anyone
//    * @params : {
//     *  fromAddress{address} : "Address of the function caller",
//    *  holder : "address of the account owner",
//    *  spender : "Address of spender"
//    * @returns {Number}    Spender allowance
//    */

//   async getAllowance(fromAddress, holder, spender) {
//     try {
//       const token = await contractInst.methods;
//       const result = await token
//         .allowance(holder, spender)
//         .call({ from: fromAddress });
//       return result;
//     } catch (error) {
//       return this.errorHandler(error);
//     }
//   }

//   /**
//    * @description : This function allows a spender, transfer from a holder's account
//    * @dev : Called by the spender account
//    * @params : {
//     *  fromAddress{address} : "Address of the function caller",
//     *  _privateKey{string} : "Private key of the function caller, used to sign the message",
//    *  holder{address} : "address of the account owner",
//    *  recipient{address} : "Address of recipient",
//    *  amount{Number} : " Amount to transfer"
//    * @returns :
//    * transactionDetails {object}
//    */

//   async transferFrom(_privateKey, fromAddress, holder, recipient, amount) {
//     try {
//       const isValidHolder = await web3.utils.isAddress(recipient);
//       const isValidFrom = await web3.utils.isAddress(fromAddress);

//       if (!isValidHolder) {
//         return 'Invalid shareholder address';
//       }
//       if (!isValidFrom) {
//         return 'Invalid initiator address';
//       }

//       const gasPrice = 4;

//       const data = await contractInst.methods
//         .transferFrom(holder, recipient, amount)
//         .encodeABI();

//       const privateKey = Buffer.from(_privateKey, 'hex');

//       const nounce = await web3.eth.getTransactionCount(fromAddress);

//       const gasUsed = await contractInst.methods
//         .transferFrom(holder, recipient, amount)
//         .estimateGas({
//           from: fromAddress
//         });

//       const txParams = {
//         nonce: nounce,
//         gasLimit: gasUsed || 1200000,
//         gasPrice: gasPrice * 1000000000,
//         from: fromAddress,
//         to: deployedContractAddr,
//         data,
//         chainId: 4
//       };

//       const tx = await new EthereumTx(txParams);

//       tx.sign(privateKey);

//       const serializedTx = tx.serialize();
//       const transactionId = await web3.eth.sendSignedTransaction(
//         `0x${serializedTx.toString('hex')}`
//       );

//       return {
//         transactionDetails : transactionId
//       };

//     } catch (error) {
//       return this.errorHandler(error);
//     }
//   }

//   /**
//    * @description : This function allows the contract owner | admins add a shareholder
//    * @dev : Called by Owner | Admins
//    * @params : {
//     *  fromAddress{address} : "Address of the function caller",
//     *  _privateKey{string} : "Private key of the function caller, used to sign the message",
//    *  holder{address} : "address of the shareholder",
//    *  isEnabled{boolean} : "accepts a boolean field, sets the shareholder to valid or not",
//    *  isWithhold{boolean} : "accepts a boolean field, sets the shareholder to withhold or not"
//    * @returns
//    * transactionDetails {object}
//    */

//   async addShareholder(
//     _privateKey,
//     fromAddress,
//     holder,
//     isEnabled,
//     isWithhold
//   ) {
//     try {
//       console.log('here')
//       const isValidAddress = await web3.utils.isAddress(holder);

//       if (!isValidAddress) {
//         return 'Invalid from address';
//       }

//       const gasPrice = 2000;

//       const data = await contractInst.methods
//         .addShareholder(holder, isEnabled, isWithhold)
//         .encodeABI();
//         console.log('here 2')

//       const privateKey = Buffer.from(_privateKey, 'hex');

//       const nounce = await web3.eth.getTransactionCount(fromAddress, 'pending');

//       const gasUsed = await contractInst.methods
//         .addShareholder(holder, isEnabled, isWithhold)
//         .estimateGas({
//           from: fromAddress
//         });
//         console.log('here 3')

//       const txParams = {
//         nonce: nounce,
//         gasLimit: gasUsed || 1200000,
//         gasPrice: gasPrice.high * 1000000000,
//         from: fromAddress,
//         to: deployedContractAddr,
//         data,
//         chainId: 5777
//       };

//       const tx = await new EthereumTx(txParams);

//       tx.gasPrice = tx.sign(privateKey);
//       console.log('here 4', tx)

//       const serializedTx = tx.serialize();
//       console.log('here 5 ?> ', serializedTx)
//       const transactionId = await web3.eth.sendSignedTransaction(
//         `0x${serializedTx.toString('hex')}`
//       );
//       console.log('here 6 ?> ', transactionId)

//       return {
//         transactionDetails : transactionId
//       };

//     } catch (error) {
//       return this.errorHandler(error);
//     }
//   }
  
//   /**
//    * @description : This function returns a shareholder details
//    * @dev : Called anyone
//    * @params : {
//     *  fromAddress{address} : "Address of the function caller",
//    *  holder{address} : "address of the shareholder"
//    * }
//    * @returns 
//         isEnabled {bool}
//         isWithhold {bool}
//         tradable {number}
//         allocated {number}
//         vesting {number}
//         lien {number}
//    */

//   async getShareholder(fromAddress, holder) {
//     try {
//       const {
//         isEnabled,
//         isWithhold,
//         tradable,
//         allocated,
//         vesting,
//         lien
//       } = await contractInst.methods
//         .getShareHolder(holder)
//         .call({ from: fromAddress });

//       return {
//         isEnabled,
//         isWithhold,
//         tradable,
//         allocated,
//         vesting,
//         lien
//       };
//     } catch (error) {
//       return this.errorHandler(error);
//     }
//   }

//   /**
//    * @description : This function updates a shareholder details
//    * @dev : Called Owner | Admin
//    * @params : {
//     *  fromAddress{address} : "Address of the function caller",
//     *  _privateKey{string} : "Private key of the function caller, used to sign the message",
//    *  holder : "address of the shareholder",
//    *  access : "Accepts bool, if holder is valid or not"
//    *  withhold : "Accepts bool, if holder is withhold or not"
//    * }
//    * @returns 
//         transactionDetails {object}
//    */

//   async updateShareholder(_privateKey, fromAddress, holder, access, withhold) {
//     try {
//       const isValidHolder = await web3.utils.isAddress(holder);
//       const isValidFrom = await web3.utils.isAddress(fromAddress);

//       if (!isValidHolder) {
//         return 'Invalid shareholder address';
//       }
//       if (!isValidFrom) {
//         return 'Invalid initiator address';
//       }

//       if (typeof access != 'boolean') {
//         return 'Can only set shareholders status to true or false';
//       }

//       const gasPrice = 2000;

//       const data = await contractInst.methods
//         .updateShareHolder(holder, access, withhold)
//         .encodeABI();

//       const privateKey = Buffer.from(_privateKey, 'hex');

//       const nounce = await web3.eth.getTransactionCount(fromAddress);

//       const gasUsed = await contractInst.methods
//         .updateShareHolder(holder, access, withhold)
//         .estimateGas({
//           from: fromAddress
//         });

//       const txParams = {
//         nonce: nounce,
//         gasLimit: gasUsed || 1200000,
//         gasPrice: gasPrice * 1000000000,
//         from: fromAddress,
//         to: deployedContractAddr,
//         data,
//         chainId: 4
//       };

//       const tx = await new EthereumTx(txParams);

//       tx.sign(privateKey);

//       const serializedTx = tx.serialize();
//       const transactionId = await web3.eth.sendSignedTransaction(
//         `0x${serializedTx.toString('hex')}`
//       );

//       return {
//         transactionDetails :transactionId
//       };

//     } catch (error) {
//       return this.errorHandler(error);
//     }
//   }

//   /**
//    * @description : This function allows the contract owner | admins add a shareholder
//    * @dev : Called by Owner | Admins
//    * @params : {
//     *  fromAddress{address} : "Address of the function caller",
//     *  _privateKey{string} : "Private key of the function caller, used to sign the message",
//    *  holder{address} : "address of the shareholder",
//    * @returns 
//         transactionDetails {object}
//    */

//   async removeShareholder(
//     _privateKey,
//     fromAddress,
//     holder
//   ) {
//     try {
//       const isValidAddress = await web3.utils.isAddress(holder);

//       if (!isValidAddress) {
//         return "Invalid from address";
//       }

//       const gasPrice = 2000;

//       const data = await contractInst.methods
//         .removeShareholder(holder)
//         .encodeABI();

//       const privateKey = Buffer.from(_privateKey, "hex");

//       var nounce = await web3.eth.getTransactionCount(fromAddress, "pending");

//       const gasUsed = await contractInst.methods
//         .removeShareholder(holder)
//         .estimateGas({
//           from: fromAddress
//         });

//       const txParams = {
//         nonce: nounce,
//         gasLimit: gasUsed || 1200000,
//         gasPrice: gasPrice.high * 1000000000,
//         from: fromAddress,
//         to: deployedContractAddr,
//         data,
//         chainId: 5777
//       };

//       const tx = await new EthereumTx(txParams);

//       tx.gasPrice = tx.sign(privateKey);

//       const serializedTx = tx.serialize();
//       const transactionId = await web3.eth.sendSignedTransaction(
//         "0x" + serializedTx.toString("hex")
//       );

//       return {
//         transactionDetails : transactionId
//       };

//     } catch (error) {
//       return this.errorHandler(error);
//     }
//   }


//   /**
//    * @description : This function returns count of shareholder total records in any category
//    * @dev : Called anyone
//    * @params : {
//     *  fromAddress{address} : "Address of the function caller",
//    *  holder{address} : "address of the shareholder",
//    *  category{string} : "Token record category to pull from, accepts a string, any from ["Tradable" , "Lien", "Allocated", "Vesting" ],
//    * }
//    * @returns {Number}    Total records in a share category for a particular shareholder
//    */

//   async totalRecordsPerCat(fromAddress, holder, category) {
//     try {
//       const result = await contractInst.methods
//         .totalRecordsByCat(
//           holder,
//           category == "Tradable"
//             ? 0
//             : category == "Lien"
//             ? 1
//             : category == "Allocated"
//             ? 2
//             : category == "Vesting"
//             ? 3
//             : "00"
//         )
//         .call({ from: fromAddress });

//       return result
//     } catch (error) {
//       return this.errorHandler(error);
//     }
//   }

//   /**
//    * @description : This function returns a shareholder details
//    * @dev : Called by anyone
//    * @params : {
//    *  holder{address} : "address of the shareholder",
//    *  category{string} : "Token record category to pull from, accepts a string, any from ["Tradable" , "Lien", "Allocated", "Vesting" ],
//    *  recordId{Number} : "Index of the specific record to pull in this category, accepts a number"
//    * }
//    * @returns 
//         amount{Number}                Amount,
//         dateAdded{Date}               Date added,
//         duration {String}
//         isWithdrawn{Boolean}          This can mean lien period for Liens or dueDate for Allocated,
//         isMovedToTradable{Boolean}    Weather or not the record has been moved to tradable
//    */

//   async getRecordByCat(fromAddress, holder, category, recordId) {
//     try {
//       const {
//         amount,
//         dateAdded,
//         duration,
//         isWithdrawn,
//         isMovedToTradable
//       } = await contractInst.methods
//         .recordByCat(
//           holder,
//           category == 'Tradable'
//             ? 0
//             : category == "Lien"
//             ? 1
//             : category == "Allocated"
//             ? 2
//             : category == "Vesting"
//             ? 3
//             : "00",
//           recordId
//         )
//         .call({ from: fromAddress });

//       return {
//         amount,
//         dateAdded,
//         duration,
//         isWithdrawn,
//         isMovedToTradable
//       };
//     } catch (error) {
//       return this.errorHandler(error);
//     }
//   }

//   /**
//    * @description : This function allows Owner or admins create a new schedule
//    * @dev : Called by only Owner | Admins
//    * @params : {
//     *  fromAddress{address} : "Address of the function caller",
//     *  _privateKey{string} : "Private key of the function caller, used to sign the message",
//    *  scheduleId{Number} : "Unique id for the schedule, used to update or pull schedule details later on",
//    *  amount{Number} : "Amount specified for the schedule",
//    *  scheduleType{String} : "Either 'Pay Scheme' or 'Upfront Scheme' ",
//    *  reason{String} : "Accepts a string, reason for creating the schedule"
//    * }
//    * @returns 
//         transactionDetails : {}
//    */

//   async createSchedule(
//     _privateKey,
//     fromAddress,
//     scheduleId,
//     amount,
//     scheduleType,
//     reason
//   ) {
//     try {
//       const gasPrice = 2000;

//       const data = await contractInst.methods
//         .createSchedule(
//           scheduleId,
//           amount,
//           scheduleType == 'Pay Scheme' ? 0 : 1,
//           web3.utils.toHex(reason)
//         )
//         .encodeABI();

//       const privateKey = Buffer.from(_privateKey, 'hex');

//       const nounce = await web3.eth.getTransactionCount(fromAddress);

//       const gasUsed = await contractInst.methods
//         .createSchedule(
//           scheduleId,
//           amount,
//           scheduleType == 'Pay Scheme' ? 0 : 1,
//           web3.utils.toHex(reason)
//         )
//         .estimateGas({
//           from: fromAddress
//         });

//       const txParams = {
//         nonce: nounce,
//         gasLimit: gasUsed || 1200000,
//         gasPrice: gasPrice * 1000000000,
//         from: fromAddress,
//         to: deployedContractAddr,
//         data,
//         chainId: 5777
//       };

//       const tx = await new EthereumTx(txParams);

//       tx.sign(privateKey);

//       const serializedTx = tx.serialize();
//       const transactionId = await web3.eth.sendSignedTransaction(
//         `0x${serializedTx.toString('hex')}`
//       );

//       return {
//         transactionDetails : transactionId
//       };

//     } catch (error) {
//       return this.errorHandler(error);
//     }
//   }

//   /**
//    * @description : This function allows Owner or admins remove a schedule
//    * @dev : Called by only Owner | Admins
//    * @params : {
//     *  fromAddress{address} : "Address of the function caller",
//     *  _privateKey{string} : "Private key of the function caller, used to sign the message",
//    *  scheduleId{Number} : "Unique id for the schedule, used to update or pull schedule details later on",
//    *  reason{String} : "Accepts a string, reason for removing the schedule"
//    * }
//    * @returns 
//         transactionDetails : {}
//    */

//   async removeSchedule(_privateKey, fromAddress, scheduleId, reason) {
//     try {
//       const gasPrice = 2000;

//       const data = await contractInst.methods
//         .removeSchedule(scheduleId, web3.utils.toHex(reason))
//         .encodeABI();

//       const privateKey = Buffer.from(_privateKey, 'hex');

//       const nounce = await web3.eth.getTransactionCount(fromAddress);

//       const gasUsed = await contractInst.methods
//         .removeSchedule(scheduleId, web3.utils.toHex(reason))
//         .estimateGas({
//           from: fromAddress
//         });

//       const txParams = {
//         nonce: nounce,
//         gasLimit: gasUsed || 1200000,
//         gasPrice: gasPrice * 1000000000,
//         from: fromAddress,
//         to: deployedContractAddr,
//         data,
//         chainId: 5777
//       };

//       const tx = await new EthereumTx(txParams);

//       tx.sign(privateKey);

//       const serializedTx = tx.serialize();
//       const transactionId = await web3.eth.sendSignedTransaction(
//         `0x${serializedTx.toString('hex')}`
//       );

//       return {
//         transactionDetails : transactionId
//       };

//     } catch (error) {
//       return this.errorHandler(error);
//     }
//   }

//   /**
//    * @description : This returns a schedule details
//    * @dev : Called by only Owner | Admins | manager
//    * @params : {
//     *  fromAddress{address} : "Address of the function caller",
//    *  scheduleId{Number} : "Unique id for the schedule, used to identify the schedule"
//    * }
//    * @returns 
//         scheduleType{string},
//         amount{Number}                Amount schedule was created with
//         activeAmount{Number}          What is left to be minted
//         isActive{Boolean}             Specifiez if the schedule is still minting or not
//         isApproved{Boolean},          Returns true if the schedule has been approved and false if not
//         isRejected{Boolean}           Returns true if the schedule has been rejected and false if not
//    */

//   async getSchedule(fromAddress, scheduleId) {
//     try {
//       const {
//         scheduleType,
//         amount,
//         activeAmount,
//         isActive,
//         isApproved,
//         isRejected
//       } = await contractInst.methods
//         .getSchedule(scheduleId)
//         .call({ from: fromAddress });

//       return {
//         scheduleType: scheduleType == 0 ? 'Pay Scheme' : 'Upfront Scheme',
//         amount,
//         activeAmount,
//         isActive,
//         isApproved,
//         isRejected
//       };
//     } catch (error) {
//       return this.errorHandler(error);
//     }
//   }

//   /**
//    * @description : This function allows the authorizer approve a schedule
//    * @dev : Called by only authorizers
//    * @params : {
//     *  fromAddress{address} : "Address of the function caller",
//     *  _privateKey{string} : "Private key of the function caller, used to sign the message",
//    *  scheduleId{Number} : "Unique schedule id",
//    *  reason{string} : "Reasone for approval"
//    * }
//    * @returns 
//    *  transactionDetails : {}
//    */

//   async approveSchedule(_privateKey, fromAddress, scheduleId, reason) {
//     try {
//       const privateKey = Buffer.from(_privateKey, 'hex');
//       const data = await contractInst.methods
//         .approveSchedule(scheduleId, web3.utils.toHex(reason))
//         .encodeABI();

//       const gasPrice = 2000;
//       const nounce = await web3.eth.getTransactionCount(fromAddress, 'pending');
//       const gasUsed = await contractInst.methods
//         .approveSchedule(scheduleId, web3.utils.toHex(reason))
//         .estimateGas({
//           from: fromAddress
//         });

//       const txParams = {
//         nonce: nounce,
//         gasLimit: gasUsed || 1200000,
//         gasPrice: gasPrice * 1000000000,
//         from: fromAddress,
//         to: deployedContractAddr,
//         data,
//         chainId: 5777
//       };

//       const tx = await new EthereumTx(txParams);
//       tx.sign(privateKey);
//       const serializedTx = tx.serialize();
//       const transactionId = await web3.eth.sendSignedTransaction(
//         `0x${serializedTx.toString('hex')}`
//       );

//       return {
//         transactionDetails : transactionId
//       };

//     } catch (error) {
//       return this.errorHandler(error);
//     }
//   }

//   /**
//    * @description : This function allows the authorizer reject a schedule
//    * @dev : Called by only authorizers
//    * @params : {
//     *  fromAddress{address} : "Address of the function caller",
//     *  _privateKey{string} : "Private key of the function caller, used to sign the message",
//    *  scheduleId{Number} : "Unique schedule id",
//    *  reason{String} : "Reasone for approval"
//    * }
//    * @returns 
//    *  transactionDetails : {}
//    */

//   async rejectSchedule(_privateKey, fromAddress, scheduleId, reason) {
//     try {
//       const privateKey = Buffer.from(_privateKey, 'hex');
//       const data = await contractInst.methods
//         .rejectSchedule(scheduleId, web3.utils.toHex(reason))
//         .encodeABI();

//       const gasPrice = 2000;
//       const nounce = await web3.eth.getTransactionCount(fromAddress, 'pending');
//       const gasUsed = await contractInst.methods
//         .rejectSchedule(scheduleId, web3.utils.toHex(reason))
//         .estimateGas({
//           from: fromAddress
//         });

//       const txParams = {
//         nonce: nounce,
//         gasLimit: gasUsed || 1200000,
//         gasPrice: gasPrice * 1000000000,
//         from: fromAddress,
//         to: deployedContractAddr,
//         data,
//         chainId: 5777
//       };

//       const tx = await new EthereumTx(txParams);
//       tx.gasPrice = tx.sign(privateKey);
//       const serializedTx = tx.serialize();
//       const transactionId = await web3.eth.sendSignedTransaction(
//         `0x${serializedTx.toString('hex')}`
//       );

//       return {
//         transactionDetails : transactionId
//       };

//     } catch (error) {
//       return this.errorHandler(error);
//     }
//   }

//   /**
//    * @description : This function allows the Owner | Admins mint tokens to an account
//    * @dev : Called by only Owner | Admins
//    * @params : {
//     *  fromAddress{address} : "Address of the function caller",
//     *  _privateKey{string} : "Private key of the function caller, used to sign the message",
//    *  scheduleId : "Unique schedule id",
//    *  recipient : "recipient account",
//    *  amount : "How much to mint to recipient",
//    *  shareCat : "Recipient share category to mint to",
//    *  duration(number) : "For Lien, this means the duration and for Allocated this is dueDate"
//    *  reason : "Reasone for minting to recipient account"
//    * }
//    * @returns 
//    *  transactionDetails : {}
//    */

//   async mint(
//     _privateKey,
//     fromAddress,
//     scheduleId,
//     recipient,
//     amount,
//     shareCat,
//     duration = 0,
//     reason
//   ) {
//     try {
//       const gasPrice = 2000;

//       const data = await contractInst.methods
//         .mint(
//           scheduleId,
//           recipient,
//           amount,
//           shareCat == 'Tradable'
//             ? 0
//             : shareCat == 'Lien'
//               ? 1
//               : shareCat == 'Allocated'
//                 ? 2
//                 : shareCat == 'Vesting'
//                   ? 3
//                   : '00',
//           duration,
//           web3.utils.toHex(reason)
//         )
//         .encodeABI();

//       const privateKey = Buffer.from(_privateKey, 'hex');

//       const nounce = await web3.eth.getTransactionCount(fromAddress);

//       const gasUsed = await contractInst.methods
//         .mint(
//           scheduleId,
//           recipient,
//           amount,
//           shareCat == 'Tradable'
//             ? 0
//             : shareCat == 'Lien'
//               ? 1
//               : shareCat == 'Allocated'
//                 ? 2
//                 : shareCat == 'Vesting'
//                   ? 3
//                   : '00',
//           duration,
//           web3.utils.toHex(reason)
//         )
//         .estimateGas({
//           from: fromAddress
//         });

//       const txParams = {
//         nonce: nounce,
//         gasLimit: gasUsed || 1200000,
//         gasPrice: gasPrice * 1000000000,
//         from: fromAddress,
//         to: deployedContractAddr,
//         data,
//         chainId: 5777
//       };

//       const tx = await new EthereumTx(txParams);

//       tx.sign(privateKey);

//       const serializedTx = tx.serialize();
//       const transactionId = await web3.eth.sendSignedTransaction(
//         `0x${serializedTx.toString('hex')}`
//       );
//       return {
//         transactionDetails : transactionId
//       };
//     } catch (error) {
//       return this.errorHandler(error);
//     }
//   }

//   /**
//    * @description : This function allows the Owner | Admins move holder's tokens from any of the categories to tradable
//    * @dev : Called by only Owner | Admins
//    * @params : {
//     *  fromAddress{address} : "Address of the function caller",
//     *  _privateKey{string} : "Private key of the function caller, used to sign the message",
//    *  holder{address} : "holder account",
//    *  shareCat{string} : "Token category to move to tradable",
//    *  recordId{Number} : "Index of record to move in the specified category",
//    * }
//    * @returns 
//    *  transactionDetails : {}
//    */

//   async makeTradable(_privateKey, fromAddress, holder, shareCat, recordId) {
//     try {
//       const gasPrice = 2000;

//       const data = await contractInst.methods
//         .moveToTradable(
//           holder,
//           shareCat == 'Tradable'
//             ? 0
//             : shareCat == 'Lien'
//               ? 1
//               : shareCat == 'Allocated'
//                 ? 2
//                 : shareCat == 'Vesting'
//                   ? 3
//                   : '00',
//           recordId
//         )
//         .encodeABI();

//       const privateKey = Buffer.from(_privateKey, 'hex');

//       const nounce = await web3.eth.getTransactionCount(fromAddress);

//       const gasUsed = await contractInst.methods
//         .moveToTradable(
//           holder,
//           shareCat == 'Tradable'
//             ? 0
//             : shareCat == 'Lien'
//               ? 1
//               : shareCat == 'Allocated'
//                 ? 2
//                 : shareCat == 'Vesting'
//                   ? 3
//                   : '00',
//           recordId
//         )
//         .estimateGas({
//           from: fromAddress
//         });

//       const txParams = {
//         nonce: nounce,
//         gasLimit: gasUsed || 1200000,
//         gasPrice: gasPrice * 1000000000,
//         from: fromAddress,
//         to: deployedContractAddr,
//         data,
//         chainId: 5777
//       };

//       const tx = await new EthereumTx(txParams);

//       tx.sign(privateKey);

//       const serializedTx = tx.serialize();
//       const transactionId = await web3.eth.sendSignedTransaction(
//         `0x${serializedTx.toString('hex')}`
//       );

//       return {
//         transactionDetails : transactionId
//       };

//     } catch (error) {
//       return this.errorHandler(error);
//     }
//   }

//   /**
//    * @description : This function allows the Owner | Admins withdraw from a  holder's tokens from any of the categories to tradable
//    * @dev : Called by only Owner | Admins
//    * @params : {
//     *  fromAddress{address} : "Address of the function caller",
//     *  _privateKey{string} : "Private key of the function caller, used to sign the message",
//    *  holder : "holder account",
//    *  amount : "Amount to withdraw, optional for other category except tradable"
//    *  shareCat : "Token category to withdraw from",
//    *  recordId : "Index of record to withdraw in the specified category",
//    * }
//    * @returns 
//    *  transactionDetails : {}
//    */

//   async withdraw(
//     _privateKey,
//     fromAddress,
//     holder,
//     amount,
//     shareCat,
//     recordId,
//     reason
//   ) {
//     try {
//       const gasPrice = 2000;

//       const data = await contractInst.methods
//         .withdraw(
//           holder,
//           amount,
//           shareCat == 'Tradable'
//             ? 0
//             : shareCat == 'Lien'
//               ? 1
//               : shareCat == 'Allocated'
//                 ? 2
//                 : shareCat == 'Vesting'
//                   ? 3
//                   : '00',
//           recordId,
//           web3.utils.toHex(reason)
//         )
//         .encodeABI();

//       const privateKey = Buffer.from(_privateKey, 'hex');

//       const nounce = await web3.eth.getTransactionCount(fromAddress);

//       const gasUsed = await contractInst.methods
//         .withdraw(
//           holder,
//           amount,
//           shareCat == 'Tradable'
//             ? 0
//             : shareCat == 'Lien'
//               ? 1
//               : shareCat == 'Allocated'
//                 ? 2
//                 : shareCat == 'Vesting'
//                   ? 3
//                   : '00',
//           recordId,
//           web3.utils.toHex(reason)
//         )
//         .estimateGas({
//           from: fromAddress
//         });

//       const txParams = {
//         nonce: nounce,
//         gasLimit: gasUsed || 1200000,
//         gasPrice: gasPrice * 1000000000,
//         from: fromAddress,
//         to: deployedContractAddr,
//         data,
//         chainId: 5777
//       };

//       const tx = await new EthereumTx(txParams);

//       tx.sign(privateKey);

//       const serializedTx = tx.serialize();
//       const transactionId = await web3.eth.sendSignedTransaction(
//         `0x${serializedTx.toString('hex')}`
//       );

//       return {
//         transactionDetails : transactionId
//       };
//     } catch (error) {
//       return this.errorHandler(error);
//     }
//   }
// };
