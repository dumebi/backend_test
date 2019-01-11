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
        require(isAuthorizer(msg.sender), "You are not listed as an authorizer.");
        _;
    }
    
    
    /**
     * @dev Allows the current owner to add an authorizer.
     */
    function addAuthorizer(address _user) public onlyOwner {
        
        uint authorizerId = authorizers.push(_user) - 1;
        addrToAuthorizer[_user] = authorizerId;
        validAuthorizer[_user] = true;

        emit NewAuthorizer(_user);
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
    function isAuthorizer(address _user) public view returns (bool) {
        return validAuthorizer[_user] == true;
    }

    /**
     * @dev Allows the current owner to remove an authorizer.
     * @notice All ng activities 
     */
    function removeAuthorizer(address _user) public onlyOwner {
        
        uint authorizerId = addrToAuthorizer[_user];
        delete authorizers[authorizerId];

        validAuthorizer[_user] = false;
        addrToAuthorizer[_user] = authorizers.length + 1;

        emit AuthorizerRemoved(_user);
    }
    

}

