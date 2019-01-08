pragma solidity >=0.4.0 <0.6.0;

import "./messagedERC1404.sol";
import "./safeMath.sol";
import "./owner.sol";
import "./messagesAndCodes.sol";

/// @title Extendable reference implementation for the ERC-1404 token
/// @dev Inherit from this contract to implement your own ERC-1404 token
contract SITRestriction is MessagedERC1404, Ownable {
    using SafeMath for uint256;
    
    uint8 public UNVERIFIED_HOLDER_CODE;
    uint8 public SEND_TRANSFER_BLOCKED_CODE;
    uint8 public RECEIPT_TRANSFER_BLOCKED_CODE;
    uint8 public TOKEN_GRANULARITY_ERROR_CODE;
    uint8 public TRANSFER_VERIFIED_ERROR_CODE;
    uint8 public INSUFFICIENT_BALANCE_ERROR_CODE;
    uint8 public INVALID_AMOUNT_ERROR_CODE;
    uint8 public SPENDER_BALANCE_ERROR_CODE;
    uint8 public ACCOUNT_WITHHOLD_ERROR_CODE;
    uint8 public MOVE_LIEN_ERROR_CODE;
    uint8 public UNIQUE_SHAREHOLDER_ERROR_CODE;

    string public constant UNVERIFIED_HOLDER_ERROR = "Only verified SIT holders can perform this transaction";
    string public constant SEND_TRANSFER_BLOCKED = "Sender not authorized";
    string public constant RECEIPT_TRANSFER_BLOCKED = "Recipient not authorized";
    string public constant TOKEN_GRANULARITY_ERROR = "Token cannot be granular below the specified granularity"; 
    string public constant TRANSFER_VERIFIED_ERROR = "Off-Chain approval for restricted token";
    string public constant INSUFFICIENT_BALANCE_ERROR = "You do not have sufficient balance for this transaction";
    string public constant SPENDER_BALANCE_ERROR = "Amount specified is morethan spendable amount";
    string public constant INVALID_AMOUNT_ERROR = "Token amount specified is invalid";
    string public constant ACCOUNT_WITHHOLD_ERROR = "Account on hold";
    string public constant MOVE_LIEN_ERROR = "Lien cannot be moved to tradable balance, lien period not over yet";
    string public constant UNIQUE_SHAREHOLDER_ERROR = "Shareholder already added before!";
    
     modifier onlyValidShareHolder () {
        if (msg.sender != owner()) {
            require(shareHolders[msg.sender].isEnabled, UNVERIFIED_HOLDER_ERROR);
            require(shareHolders[msg.sender].isWithhold, ACCOUNT_WITHHOLD_ERROR);
            _;
        }
        _;
    }

    mapping(address => uint256) mBalances; //The tradable balance for SITHolders
    mapping (address => mapping (address => uint256)) mAllowed;
    
    struct SitBalanceByCat {
        uint allocated;
        uint vesting;
        uint lien;
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
        
        UNVERIFIED_HOLDER_CODE = messagesAndCodes.autoAddMessage(UNVERIFIED_HOLDER_ERROR);
        SEND_TRANSFER_BLOCKED_CODE = messagesAndCodes.autoAddMessage(SEND_TRANSFER_BLOCKED);
        RECEIPT_TRANSFER_BLOCKED_CODE = messagesAndCodes.autoAddMessage(RECEIPT_TRANSFER_BLOCKED);
        TOKEN_GRANULARITY_ERROR_CODE = messagesAndCodes.autoAddMessage(TOKEN_GRANULARITY_ERROR);
        TRANSFER_VERIFIED_ERROR_CODE = messagesAndCodes.autoAddMessage(TRANSFER_VERIFIED_ERROR);
        INSUFFICIENT_BALANCE_ERROR_CODE = messagesAndCodes.autoAddMessage(INSUFFICIENT_BALANCE_ERROR);
        INVALID_AMOUNT_ERROR_CODE = messagesAndCodes.autoAddMessage(INVALID_AMOUNT_ERROR);
        SPENDER_BALANCE_ERROR_CODE = messagesAndCodes.autoAddMessage(SPENDER_BALANCE_ERROR);
        ACCOUNT_WITHHOLD_ERROR_CODE = messagesAndCodes.autoAddMessage(ACCOUNT_WITHHOLD_ERROR);
        MOVE_LIEN_ERROR_CODE = messagesAndCodes.autoAddMessage(MOVE_LIEN_ERROR);
        UNIQUE_SHAREHOLDER_ERROR_CODE = messagesAndCodes.autoAddMessage(UNIQUE_SHAREHOLDER_ERROR);
    }
    
   
    function detectTransferRestriction (address _from, address _to, uint256 _amount) public view returns (uint8 restrictionCode)
    {
        restrictionCode = SUCCESS_CODE;
        
        if (!shareHolders[_from].isEnabled) {
            restrictionCode = SEND_TRANSFER_BLOCKED_CODE;
        } else if (!shareHolders[_to].isEnabled) {
            restrictionCode = RECEIPT_TRANSFER_BLOCKED_CODE;
        } else if (mBalances[_from] < _amount) {
            restrictionCode = INSUFFICIENT_BALANCE_ERROR_CODE;
        } else if (_amount <= 0 && mBalances[_to].add(_amount) <= mBalances[_to]) {
            restrictionCode = INVALID_AMOUNT_ERROR_CODE;
        } else if (!shareHolders[_from].isWithhold) {
            restrictionCode = ACCOUNT_WITHHOLD_ERROR_CODE;
        }
        
        return restrictionCode;
    }
        
    function messageForTransferRestriction (uint8 restrictionCode) public view returns (string memory message){
        return messagesAndCodes.messages[restrictionCode];
    }
}
