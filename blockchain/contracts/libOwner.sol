pragma solidity >=0.4.0 <0.6.0;


/**
* @title Ownable
* @dev The Ownable library has an owner address, and provides basic authorization control
* functions, this simplifies the implementation of "user permissions".
*/
import "./libSharing.sol";

library Ownable {

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    function init(Sharing.DataOwner storage self, address owner) internal {
        self._owner = owner;
        emit OwnershipTransferred(address(0), self._owner);
    }

    
    function _owner_(Sharing.DataOwner storage self) internal view returns (address) {
        return self._owner;
    }

    function _isOwner_(Sharing.DataOwner storage self) internal view returns (bool) {
        return msg.sender == self._owner;
    }
    
    // function _transferOwnership_(Sharing.DataOwner storage self, address newOwner) internal  {
    //     _transferOwnership(self, newOwner);
    // }

    // function _transferOwnership(Sharing.DataOwner storage self, address newOwner) internal {
    //     require(newOwner != address(0), "New Owner must have an address");
    //     emit OwnershipTransferred(self._owner, newOwner);
    //     self._owner = newOwner;
    // }
}
