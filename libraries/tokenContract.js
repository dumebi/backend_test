const { web3, EthereumTx } = require("./base.js");
const { compiledTokenContract } = require("./deploy/compile.js");

const deployedContractAddr = "0x1620782a3d70b48720af013cc8d206b2a90727e5";
const contractABI = compiledTokenContract.abi;
const contractInst = new web3.eth.Contract(contractABI, deployedContractAddr);

exports.Token = class {
  /**
   * @def : This function allows the owner transfer ownership to another account
   * @dev : This function should be called by the contract owner
   * @params : {
   *  newOwner : "Address of new owner"
   * }
   * @returns : {
   *  transactionId : {}
   * }
   */
  async transferOwnership(_privateKey, fromAddress, newOwner) {
    try {
      const isValidAddress = await web3.utils.isAddress(newOwner);
      if (!isValidAddress) {
        return "Invalid New Owner Address";
      }

      const privateKey = Buffer.from(_privateKey, "hex");
      const data = await contractInst.methods
        .transferOwnership(newOwner)
        .encodeABI();

      const gasPrice = 2000;
      var nounce = await web3.eth.getTransactionCount(fromAddress, "pending");
      const gasUsed = await contractInst.methods
        .transferOwnership(newOwner)
        .estimateGas({
          from: fromAddress
        });

      const txParams = {
        nonce: nounce,
        gasLimit: gasUsed || 1200000,
        gasPrice: gasPrice * 1000000000,
        from: fromAddress,
        to: deployedContractAddr,
        data,
        chainId: 5777
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

  /**
   * @def : This function allows the manager add and error message
   * @dev : This function should be called by the contract manager/developer
   * @params : {
   *  errorString : "Error code string",
   *  message : "Actual error message"
   * }
   * @returns : {
   *  transactionId : {}
   * }
   */
  async addErrorMessage(_privateKey, fromAddress, errorString, message) {
    try {
      const isValidFrom = await web3.utils.isAddress(fromAddress);
      if (!isValidFrom) {
        return "Invalid initiator address";
      }

      const gasPrice = 4;
      const data = await contractInst.methods
        .addMessage(errorString, message)
        .encodeABI();

      const privateKey = Buffer.from(_privateKey, "hex");
      var nounce = await web3.eth.getTransactionCount(fromAddress);

      const gasUsed = await contractInst.methods
        .addMessage(errorString, message)
        .estimateGas({
          from: fromAddress
        });

      const txParams = {
        nonce: nounce,
        gasLimit: gasUsed || 1200000,
        gasPrice: gasPrice * 1000000000,
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

  /**
   * @def : This function allows the manager update and error message
   * @dev : This function should be called by the contract manager/developer
   * @params : {
   *  errorString : "Error code string",
   *  message : "Actual error message"
   * }
   * @returns : {
   *  errorCodeString(string)
   *  transactionId : {}
   * }
   */
  async updateErrorMessage(_privateKey, fromAddress, errorString, message) {
    try {
      const isValidFrom = await web3.utils.isAddress(fromAddress);
      if (!isValidFrom) {
        return "Invalid initiator address";
      }

      const gasPrice = 4;
      const data = await contractInst.methods
        .updateMessage(errorString, message)
        .encodeABI();

      const privateKey = Buffer.from(_privateKey, "hex");
      var nounce = await web3.eth.getTransactionCount(fromAddress);

      const gasUsed = await contractInst.methods
        .updateMessage(errorString, message)
        .estimateGas({
          from: fromAddress
        });

      const txParams = {
        nonce: nounce,
        gasLimit: gasUsed || 1200000,
        gasPrice: gasPrice * 1000000000,
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

  /**
   * @def : This function allows the manager remove an error message
   * @dev : This function should be called by the contract manager/developer
   * @params : {
   *  errorString : "Error code string"
   * }
   * @returns : {
   *  transactionId : {}
   * }
   */
  async removeErrorMessage(_privateKey, fromAddress, errorString) {
    try {
      const isValidFrom = await web3.utils.isAddress(fromAddress);
      if (!isValidFrom) {
        return "Invalid initiator address";
      }

      const gasPrice = 4;
      const data = await contractInst.methods
        .removeMessage(errorString)
        .encodeABI();

      const privateKey = Buffer.from(_privateKey, "hex");
      var nounce = await web3.eth.getTransactionCount(fromAddress);

      const gasUsed = await contractInst.methods
        .removeMessage(errorString)
        .estimateGas({
          from: fromAddress
        });

      const txParams = {
        nonce: nounce,
        gasLimit: gasUsed || 1200000,
        gasPrice: gasPrice * 1000000000,
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

  /**
   * @def : This function returns the owner address (Super Admin)
   * @dev : This function should be called by the either the contract manager/developer | admin "owner"
   * @returns : {
   *  address
   * }
   */
  async getOwner(fromAddress) {
    try {
      const token = await contractInst.methods;
      const result = await token.owner().call({ from: fromAddress });
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * @def : This function returns the manager / developer address
   * @dev : This function should be called by the either the contract manager/developer | admin "owner"
   * @returns : {
   *  address
   * }
   */
  async getManager(fromAddress) {
    try {
      const token = await contractInst.methods;
      const result = await token.aManager().call({ from: fromAddress });
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * @def : This function returns details of the contract
   * @dev : Can be called by any account
   * @returns : {
        name(string),
        symbol(string),
        granularity(number)
   * }
   */
  async getTokenInfo(fromAddress) {
    try {
      const token = await contractInst.methods;
      const name = await token.sName().call({ from: fromAddress });
      const symbol = await token.sSymbol().call({ from: fromAddress });
      const granularity = await token
        .uGranularity()
        .call({ from: fromAddress });

      return {
        name,
        symbol,
        granularity
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * @def : This function returns the token base account of the contract, where withdrawers are kept
   * @dev : Can be called by either the Owner | Manage/developer | Admins
   * @returns : {
        address
   * }
   */
  async getTokenbase(fromAddress) {
    try {
      const token = await contractInst.methods;
      const result = await token.aCoinbaseAcct().call({ from: fromAddress });
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * @def : This function returns the token base account balance of the contract, where withdrawers are kept
   * @dev : Can be called by either the Owner | Manage/developer | Admins
   * @returns : {
        number
   * }
   */
  async getTokenbaseBal(fromAddress, tokenbase) {
    try {
      const token = await contractInst.methods;
      const result = await token
        .balanceOf(tokenbase)
        .call({ from: fromAddress });
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * @def : This function returns the total supplies of token in the contract
   * @dev : Can be called by either the Owner | Manage/developer | Admins
   * @returns : {
        number
   * }
   */
  async getTotalSupply() {
    try {
      const token = await contractInst.methods;
      const result = await token.totalSupply().call();
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * @def : This function returns the total number of authorizers in the contract
   * @dev : Can be called by either the Owner | Manage/developer | Admins
   */
  async getAuthorizerCount(fromAddress) {
    try {
      const token = await contractInst.methods;
      const result = await token.countAuthorizer().call({ from: fromAddress });
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * @def : This function allows the contract owner / admin add an authorizer to the contract
   * @dev : Can be called by either the Owner | Admins
   * @params : {
   *  authorizer : "address of the account to be made an authhorizer",
   *  type : "What schedule type this authorizer is allowed to authorize, accepts string as 'Pay Scheme' or 'Upfront Scheme' schedule"
   * }
   * @returns : {
        transactionId: {}
   * }
   */
  async addAuthorizer(_privateKey, fromAddress, authorizer, type) {
    try {
      const isValidAddress = await web3.utils.isAddress(authorizer);
      if (!isValidAddress) {
        return "Invalid authorizer address";
      }

      const privateKey = Buffer.from(_privateKey, "hex");
      const data = await contractInst.methods
        .addAuthorizer(authorizer, type == "Pay Scheme" ? 0 : 1)
        .encodeABI();

      const gasPrice = 2000;
      var nounce = await web3.eth.getTransactionCount(fromAddress, "pending");
      const gasUsed = await contractInst.methods
        .addAuthorizer(authorizer, type == "Pay Scheme" ? 0 : 1)
        .estimateGas({
          from: fromAddress
        });

      const txParams = {
        nonce: nounce,
        gasLimit: gasUsed || 1200000,
        gasPrice: gasPrice * 1000000000,
        from: fromAddress,
        to: deployedContractAddr,
        data,
        chainId: 5777
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

  /**
   * @def : This function allows the contract owner / admin remove an authorizer from the contract
   * @dev : Can be called by either the Owner | Admins
   * @params : {
   *  authorizer : "address of the account to be removed as an authhorizer"
   * }
   * @returns : {
   *  transactionId: {}
   * }
   */
  async removeAuthorizer(_privateKey, fromAddress, authorizer) {
    try {
      const isValidAddress = await web3.utils.isAddress(authorizer);
      if (!isValidAddress) {
        return "Invalid authorizer address";
      }

      const privateKey = Buffer.from(_privateKey, "hex");
      const data = await contractInst.methods
        .removeAuthorizer(authorizer)
        .encodeABI();

      const gasPrice = 2000;
      var nounce = await web3.eth.getTransactionCount(fromAddress, "pending");
      const gasUsed = await contractInst.methods
        .removeAuthorizer(authorizer)
        .estimateGas({
          from: fromAddress
        });

      const txParams = {
        nonce: nounce,
        gasLimit: gasUsed || 1200000,
        gasPrice: gasPrice * 1000000000,
        from: fromAddress,
        to: deployedContractAddr,
        data,
        chainId: 5777
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

  /**
   * @def : This function allows the contract owner / admin get details of an authorizer in the contract
   * @dev : Can be called by either the Owner | Admins
   * @params : {
   *  authorizer : "address of the account to be removed as an authhorizer",
   * authorizerId(optional)(number) : "Used if the index possition of the authorizer is known"
   * }
   * @returns : {
   *  authorizer(address),
   *  type(string)
   * }
   */
  async getAuthorizer(fromAddress, authorizer, authorizerId) {
    try {
      const token = await contractInst.methods;
      const result = await token
        .getAuthorizer(authorizer, authorizerId)
        .call({ from: fromAddress });

      return {
        authorizer: result.authorizerAddr,
        type: result.authorizerType == 0 ? "Pay Scheme" : "Upfront Scheme"
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * @def : This function allows the contract owner / admin get authorizers of a schedule, approved or not
   * @dev : Can be called by either the Owner | Admins
   * @params : {
   *  scheduleId : "Unique schedule id",
   *  authorizerId : "Unique position of authorizer in the schedule, always within [0,1,2]"
   * }
   * @returns : {
   *  authorizer : "address of the authorizer",
   *  reasone : "Reason for approval or rejection"
   * }
   */
  async getScheduleAuthorizer(fromAddress, scheduleId, authorizerIndex) {
    try {
      const token = await contractInst.methods;
      const result = await token
        .getScheduleAuthorizer(scheduleId, authorizerIndex)
        .call({ from: fromAddress });
      const reason = await web3.utils.toString(result.reason);
      return {
        authorizer: result.authorizerAddress,
        reason
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * @def : This function allows the contract owner / admin check if a shareholder is valid or not
   * @dev : Can be called by either the Owner | Admins
   * @params : {
   *  holder : "address of the shareholder"
   * }
   */
  async isValidShareholder(fromAddress, holder) {
    try {
      const token = await contractInst.methods;
      const result = await token.isValid(holder).call({ from: fromAddress });

      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * @def : This function allows the contract owner / admin check if a shareholder is withheld from operations
   * @dev : Can be called by either the Owner | Admins
   * @params : {
   *  holder : "address of the shareholder"
   * }
   */
  async isWithhold(fromAddress, holder) {
    try {
      const token = await contractInst.methods;
      const result = await token.isWithhold(holder).call({ from: fromAddress });

      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * @def : This returns the tradable balance of a shareholder
   * @dev : Can be called by anyone
   */
  async getBalance(fromAddress, holder) {
    try {
      const result = await contractInst.methods
        .balanceOf(holder)
        .call({ from: fromAddress });
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * @def : This function allows a shareholder make a transfer of token
   * @dev : Called by only shareholders
   * @params : {
   *  holder : "address of the recipient",
   * amount : "Amount to transfer"
   * }
   */
  async transfer(_privateKey, fromAddress, recipient, amount) {
    try {
      const isValidHolder = await web3.utils.isAddress(recipient);
      const isValidFrom = await web3.utils.isAddress(fromAddress);

      if (!isValidHolder) {
        return "Invalid shareholder address";
      }
      if (!isValidFrom) {
        return "Invalid initiator address";
      }

      const gasPrice = 4;

      const data = await contractInst.methods
        .transfer(recipient, amount)
        .encodeABI();

      const privateKey = Buffer.from(_privateKey, "hex");

      var nounce = await web3.eth.getTransactionCount(fromAddress);

      const gasUsed = await contractInst.methods
        .transfer(recipient, amount)
        .estimateGas({
          from: fromAddress
        });

      const txParams = {
        nonce: nounce,
        gasLimit: gasUsed || 1200000,
        gasPrice: gasPrice * 1000000000,
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

  /**
   * @def : This function allows a shareholder approve an account to transfer a certain amount from his/her account
   * @dev : Called by only shareholders
   * @params : {
   *  spender : "address of the spender",
   *  amount : "Amount to allow for the spender"
   * }
   */

  async approveSender(_privateKey, fromAddress, spender, amount) {
    try {
      const isValidHolder = await web3.utils.isAddress(spender);
      const isValidFrom = await web3.utils.isAddress(fromAddress);

      if (!isValidHolder) {
        return "Invalid shareholder address";
      }
      if (!isValidFrom) {
        return "Invalid initiator address";
      }

      const gasPrice = 4;

      const data = await contractInst.methods
        .approve(spender, amount)
        .encodeABI();

      const privateKey = Buffer.from(_privateKey, "hex");

      var nounce = await web3.eth.getTransactionCount(fromAddress);

      const gasUsed = await contractInst.methods
        .approve(spender, amount)
        .estimateGas({
          from: fromAddress
        });

      const txParams = {
        nonce: nounce,
        gasLimit: gasUsed || 1200000,
        gasPrice: gasPrice * 1000000000,
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

  /**
   * @def : This function returns how much a spender has on a holders account
   * @dev : Called by anyone
   * @params : {
   *  holder : "address of the account owner",
   *  spender : "Address of spender"
   * }
   */

  async getAllowance(fromAddress, holder, spender) {
    try {
      const token = await contractInst.methods;
      const result = await token
        .allowance(holder, spender)
        .call({ from: fromAddress });
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * @def : This function allows a spender, transfer from a holder's account
   * @dev : Called by the spender account
   * @params : {
   *  holder : "address of the account owner",
   *  recipient : "Address of recipient",
   *  amount : " Amount to transfer"
   * }
   */

  async transferFrom(_privateKey, fromAddress, holder, recipient, amount) {
    try {
      const isValidHolder = await web3.utils.isAddress(recipient);
      const isValidFrom = await web3.utils.isAddress(fromAddress);

      if (!isValidHolder) {
        return "Invalid shareholder address";
      }
      if (!isValidFrom) {
        return "Invalid initiator address";
      }

      const gasPrice = 4;

      const data = await contractInst.methods
        .transferFrom(holder, recipient, amount)
        .encodeABI();

      const privateKey = Buffer.from(_privateKey, "hex");

      var nounce = await web3.eth.getTransactionCount(fromAddress);

      const gasUsed = await contractInst.methods
        .transferFrom(holder, recipient, amount)
        .estimateGas({
          from: fromAddress
        });

      const txParams = {
        nonce: nounce,
        gasLimit: gasUsed || 1200000,
        gasPrice: gasPrice * 1000000000,
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

  /**
   * @def : This function allows the contract owner | admins add a shareholder
   * @dev : Called by Owner | Admins
   * @params : {
   *  holder : "address of the shareholder",
   *  isEnabled : "accepts a boolean field, sets the shareholder to valid or not",
   *  isWithhold : "accepts a boolean field, sets the shareholder to withhold or not"
   * }
   */

  async addShareholder(
    _privateKey,
    fromAddress,
    holder,
    isEnabled,
    isWithhold
  ) {
    try {
      const isValidAddress = await web3.utils.isAddress(holder);

      if (!isValidAddress) {
        return "Invalid from address";
      }

      const gasPrice = 2000;

      const data = await contractInst.methods
        .addShareholder(holder, isEnabled, isWithhold)
        .encodeABI();

      const privateKey = Buffer.from(_privateKey, "hex");

      var nounce = await web3.eth.getTransactionCount(fromAddress, "pending");

      const gasUsed = await contractInst.methods
        .addShareholder(holder, isEnabled, isWithhold)
        .estimateGas({
          from: fromAddress
        });

      const txParams = {
        nonce: nounce,
        gasLimit: gasUsed || 1200000,
        gasPrice: gasPrice.high * 1000000000,
        from: fromAddress,
        to: deployedContractAddr,
        data,
        chainId: 5777
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
  }

  /**
   * @def : This function returns a shareholder details
   * @dev : Called anyone
   * @params : {
   *  holder : "address of the shareholder"
   * }
   * @returns : {
        isEnabled : bool,
        isWithhold : bool,
        tradable : number,
        allocated : number,
        vesting : number,
        lien : number
   * }
   */

  async getShareholder(fromAddress, holder) {
    try {
      const {
        isEnabled,
        isWithhold,
        tradable,
        allocated,
        vesting,
        lien
      } = await contractInst.methods
        .getShareHolder(holder)
        .call({ from: fromAddress });

      return {
        isEnabled,
        isWithhold,
        tradable,
        allocated,
        vesting,
        lien
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * @def : This function updates a shareholder details
   * @dev : Called Owner | Admin
   * @params : {
   *  holder : "address of the shareholder",
   *  access : "Accepts bool, if holder is valid or not"
   *  withhold : "Accepts bool, if holder is withhold or not"
   * }
   * @returns : {
        transactionObject : {}
   * }
   */

  async updateShareholder(_privateKey, fromAddress, holder, access, withhold) {
    try {
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

      const gasPrice = 2000;

      const data = await contractInst.methods
        .updateShareHolder(holder, access, withhold)
        .encodeABI();

      const privateKey = Buffer.from(_privateKey, "hex");

      var nounce = await web3.eth.getTransactionCount(fromAddress);

      const gasUsed = await contractInst.methods
        .updateShareHolder(holder, access, withhold)
        .estimateGas({
          from: fromAddress
        });

      const txParams = {
        nonce: nounce,
        gasLimit: gasUsed || 1200000,
        gasPrice: gasPrice * 1000000000,
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

  /**
   * @def : This function returns a shareholder details
   * @dev : Called anyone
   * @params : {
   *  holder : "address of the shareholder",
   *  category : "Token record category to pull from, accepts a string, any from ["Tradable" , "Lien", "Allocated", "Vesting" ],
   *  recordId : "Index of the specific record to pull in this category, accepts a number"
   * }
   * @returns : {
        amount : |Amount,
        dateAdded : "Date added",
        duration : "This can mean lien period for Liens or dueDate for Allocated",
        isMovedToTradable : "Weather or not the record has been moved to tradable"
   * }
   */

  async getRecordByCat(fromAddress, holder, category, recordId) {
    try {
      const {
        amount,
        dateAdded,
        duration,
        isMovedToTradable
      } = await contractInst.methods
        .getRecordByCat(
          holder,
          category == "Tradable"
            ? 0
            : shareCat == "Lien"
            ? 1
            : shareCat == "Allocated"
            ? 2
            : shareCat == "Vesting"
            ? 3
            : "00",
          recordId
        )
        .call({ from: fromAddress });

      return {
        amount,
        dateAdded,
        duration,
        isMovedToTradable
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * @def : This function allows Owner or admins create a new schedule
   * @dev : Called by only Owner | Admins
   * @params : {
   *  scheduleId : "Unique id for the schedule, used to update or pull schedule details later on",
   *  amount : "Amount specified for the schedule",
   *  scheduleType : "Either 'Pay Scheme' or 'Upfront Scheme' ",
   *  reason : "Accepts a string, reason for creating the schedule"
   * }
   * @returns : {
        transactionObject : {}
   * }
   */

  async createSchedule(
    _privateKey,
    fromAddress,
    scheduleId,
    amount,
    scheduleType,
    reason
  ) {
    try {
      const gasPrice = 2000;

      const data = await contractInst.methods
        .createSchedule(
          scheduleId,
          amount,
          scheduleType == "Pay Scheme" ? 0 : 1,
          web3.utils.toHex(reason)
        )
        .encodeABI();

      const privateKey = Buffer.from(_privateKey, "hex");

      var nounce = await web3.eth.getTransactionCount(fromAddress);

      const gasUsed = await contractInst.methods
        .createSchedule(
          scheduleId,
          amount,
          scheduleType == "Pay Scheme" ? 0 : 1,
          web3.utils.toHex(reason)
        )
        .estimateGas({
          from: fromAddress
        });

      const txParams = {
        nonce: nounce,
        gasLimit: gasUsed || 1200000,
        gasPrice: gasPrice * 1000000000,
        from: fromAddress,
        to: deployedContractAddr,
        data,
        chainId: 5777
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

  /**
   * @def : This function allows Owner or admins remove a schedule
   * @dev : Called by only Owner | Admins
   * @params : {
   *  scheduleId : "Unique id for the schedule, used to update or pull schedule details later on",
   *  reason : "Accepts a string, reason for removing the schedule"
   * }
   * @returns : {
        transactionObject : {}
   * }
   */

  async removeSchedule(_privateKey, fromAddress, scheduleId, reason) {
    try {
      const gasPrice = 2000;

      const data = await contractInst.methods
        .removeSchedule(scheduleId, web3.utils.toHex(reason))
        .encodeABI();

      const privateKey = Buffer.from(_privateKey, "hex");

      var nounce = await web3.eth.getTransactionCount(fromAddress);

      const gasUsed = await contractInst.methods
        .removeSchedule(scheduleId, web3.utils.toHex(reason))
        .estimateGas({
          from: fromAddress
        });

      const txParams = {
        nonce: nounce,
        gasLimit: gasUsed || 1200000,
        gasPrice: gasPrice * 1000000000,
        from: fromAddress,
        to: deployedContractAddr,
        data,
        chainId: 5777
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

  /**
   * @def : This returns a schedule details
   * @dev : Called by only Owner | Admins | manager
   * @params : {
   *  scheduleId : "Unique id for the schedule, used to identify the schedule",
   *  reason : "Accepts a string, reason for removing the schedule"
   * }
   * @returns : {
        scheduleType(string),
        amount : "Amount schedule was created with",
        activeAmount : "What is left to be minted",
        isActive(bool) : "Specifiez if the schedule is still minting or not",
        isApproved(bool),
        isRejected(bool)
   * }
   */

  async getSchedule(fromAddress, scheduleId) {
    try {
      const {
        scheduleType,
        amount,
        activeAmount,
        isActive,
        isApproved,
        isRejected
      } = await contractInst.methods
        .getSchedule(scheduleId)
        .call({ from: fromAddress });

      return {
        scheduleType: scheduleType == 0 ? "Pay Scheme" : "Upfront Scheme",
        amount,
        activeAmount,
        isActive,
        isApproved,
        isRejected
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * @def : This function allows the authorizer approve a schedule
   * @dev : Called by only authorizers
   * @params : {
   *  scheduleId : "Unique schedule id",
   *  reason : "Reasone for approval"
   * }
   * @returns : {
   *  transactionId : {}
   * }
   */

  async approveSchedule(_privateKey, fromAddress, scheduleId, reason) {
    try {
      const privateKey = Buffer.from(_privateKey, "hex");
      const data = await contractInst.methods
        .approveSchedule(scheduleId, web3.utils.toHex(reason))
        .encodeABI();

      const gasPrice = 2000;
      var nounce = await web3.eth.getTransactionCount(fromAddress, "pending");
      const gasUsed = await contractInst.methods
        .approveSchedule(scheduleId, web3.utils.toHex(reason))
        .estimateGas({
          from: fromAddress
        });

      const txParams = {
        nonce: nounce,
        gasLimit: gasUsed || 1200000,
        gasPrice: gasPrice * 1000000000,
        from: fromAddress,
        to: deployedContractAddr,
        data,
        chainId: 5777
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

  /**
   * @def : This function allows the authorizer reject a schedule
   * @dev : Called by only authorizers
   * @params : {
   *  scheduleId : "Unique schedule id",
   *  reason : "Reasone for approval"
   * }
   * @returns : {
   *  transactionId : {}
   * }
   */

  async rejectSchedule(_privateKey, fromAddress, scheduleId, reason) {
    try {
      const privateKey = Buffer.from(_privateKey, "hex");
      const data = await contractInst.methods
        .rejectSchedule(scheduleId, web3.utils.toHex(reason))
        .encodeABI();

      const gasPrice = 2000;
      var nounce = await web3.eth.getTransactionCount(fromAddress, "pending");
      const gasUsed = await contractInst.methods
        .rejectSchedule(scheduleId, web3.utils.toHex(reason))
        .estimateGas({
          from: fromAddress
        });

      const txParams = {
        nonce: nounce,
        gasLimit: gasUsed || 1200000,
        gasPrice: gasPrice * 1000000000,
        from: fromAddress,
        to: deployedContractAddr,
        data,
        chainId: 5777
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
  }

  /**
   * @def : This function allows the Owner | Admins mint tokens to an account
   * @dev : Called by only Owner | Admins
   * @params : {
   *  scheduleId : "Unique schedule id",
   *  recipient : "recipient account",
   *  amount : "How much to mint to recipient",
   *  shareCat : "Recipient share category to mint to",
   *  duration(number) : "For Lien, this means the duration and for Allocated this is dueDate"
   *  reason : "Reasone for minting to recipient account"
   * }
   * @returns : {
   *  transactionId : {}
   * }
   */

  async mint(
    _privateKey,
    fromAddress,
    scheduleId,
    recipient,
    amount,
    shareCat,
    duration = 0,
    reason
  ) {
    try {
      const gasPrice = 2000;

      const data = await contractInst.methods
        .mint(
          scheduleId,
          recipient,
          amount,
          shareCat == "Tradable"
            ? 0
            : shareCat == "Lien"
            ? 1
            : shareCat == "Allocated"
            ? 2
            : shareCat == "Vesting"
            ? 3
            : "00",
          duration,
          web3.utils.toHex(reason)
        )
        .encodeABI();

      const privateKey = Buffer.from(_privateKey, "hex");

      var nounce = await web3.eth.getTransactionCount(fromAddress);

      const gasUsed = await contractInst.methods
        .mint(
          scheduleId,
          recipient,
          amount,
          shareCat == "Tradable"
            ? 0
            : shareCat == "Lien"
            ? 1
            : shareCat == "Allocated"
            ? 2
            : shareCat == "Vesting"
            ? 3
            : "00",
          duration,
          web3.utils.toHex(reason)
        )
        .estimateGas({
          from: fromAddress
        });

      const txParams = {
        nonce: nounce,
        gasLimit: gasUsed || 1200000,
        gasPrice: gasPrice * 1000000000,
        from: fromAddress,
        to: deployedContractAddr,
        data,
        chainId: 5777
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

  /**
   * @def : This function allows the Owner | Admins move holder's tokens from any of the categories to tradable
   * @dev : Called by only Owner | Admins
   * @params : {
   *  holder : "holder account",
   *  shareCat : "Token category to move to tradable",
   *  recordId : "Index of record to move in the specified category",
   * }
   * @returns : {
   *  transactionId : {}
   * }
   */

  async makeTradable(_privateKey, fromAddress, holder, shareCat, recordId) {
    try {
      const gasPrice = 2000;

      const data = await contractInst.methods
        .moveToTradable(
          holder,
          shareCat == "Tradable"
            ? 0
            : shareCat == "Lien"
            ? 1
            : shareCat == "Allocated"
            ? 2
            : shareCat == "Vesting"
            ? 3
            : "00",
          recordId
        )
        .encodeABI();

      const privateKey = Buffer.from(_privateKey, "hex");

      var nounce = await web3.eth.getTransactionCount(fromAddress);

      const gasUsed = await contractInst.methods
        .moveToTradable(
          holder,
          shareCat == "Tradable"
            ? 0
            : shareCat == "Lien"
            ? 1
            : shareCat == "Allocated"
            ? 2
            : shareCat == "Vesting"
            ? 3
            : "00",
          recordId
        )
        .estimateGas({
          from: fromAddress
        });

      const txParams = {
        nonce: nounce,
        gasLimit: gasUsed || 1200000,
        gasPrice: gasPrice * 1000000000,
        from: fromAddress,
        to: deployedContractAddr,
        data,
        chainId: 5777
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

  /**
   * @def : This function allows the Owner | Admins withdraw from a  holder's tokens from any of the categories to tradable
   * @dev : Called by only Owner | Admins
   * @params : {
   *  holder : "holder account",
   *  amount : "Amount to withdraw, optional for other category except tradable"
   *  shareCat : "Token category to withdraw from",
   *  recordId : "Index of record to withdraw in the specified category",
   * }
   * @returns : {
   *  transactionId : {}
   * }
   */

  async withdraw(
    _privateKey,
    fromAddress,
    holder,
    amount,
    shareCat,
    recordId,
    reason
  ) {
    try {
      const gasPrice = 2000;

      const data = await contractInst.methods
        .withdraw(
          holder,
          amount,
          shareCat == "Tradable"
            ? 0
            : shareCat == "Lien"
            ? 1
            : shareCat == "Allocated"
            ? 2
            : shareCat == "Vesting"
            ? 3
            : "00",
          recordId,
          web3.utils.toHex(reason)
        )
        .encodeABI();

      const privateKey = Buffer.from(_privateKey, "hex");

      var nounce = await web3.eth.getTransactionCount(fromAddress);

      const gasUsed = await contractInst.methods
        .withdraw(
          holder,
          amount,
          shareCat == "Tradable"
            ? 0
            : shareCat == "Lien"
            ? 1
            : shareCat == "Allocated"
            ? 2
            : shareCat == "Vesting"
            ? 3
            : "00",
          recordId,
          web3.utils.toHex(reason)
        )
        .estimateGas({
          from: fromAddress
        });

      const txParams = {
        nonce: nounce,
        gasLimit: gasUsed || 1200000,
        gasPrice: gasPrice * 1000000000,
        from: fromAddress,
        to: deployedContractAddr,
        data,
        chainId: 5777
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
