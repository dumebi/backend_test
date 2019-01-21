pragma solidity >=0.4.0 <0.6.0;

import "./libUtils.sol";
import "./libSafeMath.sol";
import "./libMsgCode.sol";
import "./libTokenFunc.sol";
    
library TokenScheduler  {
    
    using Utils for *;
    using SafeMath for uint256;
    
    event NewSchedule(uint256 _scheduleId, string _scheduleType, uint256 _amount, bytes _data);
    event ScheduleApproved(uint256 _requestId, address _authorizer, bytes _reason); //Emit the authorizer's address that vote for approval
    event ScheduleRejected(uint256 _requestId, address _authorizer, bytes _reason); //Emit the authorizer's address that vote for rejection
    event ScheduleRemoved(uint256 indexed _scheduleId, address indexed _initiator, bytes _reason);
    event Minted(string indexed _from, address indexed _holder, string indexed _sitCat, uint256 _amount, uint256 _scheduleType, bytes _data);

    
    struct Schedule {
        uint amount;
        uint activeAmount;
        bool isApproved;
        bool isRejected;
        bool isActive;
        bytes authorizerReason;
        string scheduleType;
        address[] authorizedBy;
    }
    
    struct Data {
        uint256[] scheduleIndex;
        mapping(uint256 => Schedule) mMintSchedules;
    }
    
    function createSchedule (Data storage self, uint _scheduleId, uint _amount, string memory _scheduleType, bytes memory _data) internal returns(uint256 ) {

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
    
    function approveSchedule(Data storage self, uint256 _scheduleId, bytes memory _reason, string memory _authorizerType) internal returns(uint256)  {

        require(!self.mMintSchedules[_scheduleId].isApproved && !self.mMintSchedules[_scheduleId].isRejected, "This schedule has already been approved!");
        Schedule memory _scheduleInstance = self.mMintSchedules[_scheduleId];
        if (Utils.stringsEqual(_scheduleInstance.scheduleType, "custom"))  {
            require(Utils.stringsEqual(_authorizerType, "custom"), "You are restricted from approving this schedule");
            self.mMintSchedules[_scheduleId].isApproved = true;
            self.mMintSchedules[_scheduleId].authorizerReason = _reason;
            self.mMintSchedules[_scheduleId].authorizedBy.push(msg.sender);
        } else if (Utils.stringsEqual(_scheduleInstance.scheduleType, "monthly"))  {
            require(Utils.stringsEqual(_authorizerType, "custom"), "You are restricted from rejecting this schedule");
            self.mMintSchedules[_scheduleId].authorizedBy.push(msg.sender);
            if ( self.mMintSchedules[_scheduleId].authorizedBy.length >= 3) {
                self.mMintSchedules[_scheduleId].isApproved = true;
                self.mMintSchedules[_scheduleId].authorizerReason = _reason;
            }
        }
        emit ScheduleApproved(_scheduleId, msg.sender, _reason);
        return _scheduleId;

    } 
    
    function rejectSchedule(Data storage self, uint256 _scheduleId, bytes memory _reason, string memory _authorizerType) internal returns(uint256)  {
        Schedule memory _scheduleInstance = self.mMintSchedules[_scheduleId];
        if (Utils.stringsEqual(_scheduleInstance.scheduleType, "custom"))  {
            require(Utils.stringsEqual(_authorizerType, "custom"), "You are restricted from rejecting this schedule");
            self.mMintSchedules[_scheduleId].isRejected = true;
            self.mMintSchedules[_scheduleId].authorizerReason = _reason;
            self.mMintSchedules[_scheduleId].authorizedBy.push(msg.sender);
        } else if (Utils.stringsEqual(_scheduleInstance.scheduleType, "custom"))  {
            require(Utils.stringsEqual(_authorizerType, "monthly"), "You are restricted from rejecting this schedule");
            self.mMintSchedules[_scheduleId].isRejected = true;
            self.mMintSchedules[_scheduleId].authorizerReason = _reason;
            self.mMintSchedules[_scheduleId].authorizedBy.push(msg.sender);
        }
        emit ScheduleRejected(_scheduleId, msg.sender, _reason);
        return _scheduleId;
    } 
    
    function removeSchedule(Data storage self, uint256 _scheduleId, bytes memory _reason) internal returns(uint256)  {
        require(self.mMintSchedules[_scheduleId].amount != self.mMintSchedules[_scheduleId].activeAmount, "This schedule cannot be removed! Tokens have already been minted on it");

        delete self.mMintSchedules[_scheduleId];
        emit ScheduleRemoved(_scheduleId, msg.sender, _reason);
        return _scheduleId;
    } 
    
    function mint(Data storage self, TokenFunc.Data storage tokenFunc, MessagesAndCodes.Data storage _msgCode, uint8 _granularity, address _coinBase, uint256 _scheduleIndex, address _holder, uint256 _amount, string memory _sitCat, uint256 _extraDataData, bytes memory _data) internal returns (bool success) {

        require(Utils.stringsEqual(_sitCat, "tradable") || Utils.stringsEqual(_sitCat, "allocated") || Utils.stringsEqual(_sitCat, "vesting") || Utils.stringsEqual(_sitCat, "lien"), "Invalid SIT category given");
        require(self.mMintSchedules[_scheduleIndex].isActive, "Inactive schedule");
        require(self.mMintSchedules[_scheduleIndex].isApproved, "Unauthorized schedule");
        require(self.mMintSchedules[_scheduleIndex].activeAmount >= _amount, "Minting amount is greater than available on schedule");
        require(_amount % _granularity == 0, _msgCode.messages[_msgCode.code.errorStringToCode["TOKEN_GRANULARITY_ERROR"]]);
            
        string memory _from;

        if (Utils.stringsEqual("lien", _sitCat)) {
            tokenFunc.shareHolders[_holder].sitBalances.lien.add(_amount);
            TokenFunc._addToLien(tokenFunc,_holder, _amount, now, now, _extraDataData);
        } else  if (Utils.stringsEqual("vesting", _sitCat)) {
            tokenFunc.shareHolders[_holder].sitBalances.vesting.add(_amount);
            TokenFunc._addToVesting (tokenFunc, _holder, _amount, now);
        } else  if (Utils.stringsEqual("allocated", _sitCat)) {
            tokenFunc.shareHolders[_holder].sitBalances.allocated.add(_amount);
            TokenFunc._addToAllocated (tokenFunc, _holder, _amount, now, _extraDataData);
        } else if (Utils.stringsEqual("tradable", _sitCat)) {
            tokenFunc.mBalances[_holder].add(_amount);
            TokenFunc._addToTradable(tokenFunc, _holder, _amount, now);
        }
        
        if (TokenFunc.balanceOf(tokenFunc, _coinBase) >= _amount) {
            tokenFunc.mBalances[_coinBase].sub(_amount);
            _from = "coinbase";
        } else {
            tokenFunc.uTotalSupply = tokenFunc.uTotalSupply.add(_amount);
            _from = "minter";
        }
        self.mMintSchedules[_scheduleIndex].activeAmount.sub(_amount);
        
        if (self.mMintSchedules[_scheduleIndex].activeAmount <= 0) {
            self.mMintSchedules[_scheduleIndex].isActive = false;
        }
        
        emit Minted(_from, _holder, _sitCat, _amount,  _scheduleIndex, _data);
        success = true;
    }

    
}