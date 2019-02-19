pragma solidity >=0.4.0 <0.6.0;

import "./libUtils.sol";
import "./libSafeMath.sol";
import "./libMsgCode.sol";
import "./libTokenFunc.sol";

library TokenScheduler  {
    
    using Utils for *;
    using SafeMath for uint256;
    
    event NewSchedule(uint256 _scheduleId, ScheduleType _scheduleType, uint256 _amount, bytes _data);
    event ScheduleApproved(uint256 _requestId, address _authorizer, bytes _reason); //Emit the authorizer's address that vote for approval
    event ScheduleRejected(uint256 _requestId, address _authorizer, bytes _reason); //Emit the authorizer's address that vote for rejection
    event ScheduleRemoved(uint256 indexed _scheduleId, address indexed _initiator, bytes _reason);
    event Minted(uint8 indexed _from, address indexed _holder, TokenFunc.TokenCat _sitCat, uint256 _amount, uint256 _scheduleType, bytes _data);
    
    
    enum ScheduleType { PayScheme, UpfrontScheme}
    
    struct Authorising {
        address authorizer;
        bytes reason;
    }
    struct Schedule {
        uint amount;
        uint activeAmount;
        bool isApproved;
        bool isRejected;
        bool isActive;
        uint8 authorizedCount;
        TokenScheduler.ScheduleType scheduleType;
        mapping(uint => Authorising) authorizedBy;
    }
    
    struct Data {
        uint256[] scheduleIndex;
        mapping(uint256 => Schedule) mMintSchedules;
        mapping (address => bool) trackApproves;
    }
    
    function createSchedule (Data storage self, uint _scheduleId, uint _amount, TokenScheduler.ScheduleType _scheduleType, bytes memory _data) internal returns(uint256 ) {

        Schedule memory schedule;
        schedule.amount = _amount;
        schedule.activeAmount = _amount;
        schedule.isApproved = false;
        schedule.isRejected = false;
        schedule.isActive = true;
        schedule.scheduleType = _scheduleType;
        
        self.mMintSchedules[_scheduleId] = schedule;
        self.scheduleIndex.push(_scheduleId);
        emit NewSchedule(_scheduleId, _scheduleType, _amount, _data);
        
        return _scheduleId;
    } 
    
    function getSchedule (Data storage self, uint _scheduleId) internal view returns(uint amount, uint activeAmount, bool isApproved, bool isRejected, bool isActive, ScheduleType scheduleType ) {
        Schedule memory _schedule = self.mMintSchedules[_scheduleId];
        return (_schedule.amount, _schedule.activeAmount, _schedule.isApproved, _schedule.isRejected, _schedule.isActive, _schedule.scheduleType);
    }  
    
    function getScheduleAuthorizer (Data storage self, uint _scheduleId, uint _authorizerIndex) internal view returns(address authorize, bytes memory reason) {
        return (self.mMintSchedules[_scheduleId].authorizedBy[_authorizerIndex].authorizer, self.mMintSchedules[_scheduleId].authorizedBy[_authorizerIndex].reason);
    } 
    
    function approveSchedule(Data storage self, uint256 _scheduleId, bytes memory _reason, TokenScheduler.ScheduleType _authorizerType) internal returns(uint256)  {
        require(!self.mMintSchedules[_scheduleId].isRejected, "This schedule has already been rejected!");
        require(!self.mMintSchedules[_scheduleId].isApproved && !self.mMintSchedules[_scheduleId].isRejected, "This schedule has already been approved!");
        
        Schedule memory _scheduleInstance = self.mMintSchedules[_scheduleId];
        if (_scheduleInstance.scheduleType == TokenScheduler.ScheduleType.UpfrontScheme)  {
            require(_authorizerType == TokenScheduler.ScheduleType.UpfrontScheme, "You are not authorized to approve this schedule");
            self.mMintSchedules[_scheduleId].isApproved = true;
            self.mMintSchedules[_scheduleId].isRejected = false;
            Authorising memory authorising;
            authorising.authorizer = msg.sender;
            authorising.reason = _reason;
            self.mMintSchedules[_scheduleId].authorizedBy[0] = authorising;
        } else if (_scheduleInstance.scheduleType == ScheduleType.PayScheme)  {
            require(_authorizerType == TokenScheduler.ScheduleType.PayScheme, "You are not authorized to reject this schedule");
            require(!self.trackApproves[msg.sender], "You have already approved this schedule!");
            
            Authorising memory authorising;
            authorising.authorizer = msg.sender;
            authorising.reason = _reason;
            
            self.mMintSchedules[_scheduleId].authorizedBy[_scheduleInstance.authorizedCount] = authorising;
            self.trackApproves[msg.sender] = true;
            _scheduleInstance.authorizedCount = _scheduleInstance.authorizedCount + 1;
            
            if ( _scheduleInstance.authorizedCount >= 3) {
                self.mMintSchedules[_scheduleId].isApproved = true;
                self.mMintSchedules[_scheduleId].isRejected = false;
                delete _scheduleInstance.authorizedCount;
                delete self.trackApproves[self.mMintSchedules[_scheduleId].authorizedBy[0].authorizer];
                delete self.trackApproves[self.mMintSchedules[_scheduleId].authorizedBy[1].authorizer];
                delete self.trackApproves[self.mMintSchedules[_scheduleId].authorizedBy[2].authorizer];
            }
        }
        emit ScheduleApproved(_scheduleId, msg.sender, _reason);
        return _scheduleId;

    } 
    
    function rejectSchedule(Data storage self, uint256 _scheduleId, bytes memory _reason, ScheduleType _authorizerType) internal returns(uint256)  {
        require(self.mMintSchedules[_scheduleId].amount == self.mMintSchedules[_scheduleId].activeAmount, "This schedule cannot be rejected! Tokens have already been minted on it");

        Schedule memory _scheduleInstance = self.mMintSchedules[_scheduleId];
        if (_scheduleInstance.scheduleType == ScheduleType.PayScheme)  {
            require(_scheduleInstance.scheduleType == _authorizerType, "You are restricted from rejecting this schedule");
            self.mMintSchedules[_scheduleId].isRejected = true;
            self.mMintSchedules[_scheduleId].authorizedBy[0] = Authorising(msg.sender, _reason);
        } else if (_scheduleInstance.scheduleType == ScheduleType.UpfrontScheme)  {
            require(_scheduleInstance.scheduleType == _authorizerType, "You are restricted from rejecting this schedule");
            self.mMintSchedules[_scheduleId].isRejected = true;
            self.mMintSchedules[_scheduleId].isApproved = false;
            self.mMintSchedules[_scheduleId].authorizedBy[0] = Authorising(msg.sender, _reason);
        }
        emit ScheduleRejected(_scheduleId, msg.sender, _reason);
        return _scheduleId;
    } 
    
        function removeSchedule(Data storage self, uint256 _scheduleId, bytes memory _reason) internal returns(uint256)  {
        require(self.mMintSchedules[_scheduleId].amount == self.mMintSchedules[_scheduleId].activeAmount, "This schedule cannot be removed! Tokens have already been minted on it");

        delete self.mMintSchedules[_scheduleId];
        emit ScheduleRemoved(_scheduleId, msg.sender, _reason);
        return _scheduleId;
    } 
    
    function mint(Data storage self, TokenFunc.Data storage tokenFunc, MessagesAndCodes.Data storage _msgCode, uint8 _granularity, address _coinBase, uint256 _scheduleIndex, address _holder, uint256 _amount, TokenFunc.TokenCat _sitCat, uint256 _lienPeriod, bytes memory _data) internal returns (bool success) {
        
        require(self.mMintSchedules[_scheduleIndex].isActive, "Inactive schedule");
        require(self.mMintSchedules[_scheduleIndex].isApproved, "Unauthorized schedule");
        require(self.mMintSchedules[_scheduleIndex].activeAmount >= _amount, "Minting amount is greater than available on schedule");
        require(_amount % _granularity == 0, _msgCode.messages[_msgCode.code.errorStringToCode["TOKEN_GRANULARITY_ERROR"]]);
            
        uint8 _from;

        if (TokenFunc.TokenCat.Lien  == _sitCat) {
            tokenFunc.shareHolders[_holder].sitBalances.lien = tokenFunc.shareHolders[_holder].sitBalances.lien.add(_amount);
            TokenFunc._addToLien(tokenFunc,_holder, _amount, now, _lienPeriod);
        } else  if (TokenFunc.TokenCat.Vesting  == _sitCat) {
            tokenFunc.shareHolders[_holder].sitBalances.vesting = tokenFunc.shareHolders[_holder].sitBalances.vesting.add(_amount);
            TokenFunc._addToVesting (tokenFunc, _holder, _amount, now);
        } else  if (TokenFunc.TokenCat.Allocated  == _sitCat) {
            tokenFunc.shareHolders[_holder].sitBalances.allocated = tokenFunc.shareHolders[_holder].sitBalances.allocated.add(_amount);
            TokenFunc._addToAllocated (tokenFunc, _holder, _amount, now);
        } else if (TokenFunc.TokenCat.Tradable  == _sitCat) {
            tokenFunc.mBalances[_holder] = tokenFunc.mBalances[_holder].add(_amount);
            TokenFunc._addToTradable(tokenFunc, _holder, _amount, now);
        }
        
        if (TokenFunc.balanceOf(tokenFunc, _coinBase) >= _amount) {
            tokenFunc.mBalances[_coinBase].sub(_amount);
            _from = 0;
        } else {
            tokenFunc.uTotalSupply = tokenFunc.uTotalSupply.add(_amount);
            _from = 1;
        }
        self.mMintSchedules[_scheduleIndex].activeAmount.sub(_amount);
        
        if (self.mMintSchedules[_scheduleIndex].activeAmount <= 0) {
            self.mMintSchedules[_scheduleIndex].isActive = false;
        }
        
        emit Minted(_from, _holder, _sitCat, _amount,  _scheduleIndex, _data);
        success = true;
    }

    
}