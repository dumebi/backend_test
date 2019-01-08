pragma solidity >=0.4.0 <0.6.0;

import "./messagedERC1404.sol";
import "./iST20.sol";
import "./safeMath.sol";
import "./owner.sol";
import "./sitRestriction.sol";


contract approveAndCallFallBack {
    function receiveApproval(address _from, uint256 _amount, address _token, bytes memory _data) public;
}

contract SIT is Restricted, MessagedERC1404, IST20, Ownable, SITRestriction {
    
    using SafeMath for uint256;
    
    
    function stringsEqual(string memory _a, string memory _b) internal pure returns (bool) {
        return keccak256(abi.encode(_a)) == keccak256(abi.encode(_b));
	}

    function random() public view returns (uint8) {
        return uint8(uint256(keccak256(abi.encode(msg.sender, now, block.difficulty)))%251);
    }

    event NewTradable(address indexed _from, address indexed _to, uint _amount, uint indexed _date);
    event NewAllocated(address _from, address indexed _to, uint _amount, uint indexed _dateGiven, uint indexed _dueDate);
    event NewVesting(address _from, address indexed _to, uint _amount, uint indexed _date);
    event NewLien(address _from, address indexed _to, uint _amount, uint indexed _startDate, uint indexed _lienPeriod);
    event MovedToTradable(address indexed _holder, string indexed _sitCat, uint256 catIndex);
    event NewShareholder(address indexed __holder);
    event shareHolderEnabled(address indexed __holder);
    event shareHolderDisabled(address indexed __holder);
    
    string public sName;
    string public sSymbol;
    uint256 private uTotalSupply;
    uint8 private uDecimals = 18;
    
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
    
    mapping(address => Tradable[]) public tradables;
    mapping(address => Lien[]) public liens;
    mapping(address => Allocated[]) public allocations;
    mapping(address => Vesting[]) public vestings;
    
    
    constructor (string memory _symbol, string memory _name, uint256 _total) public {
        sName = _name;
        sSymbol = _symbol;
        
        uTotalSupply = _total;
    }
    
    function totalSupply() public view  returns (uint256) {
        return uTotalSupply;
    }

   
    function balanceOf(address _tokenOwner) public view  returns (uint256) {
        return mBalances[_tokenOwner];
    }
    
    function transfer(address _to, uint256 _amount) public returns (bool) {
        verifyTransfer (msg.sender, _to, _amount);
        _addToTradable(_to, _amount, now);
        mBalances[owner()].sub(_amount);
        mBalances[_to].add(_amount);
        emit Transfer(msg.sender, _to, _amount);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _amount) public returns (bool success) {
        
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
        require(shareHolders[_spender].isEnabled , SITRestriction.SEND_TRANSFER_BLOCKED);
        mAllowed[msg.sender][_spender] = _amount;
        emit Approval(msg.sender, _spender, _amount);
        return true;
    }
    
    function allowance(address _owner, address _spender) public view  returns (uint256) {
        return mAllowed[_owner][_spender];
    }

    function approveAndCall(address _spender, uint256 _amount, bytes memory _data) public onlyValidShareHolder returns (bool) {
        require(shareHolders[_spender].isEnabled,SITRestriction.SEND_TRANSFER_BLOCKED);
        require(approve(_spender, _amount), "Spender could not be approved on your account");
        approveAndCallFallBack(_spender).receiveApproval(_spender, _amount, address(this), _data );
        return true;
    }
    
    function verifyTransfer (address _from,address _to,uint256 _amount)public view returns (bool success){
        uint8 restrictionCode = Restricted.detectTransferRestriction(_from, _to, _amount);
        require(restrictionCode == Restricted.SUCCESS_CODE, MessagedERC1404.messageForTransferRestriction(restrictionCode));
        return true;
    }
    
    
    function balanceOfByCat(string memory _sitCat, address _holder) public view returns (uint256) {
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
        tradables[_holder].push(Tradable(_amount, _dateAdded));
        emit NewTradable(msg.sender, _holder, _amount, _dateAdded);
        return true;
    }
    
    
    function _addToAllocated (address _holder, uint _amount, uint _dateGiven, uint _dueDate) internal returns(bool success) {
        allocations[_holder].push(Allocated(_amount, _dateGiven, _dueDate, false));
        emit NewAllocated(msg.sender, _holder, _amount, _dateGiven, _dueDate);
        return true;
    }
    
    function _addToVesting (address _holder, uint _amount, uint _dateGiven) internal returns(bool success) {
        vestings[_holder].push(Vesting(_amount, _dateGiven, false));
        emit NewVesting(msg.sender, _holder, _amount, _dateGiven);
        return true;
    }
    
    function _addToLien (address _holder, uint _amount, uint _dateAdded,  uint _dateStarted, uint _lienPeriod) internal returns(bool success) {
        liens[_holder].push(Lien(_amount, _dateAdded, _dateStarted, _lienPeriod, false));
        emit NewLien(msg.sender, _holder, _amount, _dateStarted, _lienPeriod);
        return true;
    }
    
    function moveToTradable(string memory _sitCat, address _holder, uint catIndex) public onlyOwner returns (bool success) {
        if (stringsEqual("lien", _sitCat)) {
            require(liens[_holder][catIndex].startDate.add(liens[_holder][catIndex].lienPeriod) >= now, SITRestriction.MOVE_LIEN_ERROR);
            liens[_holder][catIndex].isMovedToTradable = true;
            mBalances[_holder].add(liens[_holder][catIndex].amount);
            _addToTradable(_holder, liens[_holder][catIndex].amount, now);
            emit MovedToTradable(_holder,_sitCat, catIndex);
        } else  if (stringsEqual("vesting", _sitCat)) {
            vestings[_holder][catIndex].isMovedToTradable = true;
            mBalances[_holder].add(vestings[_holder][catIndex].amount);
            _addToTradable (_holder, vestings[_holder][catIndex].amount, now);
            emit MovedToTradable(_holder,_sitCat, catIndex);
        } else  if (stringsEqual("allocated", _sitCat)) {
            allocations[_holder][catIndex].isMovedToTradable = true;
            mBalances[_holder].add(allocations[_holder][catIndex].amount);
            _addToTradable (_holder, allocations[_holder][catIndex].amount, now);
            emit MovedToTradable(_holder,_sitCat, catIndex);
        } 
        
        bool success = true;
        return success;
    }
    
    function addShareholder(address _holder, bool _isEnabled, bool _isWithhold, bytes32 _beneficiary) public onlyOwner returns(bool success) { 
        require(shareHolders[_holder].uniqueHolder == false, SITRestriction.UNIQUE_SHAREHOLDER_ERROR);
        
        SitBalanceByCat memory _holderBalance = SitBalanceByCat(0, 0, 0);

        shareHolders[_holder] = SitHolder(true, _isEnabled,_isWithhold, _beneficiary, _holderBalance);
        
        emit NewShareholder(_holder);
        
        return true;
    }
    
    
    function updateHolderAccess(address _holder, bool access) public onlyOwner returns (bool success) {
        shareHolders[_holder].isEnabled = access;
        if (access) {
            emit shareHolderEnabled(_holder);
        } else {
            emit shareHolderDisabled(_holder);
        }
        return true;
    }
    
    function withhold(address _holder) public returns (bool success) {
        if (shareHolders[_holder].isWithhold) {
            bool success = true;
            return success;
        }
        shareHolders[_holder].isWithhold = true;
        bool success = true;
        return success;
    }
    
    function unHold(address _holder) public returns (bool success) {
        if (!shareHolders[_holder].isWithhold) {
            bool success = true;
            return success;
        }
        shareHolders[_holder].isWithhold = false;
        bool success = true;
        return success;
    }
    
    function isValid(address _holder) view public returns (bool success) {
        return shareHolders[_holder].isEnabled;
    }
    
    function _isWithhold(address _holder) view public returns (bool success) {
        return shareHolders[_holder].isWithhold;
    }
    
    function mint(address _holder, uint256 _amount) public onlyOwner returns (bool success) {
        uTotalSupply = uTotalSupply.add(_amount);
        mBalances[_holder] = mBalances[_holder].add(_amount);
        emit Transfer(address(this), _holder, _amount);
        success = true;
    }

     // Don't accept ETH
    function () external payable {
        revert("Contract cannot accept Ether");
    }

    // Owner can transfer out any accidentally sent ERC20 tokens
    function transferAnyERC20Token(address tokenAddress, uint tokens) public onlyOwner returns (bool success) {
        return MessagedERC1404(tokenAddress).transfer(owner(), tokens);
    }
}

