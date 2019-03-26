pragma solidity >=0.4.0 <0.6.0;

import "./libSafeMath.sol";
import "./libTokenFunc.sol";
import "./libMsgCode.sol";
import "./libSharing.sol";

library TokenScheduler  {
    using SafeMath for uint256;
    
    event NewSchedule(uint256 indexed _scheduleId, Sharing.ScheduleType _scheduleType, uint256 _amount, bytes _reason);
    event ScheduleApproved(uint256 indexed _scheduleId, bytes _reason); //Emit the authorizer's address that vote for approval
    // event ScheduleRejected(uint256 indexed _scheduleId, bytes _reason); //Emit the authorizer's address that vote for rejection
    // event ScheduleRemoved(uint256 indexed _scheduleId, address indexed _initiator, bytes _reason);
    event Minted(uint8 indexed _from, address indexed _holder, Sharing.TokenCat _sitCat, uint256 _amount, uint256 _scheduleType, bytes _reason);
    
    
    function _createSchedule_ (Sharing.DataSchedule storage self, uint _scheduleId, uint _amount, Sharing.ScheduleType _scheduleType, bytes memory _data) public returns(string memory success ) {
        require(self.mMintSchedules[_scheduleId].amount <= 0, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.UNIQUENESS_ERROR)));
        if(_amount < 0) {
            return MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.ZERO_SCHEDULE_ERROR));
        }

        Sharing.Schedule memory schedule;
        schedule.amount = _amount;
        schedule.activeAmount = _amount;
        schedule.isApproved = false;
        schedule.isRejected = false;
        schedule.isActive = true;
        schedule.scheduleType = _scheduleType;
        
        self.mMintSchedules[_scheduleId] = schedule;
        emit NewSchedule(_scheduleId, _scheduleType, _amount, _data);
        
        return MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.SUCCESS));
    } 
    
    // function _getSchedule_ (Sharing.DataSchedule storage self, uint _scheduleId) internal view returns(uint amount, uint activeAmount, bool isApproved, bool isRejected, bool isActive, Sharing.ScheduleType scheduleType ) {
    //     Sharing.Schedule memory _schedule = self.mMintSchedules[_scheduleId];
    //     return (_schedule.amount, _schedule.activeAmount, _schedule.isApproved, _schedule.isRejected, _schedule.isActive, _schedule.scheduleType);
    // }  
    
    // function _getScheduleAuthorizer_ (Sharing.DataSchedule storage self, uint _scheduleId, uint _authorizerIndex) internal view returns(address authorize, bytes memory reason) {
    //     return (self.mMintSchedules[_scheduleId].authorizedBy[_authorizerIndex].authorizer, self.mMintSchedules[_scheduleId].authorizedBy[_authorizerIndex].reason);
    // } 
    
    function _approveSchedule_(Sharing.DataSchedule storage self, uint256 _scheduleId, bytes memory _reason, Sharing.ScheduleType _authorizerType) public returns(string memory success)  {
        require(!self.mMintSchedules[_scheduleId].isRejected, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.SCHEDULE_REJECTED_ERROR)));
        require(!self.mMintSchedules[_scheduleId].isApproved && !self.mMintSchedules[_scheduleId].isRejected, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.SCHEDULE_APPROVED_ERROR)));
        if(self.mMintSchedules[_scheduleId].amount <= 0){
            return MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.NOTFOUND_ERROR));
        }
        
        Sharing.Schedule memory _scheduleInstance = self.mMintSchedules[_scheduleId];
        if (_scheduleInstance.scheduleType == Sharing.ScheduleType.UpfrontScheme)  {
            if(_authorizerType != Sharing.ScheduleType.UpfrontScheme){
                return MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.UNAUTHORIZED_ERROR));
            }
            require(_authorizerType == Sharing.ScheduleType.UpfrontScheme, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.UNAUTHORIZED_ERROR)));
            self.mMintSchedules[_scheduleId].isApproved = true;
            self.mMintSchedules[_scheduleId].isRejected = false;
            Sharing.Authorising memory authorising;
            authorising.authorizer = msg.sender;
            authorising.reason = _reason;
            self.mMintSchedules[_scheduleId].authorizedBy[0] = authorising;
        } else if (_scheduleInstance.scheduleType == Sharing.ScheduleType.PayScheme)  {
            if(_authorizerType != Sharing.ScheduleType.PayScheme){
                return MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.UNAUTHORIZED_ERROR));
            }
            require(!_scheduleInstance.isApproved, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.SCHEDULE_APPROVED_ERROR)));
            require(!self.trackApproves[msg.sender], MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.SCHEDULE_REJECTED_ERROR)));
            
            Sharing.Authorising memory authorising;
            authorising.authorizer = msg.sender;
            authorising.reason = _reason;
            
            self.mMintSchedules[_scheduleId].authorizedBy[_scheduleInstance.authorizedCount] = authorising;
            self.trackApproves[msg.sender] = true;
            self.mMintSchedules[_scheduleId].authorizedCount = _scheduleInstance.authorizedCount + 1;
            
            if ( _scheduleInstance.authorizedCount >= 2) {
                self.mMintSchedules[_scheduleId].isApproved = true;
                self.mMintSchedules[_scheduleId].isRejected = false;
                delete _scheduleInstance.authorizedCount;
                delete self.trackApproves[self.mMintSchedules[_scheduleId].authorizedBy[0].authorizer];
                delete self.trackApproves[self.mMintSchedules[_scheduleId].authorizedBy[1].authorizer];
                delete self.trackApproves[self.mMintSchedules[_scheduleId].authorizedBy[2].authorizer];
            }
        }
        emit ScheduleApproved(_scheduleId, _reason);
        return MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.SUCCESS));

    } 
    
    // function _rejectSchedule_(Sharing.DataSchedule storage self, uint256 _scheduleId, bytes memory _reason, Sharing.ScheduleType _authorizerType) internal returns(string memory success)  {
    //     require(self.mMintSchedules[_scheduleId].amount == self.mMintSchedules[_scheduleId].activeAmount, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.NOTALLOWED_ERROR)));

    //     Sharing.Schedule memory _scheduleInstance = self.mMintSchedules[_scheduleId];
    //     if (_scheduleInstance.scheduleType == Sharing.ScheduleType.PayScheme)  {
    //         if(_scheduleInstance.scheduleType != _authorizerType){
    //             return MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.UNAUTHORIZED_ERROR));
    //         }
    //         self.mMintSchedules[_scheduleId].isRejected = true;
    //         self.mMintSchedules[_scheduleId].isApproved = false;
    //         self.mMintSchedules[_scheduleId].authorizedBy[0] = Sharing.Authorising(msg.sender, _reason);
    //     } else if (_scheduleInstance.scheduleType == Sharing.ScheduleType.UpfrontScheme)  {
    //         if(_scheduleInstance.scheduleType != _authorizerType){
    //             return MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.UNAUTHORIZED_ERROR));
    //         }
    //         self.mMintSchedules[_scheduleId].isRejected = true;
    //         self.mMintSchedules[_scheduleId].isApproved = false;
    //         self.mMintSchedules[_scheduleId].authorizedBy[0] = Sharing.Authorising(msg.sender, _reason);
    //     }
    //     emit ScheduleRejected(_scheduleId, _reason);
        
    //     return MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.SUCCESS));
    // } 
    
    // function _removeSchedule_(Sharing.DataSchedule storage self, uint256 _scheduleId, bytes memory _reason) internal returns(uint256)  {
    //     require(self.mMintSchedules[_scheduleId].amount == self.mMintSchedules[_scheduleId].activeAmount, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.NOTALLOWED_ERROR)));

    //     delete self.mMintSchedules[_scheduleId];
    //     emit ScheduleRemoved(_scheduleId, msg.sender, _reason);
    //     return _scheduleId;
    // } 
    
    function _mint_(Sharing.DataSchedule storage self, Sharing.DataToken storage tokenFunc, uint8 _granularity, address _coinBase, uint256 _scheduleIndex, address _holder, uint256 _amount, Sharing.TokenCat _sitCat, uint256 _duration, bytes memory _data) public returns (string memory success) {
        
        require(tokenFunc.shareHolders[_holder].isEnabled, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.UNVERIFIED_HOLDER_ERROR)));
        require(self.mMintSchedules[_scheduleIndex].isActive, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.INVALID_ERROR)));
        require(self.mMintSchedules[_scheduleIndex].isApproved, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.UNAUTHORIZED_ERROR)));
        require(_amount % _granularity == 0, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.TOKEN_GRANULARITY_ERROR)));
        if(self.mMintSchedules[_scheduleIndex].activeAmount < _amount){
            MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.INSUFFICIENT_FUND_ERROR));
        }
            
        uint8 _from;

        if (Sharing.TokenCat.Lien  == _sitCat) {
            if(_duration < now){
                return MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.INVALID_PARAMS_ERROR));
            }
            tokenFunc.shareHolders[_holder].sitBalances.lien = tokenFunc.shareHolders[_holder].sitBalances.lien.add(_amount);
            TokenFunc._addToLien(tokenFunc,_holder, _amount, now, _duration);
        } else  if (Sharing.TokenCat.Vesting  == _sitCat) {
            tokenFunc.shareHolders[_holder].sitBalances.vesting = tokenFunc.shareHolders[_holder].sitBalances.vesting.add(_amount);
            TokenFunc._addToVesting (tokenFunc, _holder, _amount, now);
        } else  if (Sharing.TokenCat.Allocated  == _sitCat) {
            if(_duration < now){
                return MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.INVALID_PARAMS_ERROR));
            }
            tokenFunc.shareHolders[_holder].sitBalances.allocated = tokenFunc.shareHolders[_holder].sitBalances.allocated.add(_amount);
            TokenFunc._addToAllocated (tokenFunc, _holder, _amount, now, _duration);
        } else if (Sharing.TokenCat.Tradable  == _sitCat) {
            tokenFunc.mBalances[_holder] = tokenFunc.mBalances[_holder].add(_amount);
        }
        
        if (TokenFunc._balanceOf_(tokenFunc, _coinBase) >= _amount) {
            tokenFunc.mBalances[_coinBase] = tokenFunc.mBalances[_coinBase].sub(_amount);
            _from = 0;
        } else {
            tokenFunc.uTotalSupply = tokenFunc.uTotalSupply.add(_amount);
            _from = 1;
        }
        
        self.mMintSchedules[_scheduleIndex].activeAmount = self.mMintSchedules[_scheduleIndex].activeAmount.sub(_amount);
        
        if (self.mMintSchedules[_scheduleIndex].activeAmount <= 0) {
            self.mMintSchedules[_scheduleIndex].isActive = false;
        }
        
        emit Minted(_from, _holder, _sitCat, _amount,  _scheduleIndex, _data);
        success = MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.SUCCESS));
    }

    
}