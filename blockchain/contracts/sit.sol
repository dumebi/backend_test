pragma solidity ^0.5.0;
// pragma experimental SMTChecker;
// pragma experimental ABIEncoderV2;

import "./erc20Interface.sol";
import "./owner.sol";
import "./authorizer.sol";
import "./safeMath.sol";

contract SIT is ERC20Interface, Ownable, Authorizer {

    using SafeMath for uint256;
    
    function stringsEqual(string memory _a, string memory _b) pure internal returns (bool) {
        return keccak256(abi.encode(_a)) == keccak256(abi.encode(_b));
	}

    function random() public view returns (uint8) {
        return uint8(uint256(keccak256(abi.encode(msg.sender, now, block.difficulty)))%251);
    }

    modifier onlyValidShareHolder() {
        if (msg.sender != owner()) {
            require(sitHolders[msg.sender].isEnabled, "You are not authorized for this transaction.");
            _;
        }
        _;
    }
    

    event NewSitHolder(address indexed __holder, bool indexed __holderAccess);
    event SitHolderEnabled(address indexed __holder);
    event SitHolderDisabled(address indexed __holder);
    event NewTradable(address indexed _from, address indexed _to, uint _amount, uint indexed _date);
    event NewAllocated(address _from, address indexed _to, uint _amount, uint indexed _dateGiven, uint indexed _dueDate);
    event NewVesting(address _from, address indexed _to, uint _amount, uint indexed _date);
    event NewLien(address _from, address indexed _to, uint _amount, uint indexed _startDate, uint indexed _lienPeriod);
    event Maxsupply(uint _amount);
    
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

    struct SitBalance {
        uint tradable;
        uint allocated;
        uint vesting;
        uint lien;
    }

    struct SitHolderInfo {
        bool uniqueHolder;
        bool isEnabled;
        bytes32 beneficiary; //Incase of death, users SIT will be transfered
        SitBalance balances;
    }
    
    mapping(address => Tradable[]) public tradables;
    mapping(address => Lien[]) public liens;
    mapping(address => Allocated[]) public allocations;
    mapping(address => Vesting[]) public vestings;
    
    // Token Info
    string public symbol;
    string public name;
    uint8 public decimals = 18;
    uint256 _totalSupply;
    uint256 internal maxTotalSupply;
    mapping (address => uint256) balances;
    mapping (address => mapping (address => uint256)) allowed;
    mapping(address => SitHolderInfo) sitHolders; // Address can be in any of the 4 cat of SIT


    constructor (string memory _symbol, string memory _name, uint _total, uint _maxSupply) public {
        symbol = _symbol;
        name = _name;
        _totalSupply = _total;
        maxTotalSupply = _maxSupply;
        balances[owner()] = _totalSupply;
    } 
    
    function setMaxSupply(uint _maxTotalSupply) public onlyOwner returns (bool) {
        require(_maxTotalSupply >= _totalSupply, "Maximum total supply cannot be less than total supply");
        maxTotalSupply = _maxTotalSupply;
        emit Maxsupply(_maxTotalSupply);
        return true;
    }

    function getMaxSupply() public view onlyOwner returns (uint) {
        return maxTotalSupply;
    }

    function totalSupply() public view  returns (uint256) {
        return _totalSupply;
    }
    

    function balanceOf(address _holder) public view  returns (uint) {
        
        if (_holder == owner()) {
            
            return balances[_holder];

        }

        uint tradable;
        (tradable,,,) = SitHolderBalance(_holder);
        return tradable;
    }
    
    function SitHolderBalance(address _holder) public view  returns (uint _tradable, uint _allocated, uint _inVesting, uint _onLien) {

        return (sitHolders[_holder].balances.tradable, sitHolders[_holder].balances.allocated, sitHolders[_holder].balances.vesting, sitHolders[_holder].balances.lien);
    }
  
    function transfer(address _to, uint256 _amount) public onlyValidShareHolder returns (bool success) {

        bool isVerified = verifyTransfer(msg.sender, _to);
        require(isVerified == true, "Transaction not authorized! Please ensure both the sender and receiver are both verrified on this platform");
        
        if (msg.sender == owner()) {
            
            require(balances[owner()] >= _amount, "You do not have sufficient balance for this transaction");

            if (_amount <= 0 && sitHolders[_to].balances.tradable + _amount <= sitHolders[_to].balances.tradable) {
                return false;
            }
    
            balances[owner()] = SafeMath.sub(balances[owner()] ,_amount);
            sitHolders[_to].balances.tradable= SafeMath.add(sitHolders[_to].balances.tradable,_amount);
            emit Transfer(msg.sender, _to, _amount);
            _addToTradable(_to, _amount, now);
            return true;
        }

        require(sitHolders[msg.sender].balances.tradable >= _amount, "You do not have sufficient balance for this transaction");

        if (_amount <= 0 && sitHolders[_to].balances.tradable + _amount <= sitHolders[_to].balances.tradable) {
            return false;
        }

        sitHolders[msg.sender].balances.tradable = SafeMath.sub(sitHolders[msg.sender].balances.tradable,_amount);
        sitHolders[_to].balances.tradable= SafeMath.add(sitHolders[_to].balances.tradable,_amount);
        emit Transfer(msg.sender, _to, _amount);
        _addToTradable(_to, _amount, now);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _amount) public onlyValidShareHolder returns (bool success) {
        
        bool isVerified = verifyTransfer(msg.sender, _to);
        require(isVerified, "This transaction is not verified, please ensure both the sender and receiver are both verrified on this platform");

        if (_from == owner()) {
            
            if (balances[_from] < _amount || allowed[_from][msg.sender] < _amount || _amount <= 0 || sitHolders[_to].balances.tradable + _amount <=sitHolders[_to].balances.tradable) {
                return false;
            }
       
            balances[_from] = SafeMath.sub(balances[_from],_amount);
            allowed[_from][msg.sender] = SafeMath.sub(allowed[_from][msg.sender],_amount);
            sitHolders[_to].balances.tradable = SafeMath.add(sitHolders[_to].balances.tradable,_amount);
            emit Transfer(msg.sender, _to, _amount);                                                                                                                                                                                                                                                                                                                                                                                                                                                
            _addToTradable(_to, _amount, now);
            return true;
        }
        
        require(sitHolders[_from].balances.tradable < _amount, "Owner does not have sufficient balance to spend from, try reducing the amount to spend");
        require(allowed[_from][msg.sender] <= _amount, "Owner does not have sufficient balance to spend from, try reducing the amount to spend");
        
        if (_amount <= 0 || sitHolders[_to].balances.tradable + _amount <=sitHolders[_to].balances.tradable) {
            return false;
        }
       
        sitHolders[_from].balances.tradable = SafeMath.sub(balances[_from],_amount);
        allowed[_from][msg.sender] = SafeMath.sub(allowed[_from][msg.sender],_amount);
        sitHolders[_to].balances.tradable = SafeMath.add(sitHolders[_to].balances.tradable,_amount);
        emit Transfer(msg.sender, _to, _amount);
        _addToTradable(_to, _amount, now);
        return true;
    }

    function verifyTransfer(address _from, address _to) public view returns (bool success){
        
        if (_from != owner()) {

            if (sitHolders[_from].isEnabled == true && sitHolders[_to].isEnabled == true) {
                return true;
            } 
            
            return false;
        
        } else {
            
            return sitHolders[_to].isEnabled;
        }
        
        
    }

    // Allow _spender to withdraw from your account, multiple times, up to the _value amount.
    // If this function is called again it overwrites the current allowance with _value.
    function approve(address _spender, uint256 _amount) public returns (bool success) {
        allowed[msg.sender][_spender] = _amount;
        emit Approval(msg.sender, _spender, _amount);
        return true;
    }

    function allowance(address _owner, address _spender) public view  returns (uint256 remaining) {
        return allowed[_owner][_spender];
    }
    
    // Adds a to the platform
    function addSitHolder(address _holder, bool _holderAccess, bytes32 _beneficiary, uint _tadableBal, uint _allocatedBal, uint _vestingBal, uint _lienBal) public onlyOwner returns(bool success) { 
        require(sitHolders[_holder].uniqueHolder == false, "Shareholder already added before!");

        if (_tadableBal > 0) {
            require(balances[msg.sender] >= _tadableBal, "Insufficient balance for transfer to new account");
            balances[msg.sender] = SafeMath.sub(balances[msg.sender], _tadableBal);
            _addToTradable(_holder, _tadableBal, now);
        }
        
        if (_allocatedBal > 0) {
            require(balances[msg.sender] >= _allocatedBal, "Insufficient balance for transfer to new account");
            balances[msg.sender] = SafeMath.sub(balances[msg.sender], _allocatedBal);
            _addToAllocated(_holder, _allocatedBal, now, now);
        }
        
        if (_vestingBal > 0) {
            require(balances[msg.sender] >= _vestingBal, "Insufficient balance for transfer to new account");
            balances[msg.sender] = SafeMath.sub(balances[msg.sender], _vestingBal);
            _addToVesting(_holder, _vestingBal, now);
        }
        
        if (_lienBal > 0) {
            
        }
        
        SitBalance memory _holderBalance = SitBalance(_tadableBal, _allocatedBal, _vestingBal, _lienBal);

        SitHolderInfo memory _holderInfo = SitHolderInfo(true, _holderAccess, _beneficiary, _holderBalance);
        sitHolders[_holder] = _holderInfo;
        
        emit NewSitHolder(_holder, _holderAccess);
        
        return true;
    }
    
    function getSitHolder(address _holder) view public returns(bool _isEnabled, bytes32 _beneficiary,uint _tradable, uint _allocated, uint _vesting, uint _lien ) { 
        
        return (sitHolders[_holder].isEnabled, sitHolders[_holder].beneficiary, sitHolders[_holder].balances.tradable, sitHolders[_holder].balances.allocated, sitHolders[_holder].balances.vesting, sitHolders[_holder].balances.lien);
        
    }
    
    function updateHolderAccess(address _holder, bool access) public onlyOwner returns (bool success) {
        sitHolders[_holder].isEnabled = access;
        if (access) {
            emit SitHolderEnabled(_holder);
        } else {
            emit SitHolderDisabled(_holder);
        }
        return true;
    }

    function isValidSitHolder(address _holder) view public returns (bool success) {
        return sitHolders[_holder].isEnabled;
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
    
    function addToTradable (address _holder, uint _amount) public onlyOwner returns(bool success) {
        require(balances[msg.sender] >= _amount, "Insufficient balance for transfer to holder's tradable account");
        balances[msg.sender] = SafeMath.sub(balances[msg.sender], _amount);
        sitHolders[_holder].balances.tradable = SafeMath.add(sitHolders[_holder].balances.tradable , _amount);
        _addToTradable(_holder, _amount, now);
    }
    
    function addToVesting (address _holder, uint _amount) public onlyOwner returns(bool success) {
        require(balances[msg.sender] >= _amount, "Insufficient balance for transfer to holder's tradable account");
        balances[msg.sender] = SafeMath.sub(balances[msg.sender], _amount);
        sitHolders[_holder].balances.vesting = SafeMath.add(sitHolders[_holder].balances.vesting , _amount);
        _addToVesting(_holder, _amount, now);
    }

    function addToAllocated (address _holder, uint _amount, uint _dueDate) public onlyOwner returns(bool success) {
        require(balances[msg.sender] >= _amount, "Insufficient balance for transfer to holder's tradable account");
        balances[msg.sender] = SafeMath.sub(balances[msg.sender], _amount);
        sitHolders[_holder].balances.allocated = SafeMath.add(sitHolders[_holder].balances.allocated , _amount);
        _addToAllocated(_holder, _amount, now, _dueDate);
    }
    
    function addToLien (address _holder, uint _amount, uint _dateStarted, uint _lienPeriod) public onlyOwner returns(bool success) {
        require(balances[msg.sender] >= _amount, "Insufficient balance for transfer to holder lien account");
        balances[msg.sender] = SafeMath.sub(balances[msg.sender], _amount);
        sitHolders[_holder].balances.lien = SafeMath.add(sitHolders[_holder].balances.lien , _amount);
        _addToLien(_holder, _amount, now, _dateStarted, _lienPeriod);
    }
}