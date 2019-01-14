pragma solidity >=0.4.0 <0.6.0;

import "./iST20.sol";
import "./sitRestriction.sol";
import "./authorizer.sol";


contract approveAndCallFallBack {
    function receiveApproval(address _from, uint256 _amount, address _token, bytes memory _data) public;
}

contract SIT is IST20, SITRestriction, Authorizer {
    
    event NewTradable(address indexed _from, address indexed _to, uint _amount, uint indexed _date);
    event NewAllocated(address _from, address indexed _to, uint _amount, uint indexed _dateGiven, uint indexed _dueDate);
    event NewVesting(address _from, address indexed _to, uint _amount, uint indexed _date);
    event NewLien(address _from, address indexed _to, uint _amount, uint indexed _startDate, uint indexed _lienPeriod);
    event MovedToTradable(address indexed _holder, string indexed _sitCat, uint256 catIndex);
    event NewShareholder(address indexed __holder);
    event shareHolderEnabled(address indexed __holder);
    event shareHolderDisabled(address indexed __holder);
    event Minted(string indexed _from, address indexed _holder, string indexed _sitCat, uint256 _amount, uint256 _scheduleType, bytes _data);
    event Withdrawn(address initiator, address indexed _holder, string indexed _sitCat, uint256 _amount, bytes _data);
    event NewSchedule(uint256 _scheduleId, string _scheduleType, uint256 _amount, bytes _data);
    event ScheduleApproved(uint256 _requestId, address _authorizer, bytes _reason); //Emit the authorizer's address that vote for approval
    event ScheduleRejected(uint256 _requestId, address _authorizer, bytes _reason); //Emit the authorizer's address that vote for rejection
    
    string public sName;
    string public sSymbol;
    uint256 private uTotalSupply;
    uint256 public uGranularity;
    address public aCoinbaseAcct; // Holds buybacks and withdrawn tokens
    
    struct Lien {
        uint amount;
        uint dateAdded;
        uint startDate;
        uint lienPeriod;
        bool isMovedToTradable;
    }

    struct Vesting {
        uint amount;
        uint dateGiven;
        bool isMovedToTradable;
    }

    struct Allocated {
        uint amount;
        uint dateGiven;
        uint dueDate;
        bool isMovedToTradable;
    }

    struct Tradable {
        uint amount;
        uint dateGiven;
    }
    
    mapping(address => Tradable[]) public mTradables;
    mapping(address => Lien[]) public mLiens;
    mapping(address => Allocated[]) public mAllocations;
    mapping(address => Vesting[]) public mVestings;
    
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
    uint256 internal scheduleIndex;
    mapping(uint256 => Schedule) public mMintSchedules;
    
    
    constructor (string memory _symbol, string memory _name, uint256 _granular, address _coinbase) public {
        sName = _name;
        sSymbol = _symbol;
        uGranularity = _granular;
        aCoinbaseAcct = _coinbase;
    }
    
    function stringsEqual(string memory _a, string memory _b) public pure returns(bool){
        if (keccak256(abi.encode(_a)) == keccak256(abi.encode(_b))) {
            return true;
        }
        return false;
    }
    
    function totalSupply() public view  returns (uint256) {
        require(isValid(msg.sender), SITRestriction.UNVERIFIED_HOLDER_ERROR);
        return uTotalSupply;
    }

   
    function balanceOf(address _tokenOwner) public view  returns (uint256) {
        require(isValid(msg.sender), SITRestriction.UNVERIFIED_HOLDER_ERROR); // Inquire if this is valid
        return mBalances[_tokenOwner];
    }
    
    function transfer(address _to, uint256 _amount) public returns (bool) {
        require(_amount % uGranularity == 0, TOKEN_GRANULARITY_ERROR);
        verifyTransfer (msg.sender, _to, _amount);
        _addToTradable(_to, _amount, now);
        mBalances[owner()].sub(_amount);
        mBalances[_to].add(_amount);
        emit Transfer(msg.sender, _to, _amount);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _amount) public returns (bool success) {
        require(_amount % uGranularity == 0, TOKEN_GRANULARITY_ERROR);
        verifyTransfer (msg.sender, _to, _amount);
        require(mAllowed[_from][msg.sender] <= _amount, SITRestriction.SPENDER_BALANCE_ERROR);
        _addToTradable(_to, _amount, now);
        mBalances[_from].sub(_amount);
        mAllowed[_from][msg.sender].sub(_amount);
        mBalances[_to].add(_amount);
        emit Transfer(_from, _to, _amount);
        return true;
    }

    function approve(address _spender, uint256 _amount) public onlyValidShareHolder returns (bool ) {
        require(shareHolders[_spender].isEnabled,SITRestriction.SEND_TRANSFER_BLOCKED);
        mAllowed[msg.sender][_spender] = _amount;
        emit Approval(msg.sender, _spender, _amount);
        return true;
    }
    
    function allowance(address _owner, address _spender) public view  returns (uint256) {
        require(isValid(msg.sender), SITRestriction.UNVERIFIED_HOLDER_ERROR);
        return mAllowed[_owner][_spender];
    }

    function approveAndCall(address _spender, uint256 _amount, bytes memory _data) public onlyValidShareHolder returns (bool) {
        require(shareHolders[_spender].isEnabled,SITRestriction.SEND_TRANSFER_BLOCKED);
        require(approve(_spender, _amount), "Spender could not be approved on your account");
        approveAndCallFallBack(_spender).receiveApproval(_spender, _amount, address(this), _data );
        return true;
    }
    
    function verifyTransfer (address _from,address _to,uint256 _amount)public view returns (bool success){
        uint8 restrictionCode = SITRestriction.detectTransferRestriction(_from, _to, _amount);
        require(restrictionCode == SITRestriction.SUCCESS_CODE, SITRestriction.messageForTransferRestriction(restrictionCode));
        return true;
    }
    
    
    function balanceOfByCat(string memory _sitCat, address _holder) public view returns (uint256) {
        require(isValid(msg.sender), SITRestriction.UNVERIFIED_HOLDER_ERROR);
        if (stringsEqual("lien", _sitCat)) {
            return shareHolders[_holder].sitBalances.lien;
        } else  if (stringsEqual("vesting", _sitCat)) {
            return shareHolders[_holder].sitBalances.vesting;
        } else  if (stringsEqual("allocated", _sitCat)) {
            return shareHolders[_holder].sitBalances.allocated;
        } else {
            return 0;
        }
    }
    
    function _addToTradable (address _holder, uint _amount, uint _dateAdded) internal returns(bool success) {
        mTradables[_holder].push(Tradable(_amount, _dateAdded));
        emit NewTradable(msg.sender, _holder, _amount, _dateAdded);
        return true;
    }
    
    
    function _addToAllocated (address _holder, uint _amount, uint _dateGiven, uint _dueDate) internal returns(bool success) {
        mAllocations[_holder].push(Allocated(_amount, _dateGiven, _dueDate, false));
        emit NewAllocated(msg.sender, _holder, _amount, _dateGiven, _dueDate);
        return true;
    }
    
    function _addToVesting (address _holder, uint _amount, uint _dateGiven) internal returns(bool success) {
        mVestings[_holder].push(Vesting(_amount, _dateGiven, false));
        emit NewVesting(msg.sender, _holder, _amount, _dateGiven);
        return true;
    }
    
    function _addToLien (address _holder, uint _amount, uint _dateAdded,  uint _dateStarted, uint _lienPeriod) internal returns(bool success) {
        mLiens[_holder].push(Lien(_amount, _dateAdded, _dateStarted, _lienPeriod, false));
        emit NewLien(msg.sender, _holder, _amount, _dateStarted, _lienPeriod);
        return true;
    }
    
    function moveToTradable(string memory _sitCat, address _holder, uint catIndex) public onlyOwner returns (bool success) {
        require(isValid(_holder), SITRestriction.RECEIPT_TRANSFER_BLOCKED);
        if (stringsEqual("lien", _sitCat)) {
            require(mLiens[_holder][catIndex].startDate.add(mLiens[_holder][catIndex].lienPeriod) >= now, SITRestriction.MOVE_LIEN_ERROR);
            mLiens[_holder][catIndex].isMovedToTradable = true;
            mBalances[_holder].add(mLiens[_holder][catIndex].amount);
            _addToTradable(_holder, mLiens[_holder][catIndex].amount, now);
            emit MovedToTradable(_holder,_sitCat, catIndex);
        } else  if (stringsEqual("vesting", _sitCat)) {
            mVestings[_holder][catIndex].isMovedToTradable = true;
            mBalances[_holder].add(mVestings[_holder][catIndex].amount);
            _addToTradable (_holder, mVestings[_holder][catIndex].amount, now);
            emit MovedToTradable(_holder,_sitCat, catIndex);
        } else  if (stringsEqual("allocated", _sitCat)) {
            mAllocations[_holder][catIndex].isMovedToTradable = true;
            mBalances[_holder].add(mAllocations[_holder][catIndex].amount);
            _addToTradable (_holder, mAllocations[_holder][catIndex].amount, now);
            emit MovedToTradable(_holder,_sitCat, catIndex);
        } 
        
        success = true;
        return success;
    }
    
    function addShareholder(address _holder, bool _isEnabled, bool _isWithhold, bytes32 _beneficiary) public onlyOwner returns(bool success) { 
        require(shareHolders[_holder].uniqueHolder == false, SITRestriction.UNIQUE_SHAREHOLDER_ERROR);
        
        SitBalanceByCat memory _holderBalance = SitBalanceByCat(0, 0, 0);

        shareHolders[_holder] = SitHolder(true, _isEnabled,_isWithhold, _beneficiary, _holderBalance);
        
        emit NewShareholder(_holder);
        
        return true;
    }
    
    function getSitHolder(address _holder) public view returns(bool isEnabled, bool isWithhold, bytes32 beneficiary,uint tradable, uint allocated, uint vesting, uint _ien ) { 
        
        return (shareHolders[_holder].isEnabled, shareHolders[_holder].isEnabled, shareHolders[_holder].beneficiary, mBalances[_holder], shareHolders[_holder].sitBalances.allocated, shareHolders[_holder].sitBalances.vesting, shareHolders[_holder].sitBalances.lien);
        
    }
    
    function changeBeneficiary(bytes32 _beneficiary) public returns (bool success) {
        require(isValid(msg.sender), SITRestriction.UNVERIFIED_HOLDER_ERROR);
        shareHolders[msg.sender].beneficiary = _beneficiary;
        success = true;
        return success;
    }
    
    function updateHolderAccess(address _holder, bool access) public onlyOwner returns (bool success) {
        shareHolders[_holder].isEnabled = access;
        if (access) {
            emit shareHolderEnabled(_holder);
        } else {
            emit shareHolderDisabled(_holder);
        }
        success = true;
        return success;
    }
    
    function withhold(address _holder) public onlyOwner returns (bool success) {
        if (shareHolders[_holder].isWithhold) {
            success = true;
            return success;
        }
        shareHolders[_holder].isWithhold = true;
        success = true;
        return success;
    }
    
    function unHold(address _holder) public onlyOwner returns (bool success) {
        if (!shareHolders[_holder].isWithhold) {
            success = true;
            return success;
        }
        shareHolders[_holder].isWithhold = false;
        success = true;
        return success;
    }
    
    function isValid(address _holder) public view returns (bool) {
        if (_holder != owner()) {
            return shareHolders[_holder].isEnabled;
        }
        return true;
    }
    
    function _isWithhold(address _holder) public view returns (bool) {
        require(isValid(msg.sender), SITRestriction.UNVERIFIED_HOLDER_ERROR);
        return shareHolders[_holder].isWithhold;
    }
    
    function mint(uint256 _scheduleIndex, address _holder, uint256 _amount, string memory _sitCat, uint256 _extraDataData, bytes memory _data) public onlyOwner returns (bool success) {
        
        if (totalSupply().add(_amount) < totalSupply()) {
            success = true;
            return success;
        }
        
        assert(stringsEqual(_sitCat, "tradable") || stringsEqual(_sitCat, "allocated") || stringsEqual(_sitCat, "vesting") || stringsEqual(_sitCat, "lien"));
        
        require(mMintSchedules[_scheduleIndex].isActive, "Inactive schedule");
        require(mMintSchedules[_scheduleIndex].isApproved, "Unauthorized schedule");
        require(mMintSchedules[_scheduleIndex].activeAmount >= _amount, "Minting amount is greater than available on schedule");
        require(_amount % uGranularity == 0, TOKEN_GRANULARITY_ERROR);
        require(isValid(_holder), SITRestriction.RECEIPT_TRANSFER_BLOCKED);
            
        string memory _from;
        
        if (balanceOf(aCoinbaseAcct) >= _amount) {
            uTotalSupply = mBalances[aCoinbaseAcct].sub(_amount);
            _from = "coinbase";
        } else {
            uTotalSupply = uTotalSupply.add(_amount);
            _from = "minter";
        }
        mMintSchedules[_scheduleIndex].activeAmount.sub(_amount);
        
        if (stringsEqual("lien", _sitCat)) {
            shareHolders[_holder].sitBalances.lien.add(_amount);
            _addToLien(_holder, _amount, now, now, _extraDataData);
        } else  if (stringsEqual("vesting", _sitCat)) {
            shareHolders[_holder].sitBalances.vesting.add(_amount);
            _addToVesting (_holder, _amount, now);
        } else  if (stringsEqual("allocated", _sitCat)) {
            shareHolders[_holder].sitBalances.allocated.add(_amount);
            _addToAllocated (_holder, _amount, now, _extraDataData);
        } else if (stringsEqual("tradable", _sitCat)) {
            mBalances[_holder].add(_amount);
            _addToTradable(_holder, _amount, now);
        }
        
        if (mMintSchedules[_scheduleIndex].activeAmount <= 0) {
            mMintSchedules[_scheduleIndex].isActive = false;
        }
        
        emit Minted(_from, _holder, _sitCat, _amount,  _scheduleIndex, _data);
        success = true;
    }

    function createSchedule (uint _amount, string memory _scheduleType, bytes memory _data) public onlyOwner returns(uint256 ) {

        Schedule memory schedule;
        schedule.amount = _amount;
        schedule.activeAmount = _amount;
        schedule.isApproved = false;
        schedule.isRejected = false;
        schedule.isActive = true;
        schedule.scheduleType = _scheduleType;
        
        mMintSchedules[scheduleIndex++] = schedule;
        emit NewSchedule(scheduleIndex, _scheduleType, _amount, _data);
        
        return scheduleIndex;
    } 
    
    function approveSchedule( uint256 _scheduleId, bytes memory _reason) public onlyAuthorizer returns(uint256 scheduleId)  {

        require(!mMintSchedules[_scheduleId].isApproved && !mMintSchedules[_scheduleId].isRejected, "This schedule has already been approved!");
        
        Schedule memory _scheduleInstance = mMintSchedules[_scheduleId];
        if (stringsEqual(_scheduleInstance.scheduleType, "custom"))  {
            require(stringsEqual(mAuthorizers[msg.sender].authorizerType, "custom"), "You are restricted from approving this schedule");
            mMintSchedules[_scheduleId].isApproved = true;
            mMintSchedules[_scheduleId].authorizerReason = _reason;
            mMintSchedules[_scheduleId].authorizedBy.push(msg.sender);
        } else if (stringsEqual(_scheduleInstance.scheduleType, "monthly"))  {
            require(stringsEqual(mAuthorizers[msg.sender].authorizerType, "custom"), "You are restricted from rejecting this schedule");
            mMintSchedules[_scheduleId].authorizedBy.push(msg.sender);
            if ( mMintSchedules[_scheduleId].authorizedBy.length >= 3) {
                mMintSchedules[_scheduleId].isApproved = true;
                mMintSchedules[_scheduleId].authorizerReason = _reason;
            }
        }
        emit ScheduleApproved(_scheduleId, msg.sender, _reason);
        return _scheduleId;

    } 
    
    function rejectSchedule( uint256 _scheduleId, bytes memory _reason) public onlyAuthorizer returns(uint256 scheduleId)  {
        Schedule memory _scheduleInstance = mMintSchedules[_scheduleId];
        if (stringsEqual(_scheduleInstance.scheduleType, "custom"))  {
            require(stringsEqual(mAuthorizers[msg.sender].authorizerType, "custom"), "You are restricted from rejecting this schedule");
            mMintSchedules[_scheduleId].isRejected = true;
            mMintSchedules[_scheduleId].authorizerReason = _reason;
            mMintSchedules[_scheduleId].authorizedBy.push(msg.sender);
        } else if (stringsEqual(_scheduleInstance.scheduleType, "custom"))  {
            require(stringsEqual(mAuthorizers[msg.sender].authorizerType, "monthly"), "You are restricted from rejecting this schedule");
            mMintSchedules[_scheduleId].isRejected = true;
            mMintSchedules[_scheduleId].authorizerReason = _reason;
            mMintSchedules[_scheduleId].authorizedBy.push(msg.sender);
        }
        emit ScheduleRejected(_scheduleId, msg.sender, _reason);
        return _scheduleId;

    } 
    
    function withdraw(address _holder, uint256 _amount, string memory _sitCat, bytes memory _reason) public onlyOwner returns (bytes memory reason) {
        if (_amount < 0) {
            return "";
        }
        
        require(_amount % uGranularity == 0, TOKEN_GRANULARITY_ERROR);
        
        if (stringsEqual("lien", _sitCat)) {
            shareHolders[_holder].sitBalances.lien.sub(_amount);
        } else  if (stringsEqual("vesting", _sitCat)) {
            shareHolders[_holder].sitBalances.vesting.sub(_amount);
        } else  if (stringsEqual("allocated", _sitCat)) {
            shareHolders[_holder].sitBalances.allocated.sub(_amount);
        } else if (stringsEqual("tradable", _sitCat)) {
            mBalances[_holder].sub(_amount);
        }
        
        mBalances[aCoinbaseAcct].add(_amount);
        emit Withdrawn(msg.sender, _holder, _sitCat, _amount, _reason);
        
        return _reason;
    }
     
     // Don't accept ETH
    function () external payable {
        revert("Contract cannot accept Ether");
    }

    // Owner can transfer out any accidentally sent ERC20 tokens
    function transferAnyERC20Token(address tokenAddress, uint tokens) public onlyOwner returns (bool success) {
        return SITRestriction(tokenAddress).transfer(owner(), tokens);
    }
}
