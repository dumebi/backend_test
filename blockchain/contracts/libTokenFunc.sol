pragma solidity >=0.4.0 <0.6.0;

import "./libUtils.sol";
import "./libSafeMath.sol";
import "./libMsgCode.sol";
import "./libOwner.sol";


library TokenFunc {

    using SafeMath for uint256;
    using Utils for *;
    using Ownable for *;
    
    
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
    event NewTradable(address indexed _from, address indexed _to, uint _amount, uint indexed _date);
    event NewAllocated(address _from, address indexed _to, uint _amount, uint indexed _dateAdded);
    event NewVesting(address _from, address indexed _to, uint _amount, uint indexed _date);
    event NewLien(address _from, address indexed _to, uint _amount, uint indexed _dateAdded, uint indexed _lienPeriod);
    event MovedToTradable(address indexed _holder, TokenCat _sitCat, uint256 catIndex);
    event NewShareholder(address indexed __holder);
    event shareHolderUpdated(address indexed _holder,bool updateData, uint8 _updateSpecification);
    event Withdrawn(address initiator, address indexed _holder, TokenCat _sitCat, uint256 _amount, bytes _data);
    
    enum TokenCat { Tradable, Lien, Allocated, Vesting }
    
    struct Data {
        uint256 uTotalSupply;
        mapping(address => uint256) mBalances; //The tradable balance for SITHolders
        mapping (address => mapping (address => uint256)) mAllowed;
        mapping(address => Tradable[]) mTradables;
        mapping(address => Lien[]) mLiens;
        mapping(address => Allocated[]) mAllocations;
        mapping(address => Vesting[]) mVestings;
        mapping(address => SitHolder) shareHolders; 
    }
    
    struct Lien {
        uint amount;
        uint dateAdded;
        uint lienPeriod;
        bool isMovedToTradable;
    }

    struct Vesting {
        uint amount;
        uint dateAdded;
        bool isMovedToTradable;
    }

    struct Allocated {
        uint amount;
        uint dateAdded;
        bool isMovedToTradable;
    }

    struct Tradable {
        uint amount;
        uint dateAdded;
    }
    
    struct SitBalanceByCat {
        uint256 allocated;
        uint256 vesting;
        uint256 lien;
    }
    
    struct SitHolder {
        bool uniqueHolder;
        bool isEnabled;
        bool isWithhold;
        bytes32 beneficiary; //Incase of death, users SIT will be transfered
        SitBalanceByCat sitBalances;
    }
    
    
    function totalSupply(Data storage self) internal view  returns (uint256) {
        return self.uTotalSupply;
    }

    function balanceOf(Data storage self, address _tokenOwner) internal view returns (uint256) {
        return self.mBalances[_tokenOwner];
    }
    
    function transfer(Data storage self, MessagesAndCodes.Data storage _msgCode, address _to, uint256 _amount) public returns (bool) {
        verifyTransfer (self, _msgCode,  msg.sender, _to, _amount);
        self.mBalances[msg.sender].sub(_amount);
        self.mBalances[_to].add(_amount);
        emit Transfer(msg.sender, _to, _amount);
        return true;
    }

    function transferFrom(Data storage self, MessagesAndCodes.Data storage _msgCode, address _from, address _to, uint256 _amount) public returns (bool success) {
        verifyTransfer (self, _msgCode, msg.sender, _to, _amount);
        require(self.mAllowed[_from][msg.sender] <= _amount, _msgCode.messages[_msgCode.code.errorStringToCode["SPENDER_BALANCE_ERROR"]]);
        self.mBalances[_from].sub(_amount);
        self.mAllowed[_from][msg.sender].sub(_amount);
        self.mBalances[_to].add(_amount);
        emit Transfer(_from, _to, _amount);
        return true;
    }

    function approve(Data storage self, MessagesAndCodes.Data storage _msgCode, address _spender, uint256 _amount) internal returns (bool ) {
        require(self.shareHolders[_spender].isEnabled, _msgCode.messages[_msgCode.code.errorStringToCode["SEND_TRANSFER_BLOCKED"]]);
        self.mAllowed[msg.sender][_spender] = _amount;
        emit Approval(msg.sender, _spender, _amount);
        return true;
    }
    
    function allowance(Data storage self, address _owner, address _spender) public view  returns (uint256) {
        return self.mAllowed[_owner][_spender];
    }
    
    function verifyTransfer (Data storage self, MessagesAndCodes.Data storage _msgCode, address _from,address _to,uint256 _amount)public view returns (bool success){
        uint8 restrictionCode = detectTransferRestriction(self, _msgCode, _from, _to, _amount);
        require(restrictionCode == _msgCode.code.errorStringToCode["SUCCESS"], messageForTransferRestriction(_msgCode, restrictionCode));
        return true;
    }
    
    function detectTransferRestriction (Data storage self, MessagesAndCodes.Data storage _msgCode, address _from, address _to, uint256 _amount) public view returns (uint8)
    {
        uint8 restrictionCode = _msgCode.code.errorStringToCode["SUCCESS"];
        if (!self.shareHolders[_from].isEnabled) {
            restrictionCode = _msgCode.code.errorStringToCode["SEND_TRANSFER_BLOCKED"];
        } else if (!self.shareHolders[_to].isEnabled) {
            restrictionCode = _msgCode.code.errorStringToCode["RECEIPT_TRANSFER_BLOCKED"];
        } else if (self.mBalances[_from] < _amount) {
            restrictionCode = _msgCode.code.errorStringToCode["INSUFFICIENT_BALANCE_ERROR"];
        } else if (_amount <= 0 && self.mBalances[_to].add(_amount) <= self.mBalances[_to]) {
            restrictionCode = _msgCode.code.errorStringToCode["INVALID_AMOUNT_ERROR"];
        } else if (!self.shareHolders[_from].isWithhold) {
            restrictionCode = _msgCode.code.errorStringToCode["ACCOUNT_WITHHOLD_ERROR"];
        }
        return restrictionCode;
    }
        
    function messageForTransferRestriction (MessagesAndCodes.Data storage _msgCode, uint8 restrictionCode) public view returns (string memory message){
        return _msgCode.messages[restrictionCode];
    }
    
    function getRecordByCat(Data storage self, address _holder, TokenCat _sitCat, uint _catIndex) internal view returns (uint256 amount, uint256 dateAdded, uint256 lienPeriod, bool isMovedToTradable) {
        
        if (TokenCat.Tradable == _sitCat) {
            Tradable memory _tradable = self.mTradables[_holder][_catIndex];
            return(_tradable.amount, _tradable.dateAdded, 0, true);
        } else if (TokenCat.Lien == _sitCat) {
            Lien memory _lien = self.mLiens[_holder][_catIndex];
            return(_lien.amount, _lien.dateAdded, _lien.lienPeriod, _lien.isMovedToTradable);
        } else  if (TokenCat.Vesting == _sitCat) {
            Vesting memory _vesting = self.mVestings[_holder][_catIndex];
            return(_vesting.amount, _vesting.dateAdded, 0, _vesting.isMovedToTradable);
        } else  if (TokenCat.Allocated == _sitCat) {
            Allocated memory _allocate = self.mAllocations[_holder][_catIndex];
            return(_allocate.amount, _allocate.dateAdded,0, _allocate.isMovedToTradable);
        } 
    }
    
    function _addToTradable (Data storage self, address _holder, uint _amount, uint _dateAdded) internal returns(bool success) {
        self.mTradables[_holder].push(Tradable(_amount, _dateAdded));
        emit NewTradable(msg.sender, _holder, _amount, _dateAdded);
        return true;
    }
    
    function _addToAllocated (Data storage self, address _holder, uint _amount, uint _dateAdded) internal returns(bool success) {
        self.mAllocations[_holder].push(Allocated(_amount, _dateAdded, false));
        emit NewAllocated(msg.sender, _holder, _amount, _dateAdded);
        return true;
    }
    
    function _addToVesting (Data storage self, address _holder, uint _amount, uint _dateAdded) internal returns(bool success) {
        self.mVestings[_holder].push(Vesting(_amount, _dateAdded, false));
        emit NewVesting(msg.sender, _holder, _amount, _dateAdded);
        return true;
    }
    
    function _addToLien (Data storage self, address _holder, uint _amount, uint _dateAdded, uint _lienPeriod) internal returns(bool success) {
        self.mLiens[_holder].push(Lien(_amount, _dateAdded, _lienPeriod, false));
        emit NewLien(msg.sender, _holder, _amount, _dateAdded, _lienPeriod);
        return true;
    }    
    
    function moveToTradable(Data storage self, MessagesAndCodes.Data storage _msgCode, address _holder, TokenCat _sitCat, uint catIndex) internal returns (bool success) {
        if (TokenCat.Tradable == _sitCat) {
            require(self.mLiens[_holder][catIndex].dateAdded.add(self.mLiens[_holder][catIndex].lienPeriod) >= now, _msgCode.messages[_msgCode.code.errorStringToCode["MOVE_LIEN_ERROR"]]);
            self.mLiens[_holder][catIndex].isMovedToTradable = true;
            self.mBalances[_holder].add(self.mLiens[_holder][catIndex].amount);
            _addToTradable(self,_holder, self.mLiens[_holder][catIndex].amount, now);
            emit MovedToTradable(_holder,_sitCat, catIndex);
        } else  if (TokenCat.Vesting == _sitCat) {
            self.mVestings[_holder][catIndex].isMovedToTradable = true;
            self.mBalances[_holder].add(self.mVestings[_holder][catIndex].amount);
            _addToTradable (self, _holder, self.mVestings[_holder][catIndex].amount, now);
            emit MovedToTradable(_holder,_sitCat, catIndex);
        } else  if (TokenCat.Allocated == _sitCat) {
            self.mAllocations[_holder][catIndex].isMovedToTradable = true;
            self.mBalances[_holder].add(self.mAllocations[_holder][catIndex].amount);
            _addToTradable (self, _holder, self.mAllocations[_holder][catIndex].amount, now);
            emit MovedToTradable(_holder,_sitCat, catIndex);
        } 
        success = true;
        return success;
    }
    
    function addShareholder(Data storage self, MessagesAndCodes.Data storage _msgCode, address _holder, bool _isEnabled, bool _isWithhold, bytes32 _beneficiary) internal returns(bool) { 
        require(self.shareHolders[_holder].uniqueHolder == false, _msgCode.messages[_msgCode.code.errorStringToCode["UNIQUE_SHAREHOLDER_ERROR"]]);
        SitBalanceByCat memory _holderBalance = SitBalanceByCat(0, 0, 0);
        self.shareHolders[_holder] = SitHolder(true, _isEnabled,_isWithhold, _beneficiary, _holderBalance);
        emit NewShareholder(_holder);
        return true;
    }
    
    function getShareHolder(Data storage self, address _holder) public view returns(bool isEnabled, bool isWithhold, bytes32 beneficiary,uint tradable, uint allocated, uint vesting, uint lien ) { 
        return (self.shareHolders[_holder].isEnabled, self.shareHolders[_holder].isWithhold, self.shareHolders[_holder].beneficiary, self.mBalances[_holder], self.shareHolders[_holder].sitBalances.allocated, self.shareHolders[_holder].sitBalances.vesting, self.shareHolders[_holder].sitBalances.lien);
    }

    function updateShareHolder(Data storage self, address _holder, bool _updateData, uint8 _updateSpec) internal returns(bool) { 

        if (_updateSpec == 1) {
            self.shareHolders[_holder].isEnabled = _updateData;
            emit shareHolderUpdated(_holder, _updateData, 1);
            return true;
        } else if (_updateSpec == 0) {
            self.shareHolders[_holder].isWithhold = _updateData;
            emit shareHolderUpdated(_holder, _updateData, 0);
            return true;
        }
        return false;
    }
    
    
    function withdraw(Data storage self, MessagesAndCodes.Data storage _msgCode, uint8 _granularity, address _coinBase, address _holder, uint256 _amount, TokenCat _sitCat, bytes memory _reason) internal returns (bytes memory reason) {

        require(_amount % _granularity == 0, _msgCode.messages[_msgCode.code.errorStringToCode["TOKEN_GRANULARITY_ERROR"]]);
        if (TokenCat.Lien == _sitCat) {
            self.shareHolders[_holder].sitBalances.lien.sub(_amount);
        } else  if (TokenCat.Vesting == _sitCat) {
            self.shareHolders[_holder].sitBalances.vesting.sub(_amount);
        } else if (TokenCat.Allocated == _sitCat) {
            self.shareHolders[_holder].sitBalances.allocated.sub(_amount);
        } else if (TokenCat.Tradable == _sitCat) {
            self.mBalances[_holder].sub(_amount);
        }
        self.mBalances[_coinBase].add(_amount);
        emit Withdrawn(msg.sender, _holder, _sitCat, _amount, _reason);
        return _reason;
    }
}
