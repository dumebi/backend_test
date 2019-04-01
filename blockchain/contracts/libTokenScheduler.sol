pragma solidity >=0.4.0 <0.6.0;

import "./libSafeMath.sol";
import "./libTokenFunc.sol";
import "./libMsgCode.sol";
import "./libSharing.sol";

library TokenScheduler  {
    using SafeMath for uint256;
    
    event NewSchedule(uint256 indexed _scheduleId, Sharing.ScheduleType _scheduleType, uint256 _amount, bytes _reason);
    event ScheduleRemoved(uint256 indexed _scheduleId, address indexed _initiator, bytes _reason);
    event Minted(uint8 indexed _from, address indexed _holder, Sharing.TokenCat _sitCat, uint256 _amount, uint256 _scheduleType, bytes _reason);
    event Preloaded(address indexed _holder, uint256 _lien, uint256 _upfront, uint256 _loan, uint256 _tradable, bytes _reason);
    
    function _createSchedule_ (Sharing.DataSchedule storage self, uint _scheduleId, uint _amount, Sharing.ScheduleType _scheduleType, bytes memory _data) public returns(string memory success ) {
        require(_amount > 0, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.ZERO_SCHEDULE_ERROR)));
        require(self.mMintSchedules[_scheduleId].amount == 0, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.UNIQUENESS_ERROR)));
        
        Sharing.Schedule memory schedule;
        schedule.amount = _amount;
        schedule.activeAmount = _amount;
        schedule.isActive = true;
        schedule.scheduleType = _scheduleType;
        
        self.mMintSchedules[_scheduleId] = schedule;
        emit NewSchedule(_scheduleId, _scheduleType, _amount, _data);
        
        return MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.SUCCESS));
    } 
    
    function _getSchedule_ (Sharing.DataSchedule storage self, uint _scheduleId) internal view returns(uint amount, uint activeAmount, bool isActive, Sharing.ScheduleType scheduleType ) {
        Sharing.Schedule memory _schedule = self.mMintSchedules[_scheduleId];
        return (_schedule.amount, _schedule.activeAmount, _schedule.isActive, _schedule.scheduleType);
    }  
    
    function _removeSchedule_(Sharing.DataSchedule storage self, uint256 _scheduleId, bytes memory _reason) internal returns(uint256)  {
        require(self.mMintSchedules[_scheduleId].amount == self.mMintSchedules[_scheduleId].activeAmount, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.NOTALLOWED_ERROR)));

        delete self.mMintSchedules[_scheduleId];
        emit ScheduleRemoved(_scheduleId, msg.sender, _reason);
        return _scheduleId;
    } 
    
    function _mint_(Sharing.DataSchedule storage self, Sharing.DataToken storage tokenFunc, uint8 _granularity, address _coinBase, uint256 _scheduleIndex, address _holder, uint256 _amount, Sharing.TokenCat _sitCat, uint _recordId, bytes memory _data) public returns (string memory success) {
        
        require(self.mMintSchedules[_scheduleIndex].isActive, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.INVALID_ERROR)));
        require(self.mMintSchedules[_scheduleIndex].activeAmount >= _amount, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.INSUFFICIENT_FUND_ERROR)));
        require(_amount % _granularity == 0, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.TOKEN_GRANULARITY_ERROR)));

        uint8 _from;

        if (Sharing.TokenCat.Lien  == _sitCat) {
            tokenFunc.shareHolders[_holder].sitBalances.lien = tokenFunc.shareHolders[_holder].sitBalances.lien.add(_amount);
            TokenFunc._addToLien(tokenFunc,_holder, _amount, _recordId, now);
        } else  if (Sharing.TokenCat.Upfront  == _sitCat) {
            tokenFunc.shareHolders[_holder].sitBalances.upfront = tokenFunc.shareHolders[_holder].sitBalances.upfront.add(_amount);
            TokenFunc._addToUpfront (tokenFunc, _holder, _amount, _recordId, now);
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
    
    function _preloadToken_(Sharing.DataToken storage tokenFunc, uint8 _granularity, address _holder, uint _lien, uint _upfront, uint _loan, uint _tradable, uint _recordId, bytes memory _data) public returns (string memory success) {
      
        if (_lien > 0) {
            require(_lien % _granularity == 0, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.TOKEN_GRANULARITY_ERROR)));
            tokenFunc.shareHolders[_holder].sitBalances.lien = tokenFunc.shareHolders[_holder].sitBalances.lien.add(_lien);
            TokenFunc._addToLien(tokenFunc,_holder, _lien, _recordId, now);
        }
        if (_upfront > 0) {
            require(_upfront % _granularity == 0, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.TOKEN_GRANULARITY_ERROR)));
            tokenFunc.shareHolders[_holder].sitBalances.upfront = tokenFunc.shareHolders[_holder].sitBalances.upfront.add(_upfront);
            TokenFunc._addToUpfront (tokenFunc, _holder, _upfront, _recordId, now);
        }
        if (_loan > 0) {
            require(_loan % _granularity == 0, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.TOKEN_GRANULARITY_ERROR)));
            tokenFunc.shareHolders[_holder].sitBalances.upfront = tokenFunc.shareHolders[_holder].sitBalances.upfront.add(_loan);
            TokenFunc._addToUpfront (tokenFunc, _holder, _loan, _recordId, now);
        }
        if (_tradable > 0) {
             require(_tradable % _granularity == 0, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.TOKEN_GRANULARITY_ERROR)));
            tokenFunc.mBalances[_holder] = tokenFunc.mBalances[_holder].add(_tradable);
            tokenFunc.uTotalSupply = tokenFunc.uTotalSupply.add(_tradable);
        }

        emit Preloaded(_holder, _lien, _upfront, _loan, _tradable,  _data);
        success = MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.SUCCESS));
    }

}