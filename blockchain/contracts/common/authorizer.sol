pragma solidity ^0.5.0;
// pragma experimental SMTChecker;

import "./owner.sol";

contract Authorizer is Ownable{

    address[] public authorizers;
    mapping(address => bool) internal validAuthorizer;
    mapping(address => uint) internal addrToAuthorizer;

    event NewAuthorizer(address indexed _authorizer);
    event AuthorizerRemoved(address indexed _authorizer);


    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyAuthorizer() {
        require(isAuthorizer(msg.sender), "You are not listed as an authorizer, thus cannot authorize this transaction.");
        _;
    }
    
    
    /**
     * @dev Allows the current owner to add an authorizer.
     */
    function addAuthorizer(address _authorizer) public onlyOwner {

        uint authorizerId = authorizers.push(_authorizer) - 1;
        addrToAuthorizer[_authorizer] = authorizerId;
        validAuthorizer[_authorizer] = true;

        emit NewAuthorizer(_authorizer);
    }
    
    
    /**
     * @return the address of the owner.
     */
    function getAuthorizers() public view returns (address[] memory) {
        return authorizers;
    }

    /**
     * @return true if `msg.sender` is the owner of the contract.
     */
    function isAuthorizer(address _input) public view returns (bool) {
        return validAuthorizer[_input] == true;
    }

    /**
     * @dev Allows the current owner to remove an authorizer.
     * @notice All authorizing activities 
     */
    function removeAuthorizer(address _authorizer) public onlyOwner {

        uint authorizerId = addrToAuthorizer[_authorizer];
        delete authorizers[authorizerId];

        validAuthorizer[_authorizer] = false;
        delete addrToAuthorizer[_authorizer];

        emit AuthorizerRemoved(_authorizer);
    }


}

