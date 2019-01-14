pragma solidity ^0.5.0;
// pragma experimental SMTChecker;

import "./owner.sol";

contract Authorizer is Ownable{

    event NewAuthorizer(address indexed _authorizer, string indexed _type);
    event AuthorizerRemoved(address indexed _authorizer);
    
    struct Authorize {
        bool isUnique;
        bool isValid;
        string authorizerType; // Type can be montly or custom
    }
    
    mapping(address => Authorize) internal mAuthorizers;


    modifier onlyAuthorizer() {
        require(isAuthorizer(msg.sender), "You are not listed as an authorizer.");
        _;
    }
    
    function addAuthorizer(address _approver, string memory _type) public onlyOwner returns (bool success) {
        require(!mAuthorizers[_approver].isUnique, "Authorizer already added!");
        mAuthorizers[_approver] = Authorize(true, true, _type);
        emit NewAuthorizer(_approver, _type);
        success = true;
        return success;
    }
    

    function isAuthorizer(address _approver) public view returns (bool) {
        return mAuthorizers[_approver].isValid;
    }

    function getAuthorizer(address _approver) public view returns (bool IsValidAuthorizer, string memory authorizationType) {
        return (mAuthorizers[_approver].isValid, mAuthorizers[_approver].authorizerType);
    }


    function removeAuthorizer(address _approver) public onlyOwner returns (bool success) {
        delete mAuthorizers[_approver];
        emit AuthorizerRemoved(_approver);
        success = true;
        return success;
    }
}