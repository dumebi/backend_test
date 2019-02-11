pragma solidity ^0.5.0;
// pragma experimental SMTChecker;

import "./libSharing.sol";
import "./libMsgCode.sol";

library Authorizer {
    
    event NewAuthorizer(address indexed _authorizer, Sharing.ScheduleType indexed _type);
    event AuthorizerRemoved(address indexed _authorizer);
    

    function addAuthorizer(Sharing.DataAuthorizer storage self, address _approver, Sharing.ScheduleType _type) internal returns (bool) {
        require(!self.authorizerToIndex[_approver].isUnique, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.UNIQUENESS_ERROR)));
        uint index = self.mAuthorizers.push(Sharing.Authorizer(true, _approver, _type));
        self.authorizerToIndex[_approver].isUnique = true;
        self.authorizerToIndex[_approver].index = index - 1;
        emit NewAuthorizer(_approver, _type);
        return true;
    }
    

    function isAuthorizer(Sharing.DataAuthorizer storage self, address _approver) internal view returns (bool) {
        return self.authorizerToIndex[_approver].isUnique;
    }
    
    function getAuthorizer(Sharing.DataAuthorizer storage self, address _approver) internal view returns (address authorizer, Sharing.ScheduleType authorizerType) {
        require(!self.authorizerToIndex[_approver].isUnique, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.NOTFOUND_ERROR)));
        return (self.mAuthorizers[self.authorizerToIndex[_approver].index].authorizer, self.mAuthorizers[self.authorizerToIndex[_approver].index].authorizerType);
    }
    
    
    function removeAuthorizer(Sharing.DataAuthorizer storage self, address _approver) internal returns (bool) {
        delete self.mAuthorizers[self.authorizerToIndex[_approver].index];
        delete self.authorizerToIndex[_approver].isUnique;
        emit AuthorizerRemoved(_approver);
        return true;
    }
}