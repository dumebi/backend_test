pragma solidity >=0.4.0 <0.6.0;

import "./iERCs.sol";
import "./safeMath.sol";
import "./owner.sol";
import "./messagesAndCodes.sol";

contract SITRestriction is IERC1404, Ownable {
    using SafeMath for uint256;
    using MessagesAndCodes for MessagesAndCodes.Data;
    MessagesAndCodes.Data internal messagesAndCodes;
 
    struct Code {
        mapping(string => uint256) errorStringToCodeIndex;
        mapping(string => uint8) errorStringToCode;
        uint8 currentCodeIndex;
    }
    Code public codes;
    
    modifier onlyValidShareHolder () {
        if (msg.sender != owner()) {
            uint8 _code1 = codes.errorStringToCode["UNVERIFIED_HOLDER"];
            uint8 _code2 = codes.errorStringToCode["ACCOUNT_WITHHOLD_ERROR"];
            require(shareHolders[msg.sender].isEnabled, messagesAndCodes.messages[_code1]);
            require(shareHolders[msg.sender].isWithhold, messagesAndCodes.messages[_code2]);
            _;
        }
        _;
    }

    mapping(address => uint256) mBalances; //The tradable balance for SITHolders
    mapping (address => mapping (address => uint256)) mAllowed;
    
    struct SitBalanceByCat {
        uint256 allocated;
        uint256 vesting;
        uint256 lien;
    }
    
    struct SitHolder {
        bool uniqueHolder;
        bool isEnabled;
        bool isWithhold;
        bytes32 beneficiary; //Incase of death, users SIT will be transfered
        SitBalanceByCat sitBalances;
    }
    
    mapping(address => SitHolder) shareHolders; 
    
    constructor () public {
        addMessage("SUCCESS", "Success");
        addMessage("UNVERIFIED_HOLDER", "Only verified SIT holders can perform this transaction");
        addMessage("RECEIPT_TRANSFER_BLOCKED", "Recipient not authorized");
        addMessage("TOKEN_GRANULARITY_ERROR", "Token cannot be granular below the specified granularity");
        addMessage("TRANSFER_VERIFIED_ERROR", "Off-Chain approval for restricted token");
        addMessage("INSUFFICIENT_BALANCE_ERROR", "You do not have sufficient balance for this transaction");
        addMessage("INVALID_AMOUNT_ERROR", "Token amount specified is invalid");
        addMessage("SPENDER_BALANCE_ERROR", "Amount specified is morethan spendable amount");
        addMessage("ACCOUNT_WITHHOLD_ERROR", "Account on hold");
        addMessage("MOVE_LIEN_ERROR", "Lien cannot be moved to tradable balance, lien period not over yet");
        addMessage("UNIQUE_SHAREHOLDER_ERROR", "Shareholder already added before!");
    }

    function addMessage (string memory  _errorString, string memory _message) public returns (string memory errorString){
        // enter message at code and push code onto storage
        uint8 _code = codes.currentCodeIndex;
        uint256 codeIndex = messagesAndCodes._addMessage(_code, _message);
        codes.errorStringToCodeIndex["_errorString"] = codeIndex;
        codes.currentCodeIndex = codes.currentCodeIndex++;
        codes.errorStringToCode[_errorString] = _code;
        errorString = _errorString;
    }

    function removeMessage (string memory _errorString) public returns (bool success) {   
        uint256 _codeIndex = codes.errorStringToCodeIndex[_errorString];
        uint8 _code = codes.errorStringToCode[_errorString];
        success = messagesAndCodes._removeMessage(_codeIndex, _code);
    }

    function updateMessage (string memory _errorString, string memory _message) public returns (bool success){
        uint8 _code = codes.errorStringToCode[_errorString];
        success = messagesAndCodes._updateMessage(_code, _message);
    }
    
    function detectTransferRestriction (address _from, address _to, uint256 _amount) public view returns (uint8 restrictionCode)
    {
        restrictionCode = codes.errorStringToCode["SUCCESS"];
        if (!shareHolders[_from].isEnabled) {
            restrictionCode = codes.errorStringToCode["SEND_TRANSFER_BLOCKED"];
        } else if (!shareHolders[_to].isEnabled) {
            restrictionCode = codes.errorStringToCode["RECEIPT_TRANSFER_BLOCKED"];
        } else if (mBalances[_from] < _amount) {
            restrictionCode = codes.errorStringToCode["INSUFFICIENT_BALANCE_ERROR"];
        } else if (_amount <= 0 && mBalances[_to].add(_amount) <= mBalances[_to]) {
            restrictionCode = codes.errorStringToCode["INVALID_AMOUNT_ERROR"];
        } else if (!shareHolders[_from].isWithhold) {
            restrictionCode = codes.errorStringToCode["ACCOUNT_WITHHOLD_ERROR"];
        }
        return restrictionCode;
    }
        
    function messageForTransferRestriction (uint8 restrictionCode) public view returns (string memory message){
        return messagesAndCodes.messages[restrictionCode];
    }
}