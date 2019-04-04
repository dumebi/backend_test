/* eslint-disable no-nested-ternary */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-useless-constructor */
const { ethers, ethProvider } = require('./base.js');
const { compiledTokenContract } = require('../blockchain/compile.js');
const {config} = require('../helpers/utils');
const deployedContractAddr = config.contract;
const contractABI = compiledTokenContract.abi;

// // Contract Deployment Params

// // _symbol {string}  The Token Symbol
// // _name:  {string}  The Token Name
// // _granular: {uint8} The Token Granularity
// // _tokenbase: {address} The Tokenbase address, where withdrawed tokens will sit
// // owner: {address}    The Token Contract owner Address

// Error Meaning

// errorCode: "UNVERIFIED_HOLDER",
// Meaning: "Only verified SIT holders can perform this transaction"
// errorCode: "RECEIPT_TRANSFER_BLOCKED",
// Meaning: "Recipient not authorized"
// errorCode: "SEND_TRANSFER_BLOCKED",
// Meaning: "Sender not authorized"
// errorCode: "TOKEN_GRANULARITY_ERROR",
// Meaning: "Token cannot be granular below the specified granularity"
// errorCode: "TRANSFER_VERIFIED_ERROR",
// Meaning: "Off-Chain approval for restricted token"
// errorCode: "INSUFFICIENT_BALANCE_ERROR",
// Meaning: "You do not have sufficient balance for this transaction"
// errorCode: "INVALID_AMOUNT_ERROR",
// Meaning: "Token amount specified is invalid"
// errorCode: "SPENDER_BALANCE_ERROR",
// Meaning: "Amount specified is morethan spendable amount"
// errorCode: "ACCOUNT_WITHHOLD_ERROR",
// Meaning: "Account on hold"
// errorCode: "MOVE_LIEN_ERROR",
// Meaning: "Lien cannot be moved to tradable balance, lien period not over yet"
// errorCode: "UNIQUE_SHAREHOLDER_ERROR",
// Meaning: "Shareholder already added before!"


// Available Functionality
//    name: createSchedule
// 		name: approve
// 		name: totalSupply
// 		name: totalInEscrow
// 		name: sSymbol
// 		name: transferFrom
// 		name: isAdmin
// 		name: isWithhold"
// 		name: uGranularity"
// 		name: balanceOf
// 		name: getAuthorizer
// 		name: messageForTransferRestriction
// 		name: mint
// 		name: isValid
// 		name: approveSchedule
// 		name: transfer
// 		name: aTokenbase
// 		name: addToEscrow
// 		name: removeFromEscrow
// 		name: addShareholder
// 		name: detectTransferRestriction
// 		name: getShareHolder
// 		name: addAuthorizer
// 		name: sName
// 		name: allowance
// 		name: aManager


