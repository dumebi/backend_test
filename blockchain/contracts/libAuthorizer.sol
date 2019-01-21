pragma solidity ^0.5.0;
// pragma experimental SMTChecker;


library Authorizer {
    
    event NewAuthorizer(address indexed _authorizer, string indexed _type);
    event AuthorizerRemoved(address indexed _authorizer);
    
    struct Authorize {
        bool isUnique;
        bool isValid;
        string authorizerType; // Type can be montly or custom
    }
    
    struct Data {
        mapping(address => Authorize) mAuthorizers;
    }

    function addAuthorizer(Data storage self, address _approver, string memory _type) internal returns (bool) {
        require(!self.mAuthorizers[_approver].isUnique, "Authorizer already added!");
        self.mAuthorizers[_approver] = Authorize(true, true, _type);
        emit NewAuthorizer(_approver, _type);
        return true;
    }
    

    function isAuthorizer(Data storage self, address _approver) internal view returns (bool) {
        return self.mAuthorizers[_approver].isValid;
    }


    function removeAuthorizer(Data storage self, address _approver) internal returns (bool) {
        delete self.mAuthorizers[_approver];
        emit AuthorizerRemoved(_approver);
        return true;
    }
}