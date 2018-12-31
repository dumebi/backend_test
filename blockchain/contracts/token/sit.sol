pragma solidity ^0.5.0;
// pragma experimental SMTChecker;
// pragma experimental ABIEncoderV2;

import "./erc20Interface.sol";
import "../common/owner.sol";
import "../common/authorizer.sol";
import "../library/safeMath.sol";

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
    event Maxsupply(uint _amount);
    
    struct Lien {
        uint amount;
        uint startDate;
        uint endDate;
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
  
    function transfer(address _to, uint256 _amount) public onlyValidShareHolder returns (bool) {

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
            addtoTradable(_to, _amount, now);
            return true;
        }

        require(sitHolders[msg.sender].balances.tradable >= _amount, "You do not have sufficient balance for this transaction");

        if (_amount <= 0 && sitHolders[_to].balances.tradable + _amount <= sitHolders[_to].balances.tradable) {
            return false;
        }

        sitHolders[msg.sender].balances.tradable = SafeMath.sub(sitHolders[msg.sender].balances.tradable,_amount);
        sitHolders[_to].balances.tradable= SafeMath.add(sitHolders[_to].balances.tradable,_amount);
        emit Transfer(msg.sender, _to, _amount);
        addtoTradable(_to, _amount, now);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _amount) public onlyValidShareHolder returns (bool) {
        
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
            addtoTradable(_to, _amount, now);
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
        addtoTradable(_to, _amount, now);
        return true;
    }

    function verifyTransfer(address _from, address _to) public view returns (bool){
        
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
     
    function addtoTradable (address _holder, uint _amount, uint _dateAdded) internal returns(bool) {
        tradables[_holder].push(Tradable(_amount, _dateAdded));
        emit NewTradable(msg.sender, _holder, _amount, _dateAdded);
        return true;
    }
    
    // Adds a to the platform
    function addSitHolder(address _holder, bool _holderAccess, string memory _beneficiary, uint _tadableBal, uint _allocatedBal, uint _vestingBal, uint _lienBal) public onlyOwner { 
        require(sitHolders[_holder].uniqueHolder == false, "Shareholder already added before!");

        SitBalance memory _holderBalance = SitBalance(_tadableBal, _allocatedBal, _vestingBal, _lienBal);

        SitHolderInfo memory _holderInfo = SitHolderInfo(true, _holderAccess, keccak256(abi.encodeWithSignature("SIT APPROVED", _holder, _beneficiary)), _holderBalance);
        sitHolders[_holder] = _holderInfo;
        
        emit NewSitHolder(_holder, _holderAccess);
    }
    
    function getSitHolder(address _holder) view public onlyOwner returns(bool _isEnabled, bytes32 _beneficiary,uint _tradable, uint _allocated, uint _vesting, uint _lien ) { 
        
        return (sitHolders[_holder].isEnabled, sitHolders[_holder].beneficiary, sitHolders[_holder].balances.tradable, sitHolders[_holder].balances.allocated, sitHolders[_holder].balances.vesting, sitHolders[_holder].balances.lien);
        
    }
    
    function enableHolder(address _holder) public onlyOwner returns (bool) {
        sitHolders[_holder].isEnabled = true;
        emit SitHolderEnabled(_holder);
        return true;
    }

    function disableHolder(address _holder) public onlyOwner returns (bool) {
        sitHolders[_holder].isEnabled = false;
        emit SitHolderDisabled(_holder);
        return true;
    }
    
    function isValidSitHolder(address _holder) view public returns (bool) {
        return sitHolders[_holder].isEnabled;
    }

}