exports.Token = class {
  errorHandler(error) {
    console.log('er > ', error)
    // solidity error
    if (error.name === 'RuntimeError') {
      console.log('RuntimeError')
      return {
        ok: false,
        message: error.reason,
        field: error.arg,
        error: error.data.stack
      }
    }
    //VM Revert error
    if (error.code == "-32000"){
      console.log("32000")
      return {
        ok : false,
        message : error.data.stack,
        field : error.arg,
        error: error.data.stack
      }
    }
    if (!error.reason) {
      return {
        ok: false,
        message: error.reason,
        field : {},
        error : error
      }
    }
  }


  constructor(_privateKey) {
    this.wallet = new ethers.Wallet(_privateKey, ethProvider);
    this.contractInst = new ethers.Contract(deployedContractAddr, contractABI, ethProvider);
    this.contractTX = new ethers.Contract(deployedContractAddr, contractABI, this.wallet);
  }


  /**
   * @description : This function allows the owner transfer ownership to another account
   * @dev : This function should be called by the contract owner
   * @params : {
   *  newOwner{string} : "Address of new owner"
   * }
   * @returns
   *  ok : {boolean}
   *  transactionDetails : {object}
   */
  async transferOwnership(newOwner) {
    try {

      const tx = await this.contractTX
        .transferOwnership(newOwner)
      
      await tx.wait();
      console.loglog("tx  >> ", tx)

      return {
          ok : true,
        ok   : true,
        transactionDetails : tx
      };
    } catch (error) {
      return this.errorHandler(error);
    }
  }


  /**
   * @description : This function returns the owner address (Super Admin)
   * @dev : This function should be called by the either the contract manager/developer | admin "owner"
   * @returns {address} Address of the contract owner, super admin
   */
  async getOwner() {
    try {
      const result = await this.contractInst.owner()
      
      return result;
    } catch (error) {
      return this.errorHandler(error);
    }
  }

  /**
   * @description : This function returns the manager / developer address
   * @dev : This function should be called by the either the contract manager/developer | admin "owner"
   * @returns {address} Address of the contract owner, super admin
   */
  async getManager() {
    try {
      const result = await this.contractInst.aManager()
      return result;

    } catch (error) {
      return this.errorHandler(error);
    }
  }

  /**
   * @description : This function returns details of the contract
   * @dev : Can be called by any account
   * @params : {
   *    fromAddress{address} : "Address of the function caller"
   * }
   * @returns
        name{string}          Token Name
        symbol{string}        Token Symbol
        granularity{number}   Token Granularity
   *
   */
  async getTokenInfo() {
    try {
      const name = await this.contractInst.sName()
      const symbol = await this.contractInst.sSymbol()
      const granularity = await this.contractInst.uGranularity()
        

      return {
        name,
        symbol,
        granularity
      };
    } catch (error) {
      return this.errorHandler(error);
    }
  }

  /**
   * @description : This function returns the token base account of the contract, where withdrawers are kept
   * @dev : Can be called by either the Owner | Manage/developer | Admins
   * @returns {address} : "Address of the token base"
   */
  async getTokenbase() {
    try {
      const result = await this.contractInst.aTokenbase()
      return result;

    } catch (error) {
      return this.errorHandler(error);
    }
  }

  /**
   * @description : This function returns the token base balance of the contract, where withdrawers are kept
   * @dev : Can be called by either the Owner | Manage/developer | Admins
   * @params : {
   *  tokenbase {address} : "Address of token base"
   * }
   * @returns {Number}  Token base balance
   */
  async getTokenbaseBal(tokenbase) {
    try {

      const result = await this.contractInst.balanceOf(tokenbase)
      return result.toNumber()

    } catch (error) {
      return this.errorHandler(error);
    }
  }

  /**
   * @description : This function returns the total supplies of token in the contract
   * @dev : Can be called by either the Owner | Manage/developer | Admins
   * @returns {Number}    Total supply of tokens at any given time
   */
  async getTotalSupply() {
    try {
      const result = await this.contractInst.totalSupply()
      return result.toNumber()

    } catch (error) {
      return this.errorHandler(error);
    }
  }

  /**
   * @description : This function allows the contract owner change contract manager
   * @dev : Can be called by only the owner
   * @params : {
    *  manager{string} : "address of the new account to be made manager",}
   * @returns
        transactionDetails: {}
   */
  async changeManager(manager) {
    try {
      
      manager = ethers.utils.getAddress(manager)

      const tx = await this.contractTX.changeManager(manager)
      await tx.wait()
      console.log("tx >>  ", tx)

      return {
          ok : true,
        transactionDetails : tx
      };

    } catch (error) {
      return this.errorHandler(error);
    }
  }

  /**
   * @description : This function allows the contract owner add an admin to the contract
   * @dev : Can be called by only the owner
   * @params : {
    *  admin{address} : "address of the account to be made an admin",}
   * @returns 
        transactionDetails: {}
   */
  async addAdmin(admin) {
    try {
    
      admin = ethers.utils.getAddress(admin)

      const tx = await this.contractTX.addAdmin(admin)
      await tx.wait()
      console.log("tx >>  ", tx)

      return {
          ok : true,
        transactionDetails : tx
      };
      
    } catch (error) {
      return this.errorHandler(error);
    }
  }

  /**
   * @description : This function allows the contract owner remove an admin from the contract
   * @dev : Should be called by the contract Owner
   * @params : {
    *  admin : "address of the account to be removed as an admin"
   * }
   * @returns
   *  transactionDetails: {}
   */
  async removeAdmin(admin) {
    try {
      
      admin = ethers.utils.getAddress(admin)

      const tx = await this.contractTX.removeAdmin(admin)
      await tx.wait()
      console.log("tx >>  ", tx)

      return {
          ok : true,
        transactionDetails :tx
      };
    } catch (error) {
      return this.errorHandler(error);
    }
  }


  /**
   * @description : This function allows the contract owner / admin check if a shareholder is withheld from operations
   * @dev : Can be called by either the Owner | Admins
   * @params : {
   *  holder{address} : "address of the shareholder"
   * }
   * @returns {boolean}
   */
  async isWithhold(holder) {
    try {
      const result = await this.contractInst.isWithhold(holder)

      return result;
    } catch (error) {
      return this.errorHandler(error);
    }
  }

  /**
   * @description : This returns the tradable balance of a shareholder
   * @dev : Can be called by anyone
   * @params : {
   *  holder{address} : "address of the shareholder"
   * }
   * @returns {Number}  Share holder balance
   */
  async getBalance(holder) {
    try {
      const result = await this.contractInst.balanceOf(holder)
        
      return result.toNumber();
    } catch (error) {
      return this.errorHandler(error);
    }
  }

  /**
   * @description : This function allows a shareholder make a transfer of token
   * @dev : Called by only shareholders
   * @params : {
   *  holder{address} : "address of the recipient",
   *  amount{Number} : "Amount to transfer"
   */
  async transfer(recipient, amount) {
    try {
      
      recipient = ethers.utils.getAddress(recipient)

      const tx = await this.contractTX.transfer(recipient, amount)
      await tx.wait();
      console.log("tx >> ", tx)

      return {
          ok : true,
        transactionDetails : tx
      };

    } catch (error) {
      return this.errorHandler(error);
    }
  }

  /**
   * @description : This function returns how much a shareholder has in escrow
   * @dev : Called by anyone
   * @params : {
   *  holder : "address of the account owner"
   * @returns {Number}    Spender allowance
   */

  async getTotalInEscrow(holder) {
    try {

      holder = ethers.utils.getAddress(holder)

      const result = await this.contractInst.totalInEscrow(holder)
        
      return  result.toNumber();
    } catch (error) {
      return this.errorHandler(error);
    }
  }

  /**
   * @description : This function adds a shareholder shares to the escrow account
   * @dev : Used in for the exchange functionality
   * @params : {
   *  amount{Number} : " Amount to transfer"
   * @returns :
   * transactionDetails {object}
   */

  async addToEscrow(amount) {
    try {
      holder = ethers.utils.getAddress(holder)

      const tx = await this.contractInst
        .addToEscrow(amount)
      await tx.wait();
      console.log("tx >> ", tx)

      return {
          ok : true,
        transactionDetails : tx
      };

    } catch (error) {
      return this.errorHandler(error);
    }
  }


  /**
   * @description : This function allows the contract owner | admins add a shareholder
   * @dev : Called by Owner | Admins
   * @params : {
   *  holder{address} : "address of the shareholder",
   *  isEnabled{boolean} : "accepts a boolean field, sets the shareholder to valid or not",
   *  isWithhold{boolean} : "accepts a boolean field, sets the shareholder to withhold or not"
   * @returns
   * transactionDetails {object}
   */

  async addShareholder(
    holder,
    isWithhold
  ) {
    try {
      holder = ethers.utils.getAddress(holder)

      const tx = await this.contractTX.addShareholder(holder, isWithhold)
      await tx.wait();
      console.log("tx >> ", tx)
  
      return {
          ok : true,
        transactionDetails : tx
      };
    } catch (error) {
      return this.errorHandler(error);
    }
  }

  /**
   * @description : This function returns a shareholder details
   * @dev : Called anyone
   * @params : {
   *  holder{address} : "address of the shareholder"
   * }
   * @returns
   *    shareholder {address}
        isWithhold {bool}
        tradable {number}
        allocated {number}
        vesting {number}
        lien {number}
   */

  async getShareholder(holder) {
    try {

      const {
        shareholder,
        isWithhold,
        tradable,
        allocated,
        vesting,
        lien
      } = await this.contractInst.getShareHolder(holder)
        

      return {
        shareholder,
        isWithhold,
        tradable : tradable.toNumber(),
        allocated: allocated.toNumber(),
        vesting: vesting.toNumber(),
        lien: lien.toNumber(),
      };

    } catch (error) {
      return this.errorHandler(error);
    }
  }

  /**
   * @description : This function updates a shareholder details
   * @dev : Called Owner | Admin
   * @params : {
   *  holder : "address of the shareholder",
   *  withhold : "Accepts bool, if holder is withhold or not"
   * }
   * @returns
        transactionDetails {object}
   */

  async updateShareholder(holder, withhold) {
    try {
      holder = ethers.utils.getAddress(holder)

      const tx = await this.contractTX.updateShareHolder(holder, access, withhold)
        await tx.wait();
        console.log("tx >> ", tx)
    
        return {
          ok : true,
          transactionDetails : tx
        };

      } catch (error) {
      return this.errorHandler(error);
    }
  }

  /**
   * @description : This function allows the contract owner | admins add a shareholder
   * @dev : Called by Owner | Admins
   * @params : {
   *  holder{address} : "address of the shareholder",
   * @returns
        transactionDetails {object}
   */

  async removeShareholder(
    holder
  ) {
    try {
      holder = ethers.utils.getAddress(holder)

      const tx = await this.contractTX.removeShareholder(holder)

      await tx.wait();
      console.log("tx >> ", tx)
  
      return {
          ok : true,
        transactionDetails : tx
      };
    } catch (error) {
      return this.errorHandler(error);
    }
  }

  /**
   * @description : This function returns a shareholder details
   * @dev : Called by anyone
   * @params : {
   *  holder{address} : "address of the shareholder",
   *  category{string} : "Token record category to pull from, accepts a string, any from ["Tradable" , "Lien", "Allocated", "Vesting" ],
   *  recordId{String} : "Index of the specific record to pull in this category, accepts a number"
   * }
   * @returns
        amount{Number}                Amount,
        dateAdded{Date}               Date added,
        recordId {String}
        isWithdrawn{Boolean}          This can mean lien period for Liens or dueDate for Allocated,
        isMovedToTradable{Boolean}    Weather or not the record has been moved to tradable
   */

  async getRecordByCat(holder, category, recordId) {
    try {
      const {
        recordId,
        amount,
        dateAdded,
        duration,
        isWithdrawn,
        isMovedToTradable
      } = await this.contractInst.recordByCat(
          holder,
          category === 'Tradable'
            ? 0
            : category === 'Lien'
              ? 1
              : category === 'Allocated'
                ? 2
                : category === 'Vesting'
                  ? 3
                  : '00',
          recordId
        )
        

      return {
        recordId,
        amount,
        dateAdded,
        duration,
        isWithdrawn,
        isMovedToTradable
      };
    } catch (error) {
      return this.errorHandler(error);
    }
  }

  /**
   * @description : This function allows Owner or admins create a new schedule
   * @dev : Called by only Owner | Admins
   * @params : {
   *  scheduleId{Number} : "Unique id for the schedule, used to update or pull schedule details later on",
   *  amount{Number} : "Amount specified for the schedule",
   *  scheduleType{String} : "Either 'Pay Scheme' or 'Upfront Scheme' ",
   *  reason{String} : "Accepts a string, reason for creating the schedule"
   * }
   * @returns
   *    ok : {boolean}
        transactionDetails : {object}
   */

  async createSchedule(
    scheduleId,
    amount,
    scheduleType,
    reason
  ) {
    try {
      console.log("schedule id >> ", ethers.utils.formatBytes32String(scheduleId))
      const tx = await this.contractTX
        .createSchedule(
          ethers.utils.formatBytes32String(scheduleId),
          amount,
          scheduleType == 'Pay Scheme' ? 0 : 1,
          ethers.utils.formatBytes32String (reason)
        )
        console.log("tx before>> ", tx)
      const result = await tx.wait()
      console.log("tx adter>> ", tx, "result >> ", result)

      return {
          ok : true,
        transactionDetails : tx
      };
    } catch (error) {
      return this.errorHandler(error);
    }
  }

  /**
   * @description : This function allows Owner or admins remove a schedule
   * @dev : Called by only Owner | Admins
   * @params : {
   *  scheduleId{Number} : "Unique id for the schedule, used to update or pull schedule details later on",
   *  reason{String} : "Accepts a string, reason for removing the schedule"
   * }
   * @returns
   *    ok : {boolean}
        transactionDetails : {object}
   */

  async removeSchedule(scheduleId, reason) {
    try {

      const tx = await this.contractInst.removeSchedule(scheduleId, ethers.utils.formatBytes32String (reason))
      await tx.wait()
      console.log("tx >> ", tx)
  
      return {
          ok : true,
        transactionDetails : tx
      };
    } catch (error) {
      return this.errorHandler(error);
    }
  }

  /**
   * @description : This returns a schedule details
   * @dev : Called by only Owner | Admins | manager
   * @params : {
   *  scheduleId{Number} : "Unique id for the schedule, used to identify the schedule"
   * }
   * @returns
        scheduleType{string},
        amount{Number}                Amount schedule was created with
        activeAmount{Number}          What is left to be minted
        isActive{Boolean}             Specifiez if the schedule is still minting or not
        isApproved{Boolean},          Returns true if the schedule has been approved and false if not
        isRejected{Boolean}           Returns true if the schedule has been rejected and false if not
   */

  async getSchedule(scheduleId) {
    try {
      const {
        scheduleType,
        amount,
        activeAmount,
        isActive
      } = await this.contractInst.getSchedule(scheduleId)

      return {
        scheduleType: scheduleType === 0 ? 'Pay Scheme' : 'Upfront Scheme',
        amount,
        activeAmount,
        isActive
      };
    } catch (error) {
      return this.errorHandler(error);
    }
  }

  /**
   * @description : This function allows the Owner | Admins mint tokens to an account
   * @dev : Called by only Owner | Admins
   * @params : {
   *  scheduleId : "Unique schedule id",
   *  recipient : "recipient account",
   *  amount : "How much to mint to recipient",
   *  shareCat : "Recipient share category to mint to",
   *  recordId(String) : "Unique id of record"
   *  reason : "Reasone for minting to recipient account"
   * }
   * @returns
   *  ok : {boolean}
   *  transactionDetails : {object}
   */

  async mint(
    scheduleId,
    recipient,
    amount,
    shareCat,
    duration = 0,
    reason
  ) {
    try {
      recipient = ethers.utils.getAddress(recipient)

      const tx = await this.contractTX.mint(
          scheduleId,
          recipient,
          amount,
          shareCat === 'Tradable'
            ? 0
            : shareCat === 'Lien'
              ? 1
              : shareCat === 'Upfront'
                ? 2
                : shareCat === 'Loan'
                  ? 3
                  : '00',
          duration,
          ethers.utils.formatBytes32String (reason)
        )
        await tx.wait()
        console.log("tx >> ", tx)
    
        return {
          ok : true,
          transactionDetails : tx
        };

    } catch (error) {
      return this.errorHandler(error);
    }
  }

  /**
   * @description : This function allows the Owner | Admins move holder's tokens from any of the categories to tradable
   * @dev : Called by only Owner | Admins
   * @params : {
   *  holder{address} : "holder account",
   *  shareCat{string} : "Token category to move to tradable",
   *  recordId{Number} : "Index of record to move in the specified category",
   * }
   * @returns
   *  ok : {boolean}
   *  transactionDetails : {object}
   */

  async makeTradable(holder, shareCat, recordId) {
    try {
      holder = ethers.utils.getAddress(holder)

      const tx = await this.contractTX.moveToTradable(
          holder,
          shareCat === 'Tradable'
            ? 0
            : shareCat === 'Lien'
              ? 1
              : shareCat === 'Upfront'
                ? 2
                : shareCat === 'Loan'
                  ? 3
                  : '00',
          recordId
        )
        await tx.wait()
        console.log("tx >> ", tx)
    
        return {
          ok : true,
          transactionDetails : tx
        };

    } catch (error) {
      return this.errorHandler(error);
    }
  }

  /**
   * @description : This function allows the Owner | Admins withdraw from a  holder's tokens from any of the categories to tradable
   * @dev : Called by only Owner | Admins
   * @params : {
   *  holder : "holder account",
   *  amount : "Amount to withdraw, optional for other category except tradable"
   *  shareCat : "Token category to withdraw from",
   *  recordId : "Index of record to withdraw in the specified category",
   * }
   * @returns
   *  ok : {boolean}
   *  transactionDetails : {object}
   */

  async withdraw(
    holder,
    amount,
    shareCat,
    recordId,
    reason
  ) {
    try {
      holder = ethers.utils.getAddress(holder)

      const tx = await this.contractTX.withdraw(
          holder,
          amount,
          shareCat === 'Tradable'
            ? 0
            : shareCat === 'Lien'
              ? 1
              : shareCat === 'Upfront'
                ? 2
                : shareCat === 'Loan'
                  ? 3
                  : '00',
          recordId,
          ethers.utils.formatBytes32String(reason)
        )
        await tx.wait()
        console.log("tx >> ", tx)
    
        return {
          ok : true,
          transactionDetails : tx
        };
    } catch (error) {
      return this.errorHandler(error);
    }
  }
};
