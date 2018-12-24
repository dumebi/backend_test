pragma solidity ^0.5.0;
pragma experimental SMTChecker;
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
            require(shareHolders[msg.sender].isEnabled, "You are not authorized on this platform");
        _;
        }
    }
    

    event NewSitHolder(address indexed __holder, bool indexed __holderAccess);
    event SitHolderEnabled(address indexed __holder);
    event SitHolderDisabled(address indexed __holder);

    struct Lien {
        uint amount;
        uint startDate;
        uint endDate;
        bool isLienComplete;
    }

    struct SitBalance {
        uint tradable;
        Lien[] liens;
        uint allocated;
        uint vesting;
    }

    struct SitHolder {
        bool isEnabled;
        bytes32 beneficiary; //Incase of death, users SIT will be transfered
        SitBalance balances;
        bool uniqueHolder;
    }
    
    // Token Info
    string public symbol;
    string public name;
    uint8 public decimals = 18;
    uint256 _totalSupply;
    uint256 internal maxTotalSupply;
    mapping (address => uint256) balances;
    mapping (address => mapping (address => uint256)) allowed;
    mapping(address => SitHolder) shareHolders; // Address can be in any of the 4 cat of SIT


    constructor (string memory _symbol, string memory _name, uint _total, uint _maxSupply) public {
        symbol = _symbol;
        name = _name;
        _totalSupply = _total;
        maxTotalSupply = _maxSupply;
        balances[owner()] = _totalSupply;
        activeSchedule = false;
    } 
    
    function setMaxSupply(uint _maxTotalSupply) public onlyOwner returns (bool) {
        maxTotalSupply = _maxTotalSupply;
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

        SitHolderBalance(_holder);
    }
    
    function SitHolderBalance(address _holder) public view  returns (uint tradable, uint allocated, uint vesting, uint liens) {

        return (shareHolders[_holder].balances.tradable, shareHolders[_holder].balances.allocated, shareHolders[_holder].balances.vesting, shareHolders[_holder].balances.liens.length);
    }
    
    function SitHolderLienBalance(address _holder, uint _index) public view  returns (uint _lienAmt, bool _lienStatus) {

        return (shareHolders[_holder].balances.liens[_index].amount, shareHolders[_holder].balances.liens[_index].isLienComplete);
    }

    function transfer(address _to, uint256 _amount) public onlyValidShareHolder returns (bool) {

        bool isVerified = verifyTransfer(msg.sender, _to);
        require(isVerified, "This transaction is not verified, please ensure both the sender and receiver are both verrified on this platform");

        require(shareHolders[msg.sender].balances.tradable >= _amount, "You do not have sufficient balance for this transaction");

        if (_amount <= 0 && shareHolders[_to].balances.tradable + _amount <= shareHolders[_to].balances.tradable) {
            return false;
        }

        shareHolders[msg.sender].balances.tradable = SafeMath.sub(shareHolders[msg.sender].balances.tradable,_amount);
        shareHolders[_to].balances.tradable= SafeMath.add(shareHolders[_to].balances.tradable,_amount);
        emit Transfer(msg.sender, _to, _amount);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _amount) public onlyValidShareHolder returns (bool) {
        
        bool isVerified = verifyTransfer(msg.sender, _to);
        require(isVerified, "This transaction is not verified, please ensure both the sender and receiver are both verrified on this platform");

        if (shareHolders[_from].balances.tradable < _amount || allowed[_from][msg.sender] < _amount || _amount <= 0 || shareHolders[_to].balances.tradable + _amount <=shareHolders[_to].balances.tradable) {
            return false;
        }
       
        shareHolders[_from].balances.tradable = SafeMath.sub(balances[_from],_amount);
        allowed[_from][msg.sender] = SafeMath.sub(allowed[_from][msg.sender],_amount);
        shareHolders[_to].balances.tradable = SafeMath.add(shareHolders[_to].balances.tradable,_amount);
        emit Transfer(_from, _to, _amount);
        return true;
    }

    function verifyTransfer(address _from, address _to) public view returns (bool){
        
        if (_from != owner()) {

            if (!shareHolders[_from].isEnabled && !shareHolders[_to].isEnabled) {
                return false;
            } 
            
            return true;
        
        } else {
            
            if (!shareHolders[_to].isEnabled) {
                return false;
            } 

            return true;
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
    function addShareHolder(address _holder, bool _holderAccess, string memory _beneficiary, uint _tadableBal, uint _allocatedBal, uint _vestingBal) public onlyOwner { 
        
        require(shareHolders[_holder].uniqueHolder, "Shareholder already added before!");

        SitBalance memory _holderBalance = SitBalance(_tadableBal, shareHolders[_holder].balances.liens, _allocatedBal, _vestingBal);
        SitHolder memory _holderInfo = SitHolder(_holderAccess, keccak256(abi.encodeWithSignature("SIT APPROVED", _holder, _beneficiary)), _holderBalance, true);
        shareHolders[_holder] = _holderInfo;
        
        emit NewSitHolder(_holder, _holderAccess);
    }
    
    function enableHolder(address _holder) public onlyOwner returns (bool) {
        shareHolders[_holder].isEnabled = true;
        emit SitHolderEnabled(_holder);
        return true;
    }

    function disableHolder(address _holder) public onlyOwner returns (bool) {
        shareHolders[_holder].isEnabled = false;
        emit SitHolderDisabled(_holder);
        return true;
    }

}