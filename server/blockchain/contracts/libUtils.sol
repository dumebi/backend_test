pragma solidity >=0.4.0 <0.6.0;


/**
 * @title Utils
 * @dev Utils library for token interactions
 */
library Utils {
    
    function stringsEqual(string memory _a, string memory _b) internal pure returns(bool){ 
        if(bytes(_a).length != bytes(_b).length) {
            return false;
        } else if (keccak256(abi.encode(_a)) == keccak256(abi.encode(_b))) {
            return true;
        }
        return false;
    } 
}
