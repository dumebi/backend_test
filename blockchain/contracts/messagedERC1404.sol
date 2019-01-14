pragma solidity >=0.4.0 <0.6.0;

import "./messagesAndCodes.sol";
import "./iERC1404.sol";

/// @title Extendable reference implementation for the ERC-1404 token
/// @dev Inherit from this contract to implement your own ERC-1404 token
contract Restricted is IERC1404 {

    uint8 public constant SUCCESS_CODE = 0;
    string public constant SUCCESS_MESSAGE = "SUCCESS";

    modifier notRestricted (address from, address to, uint256 value) {
        uint8 restrictionCode = detectTransferRestriction(from, to, value);
        require(restrictionCode == SUCCESS_CODE, messageForTransferRestriction(restrictionCode));
        _;
    }
    
    // function detectTransferRestriction (address from, address to, uint256 value) public view returns (uint8 restrictionCode)
    // {
    //     restrictionCode = SUCCESS_CODE;
    //     return restrictionCode;
    // }
        
    function messageForTransferRestriction (uint8 restrictionCode) public view returns (string memory message){
        if (restrictionCode == SUCCESS_CODE) {
            message = SUCCESS_MESSAGE;
        }
    }
    
}

/// @title ERC-1404 implementation with built-in message and code management solution
/// @dev Inherit from this contract to implement your own ERC-1404 token
contract MessagedERC1404 is Restricted {
    using MessagesAndCodes for MessagesAndCodes.Data;
    MessagesAndCodes.Data internal messagesAndCodes;

    constructor () public {
        messagesAndCodes.addMessage(SUCCESS_CODE, SUCCESS_MESSAGE);
    }

    function messageForTransferRestriction (uint8 restrictionCode)public view returns (string memory message)
    {
        message = messagesAndCodes.messages[restrictionCode];
    }
}