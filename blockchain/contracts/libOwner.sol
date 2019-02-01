pragma solidity >=0.4.0 <0.6.0;


/**
* @title Ownable
* @dev The Ownable library has an owner address, and provides basic authorization control
* functions, this simplifies the implementation of "user permissions".
*/
library Ownable {
    
    struct Data {
        address _owner;
    }

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    function init(Data storage self, address owner) internal {
        self._owner = owner;
        emit OwnershipTransferred(address(0), self._owner);
    }

    
    function owner(Data storage self) internal view returns (address) {
        return self._owner;
    }

    function isOwner(Data storage self) internal view returns (bool) {
        return msg.sender == self._owner;
    }
    
    function transferOwnership(Data storage self, address newOwner) internal  {
        _transferOwnership(self, newOwner);
    }

    function _transferOwnership(Data storage self, address newOwner) internal {
        require(newOwner != address(0), "New Owner must have an address");
        emit OwnershipTransferred(self._owner, newOwner);
        self._owner = newOwner;
    }
}
