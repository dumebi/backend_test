pragma solidity >=0.4.0 <0.6.0;

import "./libSafeMath.sol";
import "./libTokenFunc.sol";
import "./libMsgCode.sol";
import "./libSharing.sol";

library TokenScheduler  {
    using SafeMath for uint256;
    
    event NewSchedule(bytes32 indexed _scheduleId, Sharing.ScheduleType _scheduleType, uint256 _amount, bytes _reason);
    event ScheduleRemoved(bytes32 indexed _scheduleId, address indexed _initiator, bytes _reason);
    event Minted(uint8 indexed _from, address indexed _holder, Sharing.TokenCat _sitCat, uint256 _amount, bytes32 _scheduleId , bytes _reason);
    event Preloaded(address indexed _holder, uint256 _upfront, uint256 _loan, uint256 _tradable, bytes _reason);
    
    function _createSchedule_ (Sharing.DataSchedule storage self, bytes32 _scheduleId, uint _amount, Sharing.ScheduleType _scheduleType, bytes memory _data) internal returns(string memory success ) {
        require(_amount > 0, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.ZERO_SCHEDULE_ERROR)));
        require(self.mMintSchedules[_scheduleId].amount == 0, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.UNIQUENESS_ERROR)));
        
        self.mMintSchedules[_scheduleId] = Sharing.Schedule(_amount, _amount, true, _scheduleType);
        emit NewSchedule(_scheduleId, _scheduleType, _amount, _data);
        
        success = MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.SUCCESS));
    } 
    
    function _getSchedule_ (Sharing.DataSchedule storage self, bytes32 _scheduleId) internal view returns(bytes32 scheduleId, uint amount, uint activeAmount, bool isActive, Sharing.ScheduleType scheduleType ) {
        Sharing.Schedule memory _Mschedule = self.mMintSchedules[_scheduleId];
        return (_scheduleId, _Mschedule.amount, _Mschedule.activeAmount, _Mschedule.isActive, _Mschedule.scheduleType);
    }  
    
    function _removeSchedule_(Sharing.DataSchedule storage self, bytes32 _scheduleId, bytes memory _reason) internal returns(bool success)  {
        require(self.mMintSchedules[_scheduleId].amount == self.mMintSchedules[_scheduleId].activeAmount, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.NOTALLOWED_ERROR)));

        delete self.mMintSchedules[_scheduleId];
        emit ScheduleRemoved(_scheduleId, msg.sender, _reason);
        success = true ;
    } 
    
    function _mint_(Sharing.DataSchedule storage self, Sharing.DataToken storage tokenFunc, uint8 _granularity, address _coinBase, bytes32 _scheduleId, address _holder, uint256 _amount, Sharing.TokenCat _sitCat, bytes32 _recordId, bytes memory _data) internal returns (string memory success) {
        
        require(self.mMintSchedules[_scheduleId].isActive, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.INVALID_ERROR)));
        require(self.mMintSchedules[_scheduleId].activeAmount >= _amount, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.INSUFFICIENT_FUND_ERROR)));
        require(_amount % _granularity == 0, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.TOKEN_GRANULARITY_ERROR)));
        require(_sitCat == Sharing.TokenCat.Lien || _sitCat == Sharing.TokenCat.Upfront , MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.INVALID_MINT_ERROR)));

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
        
        self.mMintSchedules[_scheduleId].activeAmount = self.mMintSchedules[_scheduleId].activeAmount.sub(_amount);
        
        if (self.mMintSchedules[_scheduleId].activeAmount <= 0) {
            self.mMintSchedules[_scheduleId].isActive = false;
        }
        
        emit Minted(_from, _holder, _sitCat, _amount,  _scheduleId, _data);
        success = MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.SUCCESS));
    }
    
    function _preloadToken_(Sharing.DataToken storage tokenFunc, uint8 _granularity, address _holder, uint _lien, uint _upfront, uint _tradable, bytes32 _idLien, bytes32 _idUpfront, bytes memory _data) internal returns (string memory success) {

        if (_lien > 0) {
            require(_lien % _granularity == 0, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.TOKEN_GRANULARITY_ERROR)));
            tokenFunc.shareHolders[_holder].sitBalances.lien = tokenFunc.shareHolders[_holder].sitBalances.lien.add(_lien);
            TokenFunc._addToLien(tokenFunc,_holder,_lien, _idLien, now);
            tokenFunc.uTotalSupply = tokenFunc.uTotalSupply.add(_lien);
        }
        if (_upfront > 0) {
            require(_upfront % _granularity == 0, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.TOKEN_GRANULARITY_ERROR)));
            tokenFunc.shareHolders[_holder].sitBalances.upfront = tokenFunc.shareHolders[_holder].sitBalances.upfront.add(_upfront);
            TokenFunc._addToUpfront (tokenFunc, _holder, _upfront, _idUpfront, now);
            tokenFunc.uTotalSupply = tokenFunc.uTotalSupply.add(_upfront);
        }
        // if (_loan > 0) {
        //     require(_loan % _granularity == 0, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.TOKEN_GRANULARITY_ERROR)));
        //     tokenFunc.shareHolders[_holder].sitBalances.loanEscrow = tokenFunc.shareHolders[_holder].sitBalances.loanEscrow.add(_loan);
        //     TokenFunc._addToLoanEscrow (tokenFunc, _holder, _loan, _idLoan, now);
        //     tokenFunc.uTotalSupply = tokenFunc.uTotalSupply.add(_loan);
        // }
        if (_tradable > 0) {
             require(_tradable % _granularity == 0, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.TOKEN_GRANULARITY_ERROR)));
            tokenFunc.mBalances[_holder] = tokenFunc.mBalances[_holder].add(_tradable);
            tokenFunc.uTotalSupply = tokenFunc.uTotalSupply.add(_tradable);
        }

        emit Preloaded(_holder, _lien, _upfront, _tradable,  _data);
        success = MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.SUCCESS));
    }

}