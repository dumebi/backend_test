pragma solidity ^0.5.0;
// pragma experimental SMTChecker;


import "./libTokenScheduler.sol";

library Authorizer {
    
    event NewAuthorizer(address indexed _authorizer, TokenScheduler.ScheduleType indexed _type);
    event AuthorizerRemoved(address indexed _authorizer);
    
    struct Authorizer {
        bool isUnique;
        address authorizer;
        TokenScheduler.ScheduleType authorizerType; // Type can be montly or custom
    }
    
    struct TrackIndex {
        bool isUnique;
        uint index;
    }
    
    struct Data {
        mapping(address => TrackIndex) authorizerToIndex;
        Authorizer[] mAuthorizers;
    }

    function addAuthorizer(Data storage self, address _approver, TokenScheduler.ScheduleType _type) internal returns (bool) {
        require(!self.authorizerToIndex[_approver].isUnique, "Authorizer already added!");
        uint index = self.mAuthorizers.push(Authorizer(true, _approver, _type));
        self.authorizerToIndex[_approver].isUnique = true;
        self.authorizerToIndex[_approver].index = index - 1;
        emit NewAuthorizer(_approver, _type);
        return true;
    }
    

    function isAuthorizer(Data storage self, address _approver) internal view returns (bool) {
        return self.authorizerToIndex[_approver].isUnique;
    }
    
    function getAuthorizer(Data storage self, address _approver, uint _index) internal view returns (address authorizer, TokenScheduler.ScheduleType authorizerType) {
        if(_index > 0) {
            return (self.mAuthorizers[_index].authorizer, self.mAuthorizers[_index].authorizerType);
        }
        return (self.mAuthorizers[self.authorizerToIndex[_approver].index].authorizer, self.mAuthorizers[self.authorizerToIndex[_approver].index].authorizerType);
    }
    
    
    function removeAuthorizer(Data storage self, address _approver) internal returns (bool) {
        delete self.mAuthorizers[self.authorizerToIndex[_approver].index];
        emit AuthorizerRemoved(_approver);
        return true;
    }
}