pragma solidity ^0.5.0;
// pragma experimental SMTChecker;

import "./erc20Interface.sol";
import "./owner.sol";
import "./authorizer.sol";
import "./safeMath.sol";

contract SIT is ERC20Interface, Ownable, Authorizer {

    using SafeMath for uint256;
    
    function stringsEqual(string memory _a, string memory _b) pure internal returns (bool) {
        
        return keccak256(abi.encode(_a)) == keccak256(abi.encode(_b));
// 		bytes memory a = bytes(_a);
// 		bytes memory b = bytes(_b);
// 		if (a.length != b.length)
// 			return false;
			
// 		for (uint i = 0; i < a.length; i ++)
// 			if (a[i] != b[i])
// 				return false;
// 		return true;
	}
	 function random() public view returns (uint8) {
        return uint8(uint256(keccak256(abi.encode(msg.sender, now, block.difficulty)))%251);
    }

    event NewUser(address indexed _user, string indexed _accessLevel);
    event ApproveRequest(byte _requestId, address _authorizer, string _reason); //Emit the authorizer's address that vote for approval
    event RejectRequest(byte _requestId, address _authorizer, string _reason); //Emit the authorizer's address that vote for rejection
    event SitToLien(address _user, uint _amount, uint _lienIndex);// Emit the accounts whose SITs are still inLien trade their SITs
    event Allocated(address _user, uint _amount);// Emit the accounts whose SITs are still inLien trade their SITs
    event Vesting(address _user, uint _amount);// Emit the accounts whose SITs are still inLien trade their SITs
    event MontlyAllocation(address indexed _recipient, uint _amount, string indexed _, uint _lienIndex);
    event Withdrawn(address _user, uint _amount, string _sitCat);
    event MovedForTrading(address _user, uint _amount, string _sitCat);
    event ExchangeRate(uint _min, uint _max);

    struct Offering {
        uint price;
        uint amount;
    }

    struct Lien {
        uint amount;
        uint startDate;
        uint endDate;
    }

    struct User {
        address userAddr;
    }

    struct Rate {
        uint minimum;
        uint maximum;
    }
    
    struct Request {
        uint _amount;
        address _authorizer;
        bool _isApproved;
    }


    // Token Info
    string public symbol;
    string public name;
    uint8 public decimals = 18;
    uint256 _totalSupply;
    uint256 internal maxTotalSupply;
    mapping (address => uint256) balances;
    mapping (address => mapping (address => uint256)) allowed;
    bool activeRequest;
    bool canMint;
    mapping(byte => Request) private requestGenerated; // Mapps the request id to the amount to be generatde
    mapping(address => Lien[]) public liens;
    mapping(address => uint) public allocated;
    mapping(address => uint) public vesting;
    
    // Exchange Info
    uint transferLimit; //xchange
    Rate public exchangeRate;
    User[] public users;
    mapping(address => uint) userId; // Address can be in any of the 4 cat of SIT
    mapping(address => address) beneficiary; //Incase of death, users SIT will be transfered 
    mapping(address => bool) public enabledUsers; // xchange
    mapping(address => Offering[]) UserToSitForSale; //maps users who have put up their SIT for sale to an offering; xchange
    Offering[] public offerings;


    constructor (string memory _symbol, string memory _name, uint _total, uint _maxSupply) public {
        symbol = _symbol;
        name = _name;
        _totalSupply = _total;
        maxTotalSupply = _maxSupply;
        balances[owner()] = _totalSupply;
        activeRequest = false;
        canMint = false;
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

    function setRate(uint _min, uint _max) public onlyOwner  {

        require(_max >= _min, "Maximum exchange rate should not be less than _minimum");
        exchangeRate = Rate(_min, _max);

        emit ExchangeRate(_min, _max);
    }
    
    function mintRequest(address _recipient, uint256 _amount, byte _requestId) public onlyOwner {

        require(canMint == true, "Sorry, minting is not yet authorized");
        require(_recipient == msg.sender && _amount == requestGenerated[_requestId]._amount, "You can only mint the authorized _amount to the owner's account");
        
        mint(_recipient, _amount);
    }

    function mint(address _recipient, uint256 _amount) internal onlyOwner {
        
        require(_totalSupply <= maxTotalSupply, "Cannot mint above the maximum supply"); // Overflow check

        _totalSupply += _amount;
        balances[_recipient] += _amount;
        emit Transfer(address(0), _recipient, _amount);
    }

    function balanceOf(address _owner) public view  returns (uint256) {
        return balances[_owner];
    }

    function transfer(address _to, uint256 _amount) public returns (bool) {

        if (msg.sender != owner()) {
            require(verifyTransfer(msg.sender, _to), "Sorry, you are not enabled for this transaction, please contact HC");
        }

        require(balances[msg.sender] >= _amount, "You do not have sufficient balance for this transaction");

        if (_amount <= 0 && balances[_to] + _amount <= balances[_to]) {
            return false;
        }

        balances[msg.sender] = SafeMath.sub(balances[msg.sender],_amount);
        balances[_to] = SafeMath.add(balances[_to],_amount);
        emit Transfer(msg.sender, _to, _amount);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _amount) public returns (bool) {
        
        if (msg.sender != owner()) {
            require(verifyTransfer(msg.sender, _to), "Sorry, you are not enabled for this transaction, please contact HC");
        }

        if (balances[_from] >= _amount && allowed[_from][msg.sender] >= _amount && _amount > 0 && balances[_to] + _amount > balances[_to]) {

            balances[_from] = SafeMath.sub(balances[_from],_amount);
            allowed[_from][msg.sender] = SafeMath.sub(allowed[_from][msg.sender],_amount);
            balances[_to] = SafeMath.add(balances[_to],_amount);
            emit Transfer(_from, _to, _amount);
            return true;
        }
        else {
            return false;
        }
    }

    function verifyTransfer(address _from, address _to) public view returns (bool){
        
        if (_from != owner()) {
            if (enabledUsers[_from] && enabledUsers[_to]) {
                return true;
            }
        
            return false;
        } else {
            
            if (enabledUsers[_to]) {
                return true;
            }
        
            return false ;
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
    
    function getRequestValue (byte _requestId) public view onlyAuthorizer returns (uint) {
        return requestGenerated[_requestId]._amount;
    }

    function generateRequest(uint _amount) public onlyOwner returns (byte) {
        
        require(activeRequest == false, "There is an active request awaiting approval");
        require(_totalSupply + _amount >= _totalSupply, "Your request amount would reduces the total supply, make a burn request instead.");
        byte requestId = byte(random());
        requestGenerated[requestId]._amount = _amount;
        activeRequest = true;
        return requestId;
    }

    function authorizeRequest(bool _approval, string memory _reason, byte _requestId) public onlyAuthorizer returns(bool)  {

        require(activeRequest == true, "There is no active request to authorize");

        if (_approval) {
            activeRequest = false;
            canMint = true;
            requestGenerated[_requestId]._authorizer = msg.sender;
            requestGenerated[_requestId]._isApproved = true;
            emit ApproveRequest(_requestId, msg.sender, _reason);
            return true;
            
        } else {
            activeRequest = false;
            canMint = false;
            requestGenerated[_requestId]._authorizer = msg.sender;
            requestGenerated[_requestId]._isApproved = false;
            emit RejectRequest(_requestId, msg.sender, _reason);
            return false;
            
        }

    }
    
    // Adds a to the platform
    function addUser(address _user, string memory accessLevel) public onlyOwner {

        uint _userId = users.push(User(_user));
        userId[_user] = _userId - 1;
        enabledUsers[_user] = (stringsEqual(accessLevel, 'enable'))? true : false;
        
        emit NewUser(_user, accessLevel);
    }

    function addBeneficiaryAddress(address _recipient, address _beneficiaryAddr) public onlyOwner returns (bool) {
        beneficiary[_recipient] = _beneficiaryAddr;
        return true;
    }
    
    function enableUser(address _recipient) public onlyOwner returns (bool) {
        
        enabledUsers[_recipient] = true;
        return true;
    }

    function disableUser(address _recipient) public onlyOwner returns (bool) {
        enabledUsers[_recipient] = false;
        return true;
    }
    
    // Montly distribution of SIT (shares)
    function distribute(address _recipient, uint256 _amount, string memory _sitCat, uint _startDate, uint _endDate) public onlyOwner {

        uint _lienIndex = 0; 

        if (stringsEqual(_sitCat, "allocated")) {
            uint _currentlyAllocated = allocated[_recipient];
            allocated[_recipient] = SafeMath.add(_currentlyAllocated, _amount);
        } else if (stringsEqual(_sitCat, "vesting")) {
            uint _currentlyVesting = vesting[_recipient];
            vesting[_recipient] = SafeMath.add(_currentlyVesting, _amount);
        }else if(stringsEqual(_sitCat, "lien")) {
            _lienIndex = liens[_recipient].push(Lien(_amount,_startDate,_endDate));
        } else if (stringsEqual(_sitCat, "tradable")) {
        
            transfer(_recipient, _amount);

        }

        emit MontlyAllocation(_recipient, _amount, _sitCat, _lienIndex);
    }
    
    // Admin can withhold defaulters SIT
    function withhold(address _recipient, uint256 _amount, string memory  _sitCat, uint _lienIndex) public onlyOwner {
        
        if (stringsEqual(_sitCat, "allocated")) {

            uint currentlyAllocated = allocated[_recipient];
            require(currentlyAllocated >= _amount, "Withdrawal _amount cannot be greater than _recipients actual SIT value" );
            allocated[_recipient] = SafeMath.sub(currentlyAllocated, _amount); // Reduce _recipient's SIT by _amount to withdraw
            balances[owner()] = SafeMath.add(balances[owner()], _amount); // Increase Owner's SIT with the withdrawn _amount

        } else if (stringsEqual(_sitCat, "vesting")) {

            uint currentlyVesting = vesting[_recipient];
            require(currentlyVesting >= _amount, "Withdrawal _amount cannot be greater than _recipients actual SIT value" );
            allocated[_recipient] = SafeMath.sub(currentlyVesting, _amount); // Reduce _recipient's SIT by _amount to withdraw
            balances[owner()] = SafeMath.add(balances[owner()], _amount); // Increase Owner's SIT with the withdrawn _amount

        } else if(stringsEqual(_sitCat, "lien")) {

            Lien memory currentLien = liens[_recipient][_lienIndex];
            require(currentLien.amount >= _amount, "Withdrawal _amount cannot be greater than _recipients actual SIT value" );

            if (currentLien.amount == _amount) {
                delete liens[_recipient][_lienIndex]; // Remove the lien entry if the withdrawn _amount is same as the lien _amount
                uint lastItem = liens[_recipient].length - 1;
                liens[_recipient][_lienIndex] = liens[_recipient][lastItem]; // Replace the blanck space with the last entry
                delete liens[_recipient][lastItem]; // Remove the last entry
            } else {
                currentLien.amount = SafeMath.sub(currentLien.amount, _amount); // Reduce the _amount of SIT in lien by the withdraw _amount
            }

            balances[owner()] = SafeMath.add(balances[owner()], _amount); // Increase Owner's SIT with the withdrawn _amount

        } else if (stringsEqual(_sitCat, "tradable")) {
            
            require(balanceOf(_recipient) >= _amount, "Withdrawal _amount cannot be greater than _recipients actual SIT value" );
            balances[_recipient] = SafeMath.sub(balances[_recipient], _amount);
            balances[owner()] = SafeMath.add(balances[owner()], _amount); // Increase Owner's SIT with the withdrawn _amount

        }

        emit Withdrawn(_recipient, _amount, _sitCat);
    }
    
    // Add SIT to User Lien balance
    function addlien(address _recipient, uint _amount, uint _startDate, uint _endDate) public onlyOwner returns (uint) {
        
        uint lienIndex = liens[_recipient].push(Lien(_amount, _startDate, _endDate)); // adds a new lien entry to the _recipient's array of lien and enmits event
        
        emit SitToLien(_recipient, _amount, lienIndex);
        return lienIndex;
    }
    
    // Add SIT to User allocated balance
    function allocate(address _recipient, uint _amount) public onlyOwner  returns (bool) {
        
        uint currentAllocated = allocated[_recipient]; // adds a new lien entry to the _recipient's array of lien and enmits event
        allocated[_recipient] = SafeMath.add(currentAllocated, _amount);
        
        emit Allocated(_recipient, _amount);
        return true;
    }
    
    // Add SIT to User Vesting balance
    function vestSit(address _recipient, uint _amount) public onlyOwner returns (bool) {
        
        uint currentAllocated = allocated[_recipient]; // adds a new lien entry to the _recipient's array of lien and enmits event
        allocated[_recipient] = SafeMath.add(currentAllocated, _amount);
        
        emit Vesting(_recipient, _amount);
        return true;
    }
    
    // Move user SIT from other balances to the tradable balance
    function moveToTradable (address _recipient, uint _amount, string memory _sitCat, uint _lienIndex) public onlyOwner {

        if (stringsEqual(_sitCat, "allocated")) {

            uint currentlyAllocated = allocated[_recipient];
            require(currentlyAllocated >= _amount, "Amount specified is greater than amount allocated to user" );
            allocated[_recipient] = SafeMath.sub(currentlyAllocated, _amount); // Reduce _recipient's SIT by _amount to withdraw
            balances[owner()] = SafeMath.add(balances[owner()], _amount); // Increase Owner's SIT with the withdrawn _amount

            transfer(_recipient, _amount);

        } else if (stringsEqual(_sitCat, "vesting")) {

            uint currentlyVesting = vesting[_recipient];
            require(currentlyVesting >= _amount, "Amount specified is greater than amount allocated to user" );
            allocated[_recipient] = SafeMath.sub(currentlyVesting, _amount); // Reduce _recipient's SIT by _amount to withdraw
            balances[owner()] = SafeMath.add(balances[owner()], _amount); // Increase Owner's SIT with the withdrawn _amount

            transfer(_recipient, _amount);

        } else if(stringsEqual(_sitCat, "lien")) {

            Lien memory currentLien = liens[_recipient][_lienIndex];
            require(currentLien.amount >= _amount, "Amount specified is greater than amount allocated to user" );

            if (currentLien.amount == _amount) {
                delete liens[_recipient][_lienIndex]; // Remove the lien entry if the withdrawn amount is same as the lien amount
                uint lastItem = liens[_recipient].length - 1;
                liens[_recipient][_lienIndex] = liens[_recipient][lastItem]; // Replace the blanck space with the last entry
                delete liens[_recipient][lastItem]; // Remove the last entry
            } else {
                currentLien.amount = SafeMath.sub(currentLien.amount, _amount); // Reduce the amount of SIT in lien by the withdraw amount
            }

            balances[owner()] = SafeMath.add(balances[owner()], _amount); // Increase Owner's SIT with the withdrawn amount
            transfer(_recipient, _amount);

            emit MovedForTrading(_recipient, _amount, _sitCat);

        }

    }

}












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
        _;
    }
    

    event NewSitHolder(address indexed __holder, bool indexed __holderAccess);
    event ScheduleApproved(byte _requestId, address _authorizer, string _reason); //Emit the authorizer's address that vote for approval
    event ScheduleRejected(byte _requestId, address _authorizer, string _reason); //Emit the authorizer's address that vote for rejection
    event SitToLien(address indexed __holder, uint _amount, uint _lienIndex);// Emit the accounts whose SITs are still inLien trade their SITs
    event Allocated(address _user, uint _amount);// Emit the accounts whose SITs are still inLien trade their SITs
    event Vesting(address _user, uint _amount);// Emit the accounts whose SITs are still inLien trade their SITs
    event MontlyAllocation(address indexed __holder, uint _amount, string indexed __lienBals, uint _lienIndex);
    event OnHold(address indexed _user, uint _amount, string indexed _sitCat);
    event MovedForTrading(address indexed __holder, uint __amount, string indexed __sitCat, uint __currentTradable);
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

    struct Schedule {
        uint _amount;
        address[] _authorizers;
        bool _isApproved;
        bool _isRejected;
    }
    bool activeSchedule;
    mapping(byte => Schedule) private schedules; // Mapps the request id to the amount to be generatde

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

        return shareHolders[_holder].balances.tradable;
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
    function approve(address _spender, uint256 _amount) public returns (bool) {
        allowed[msg.sender][_spender] = _amount;
        emit Approval(msg.sender, _spender, _amount);
        return true;
    }

    function allowance(address _owner, address _spender) public view  returns (uint256) {
        return allowed[_owner][_spender];
    }
    
    function getRequestValue (byte _requestId) public view onlyAuthorizer returns (uint) {
        return schedules[_requestId]._amount;
    }

    function generateSchedule(uint _amount) public onlyOwner returns (byte) {
        
        require(activeSchedule == false, "There is an active request awaiting approval");
        require(_totalSupply + _amount >= _totalSupply, "Please specify a valid amount");
        byte requestId = byte(random());
        schedules[requestId]._amount = _amount;
        activeSchedule = true;
        return requestId;
    }

    function authorizeSchedule(bool _approval, string memory _reason, byte _requestId) public onlyAuthorizer returns(bool)  {

        require(activeSchedule == true, "There is no active request to authorize");

        if (_approval) {
            activeSchedule = false;
            schedules[_requestId]._authorizers.push(msg.sender);
            schedules[_requestId]._isApproved = true;
            emit ScheduleApproved(_requestId, msg.sender, _reason);
            return true;
            
        } else {
            activeSchedule = false;
            schedules[_requestId]._authorizers.push(msg.sender);
            schedules[_requestId]._isApproved = false;
            emit ScheduleRejected(_requestId, msg.sender, _reason);
            return false;
            
        }

    }
    
    // Adds a to the platform
    function addShareHolder(address _holder, bool _holderAccess, string memory _beneficiary, uint _tadableBal, uint _allocatedBal, uint _vestingBal) public onlyOwner { 
        
        require(shareHolders[_holder].uniqueHolder, "Shareholder already added before!");

        SitBalance memory _holderBalance = SitBalance(_tadableBal, shareHolders[_holder].balances.liens, _allocatedBal, _vestingBal);
        SitHolder memory _holderInfo = SitHolder(_holderAccess, keccak256(abi.encodeWithSignature("SIT APPROVED", _holder, _beneficiary)), _holderBalance, true);
        shareHolders[_holder] = _holderInfo;
        
        emit NewSitHolder(_holder, _holderAccess);
    }

    function updateBeneficiary(bytes32 _beneficiary) public onlyValidShareHolder returns (bool) {
        shareHolders[msg.sender].beneficiary = _beneficiary;
        return true;
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
    
    // Montly distribution of SIT (shares)
    function distribute(address _holder, uint256 _amount, string memory _sitBal, uint _startDate, uint _endDate) public onlyOwner {

        uint _lienIndex = 0; 

        if (stringsEqual(_sitBal, "allocated")) {
            uint _currentlyAllocated = shareHolders[_holder].balances.allocated;
            shareHolders[_holder].balances.allocated = SafeMath.add(_currentlyAllocated, _amount);
        } else if (stringsEqual(_sitBal, "vesting")) {
            uint _currentlyVesting = shareHolders[_holder].balances.vesting;
            shareHolders[_holder].balances.vesting = SafeMath.add(_currentlyVesting, _amount);
        }else if(stringsEqual(_sitBal, "lien")) {
            _lienIndex = shareHolders[_holder].balances.liens.push(Lien(_amount,_startDate,_endDate,false));
        } else if (stringsEqual(_sitBal, "tradable")) {
        
            transfer(_holder, _amount);

        }

        emit MontlyAllocation(_holder, _amount, _sitBal, _lienIndex - 1);
    }
    
    // Admin can withhold defaulters SIT
    function withhold(address _holder, uint256 _amount, string memory  _sitCat, uint _lienIndex) public onlyOwner {
        
        if (stringsEqual(_sitCat, "allocated")) {

            uint currentlyAllocated = shareHolders[_holder].balances.allocated;
            require(currentlyAllocated >= _amount, "Withhold _amount cannot be greater than _recipients actual SIT value" );
            shareHolders[_holder].balances.allocated = SafeMath.sub(currentlyAllocated, _amount); // Reduce _recipient's SIT by _amount to withdraw
            balances[owner()] = SafeMath.add(balances[owner()], _amount); // Increase Owner's SIT with the withdrawn _amount

        } else if (stringsEqual(_sitCat, "vesting")) {

            uint currentlyVesting = shareHolders[_holder].balances.vesting;
            require(currentlyVesting >= _amount, "Withhold _amount cannot be greater than _recipients actual SIT value" );
            shareHolders[_holder].balances.vesting = SafeMath.sub(currentlyVesting, _amount); // Reduce _recipient's SIT by _amount to withdraw
            balances[owner()] = SafeMath.add(balances[owner()], _amount); // Increase Owner's SIT with the withdrawn _amount

        } else if(stringsEqual(_sitCat, "lien")) {

            Lien memory currentLien = shareHolders[_holder].balances.liens[_lienIndex];
            require(currentLien.amount >= _amount, "Withhold_amount cannot be greater than _recipients actual SIT value" );

            shareHolders[_holder].balances.liens[_lienIndex].isLienComplete = true; // Replace the blanck space with the last entry

            balances[owner()] = SafeMath.add(balances[owner()], _amount); // Increase Owner's SIT with the withdrawn _amount

        } else if (stringsEqual(_sitCat, "tradable")) {
            
            uint currentlyTradable = shareHolders[_holder].balances.tradable;
            require(currentlyTradable >= _amount, "Withhold _amount cannot be greater than _recipients actual SIT value" );
            shareHolders[_holder].balances.tradable = SafeMath.sub(currentlyTradable, _amount);
            balances[owner()] = SafeMath.add(balances[owner()], _amount); // Increase Owner's SIT with the withdrawn _amount

        }

        emit OnHold(_holder, _amount, _sitCat);
    }
    
    // Add SIT to User Lien balance
    function addlien(address _holder, uint _amount, uint _startDate, uint _endDate) public onlyOwner returns (uint) {
        
        uint lienIndex = shareHolders[_holder].balances.liens.push(Lien(_amount,_startDate,_endDate,false)); // adds a new lien entry to the _holder's array of lien and enmits event
        
        emit SitToLien(_holder, _amount, lienIndex);
        return lienIndex;
    }
    
    // Add SIT to User allocated balance
    function allocate(address _holder, uint _amount) public onlyOwner  returns (bool) {
        
        uint currentAllocated = shareHolders[_holder].balances.allocated; // adds a new lien entry to the _holder's array of lien and enmits event
        shareHolders[_holder].balances.allocated = SafeMath.add(currentAllocated, _amount);
        
        emit Allocated(_holder, _amount);
        return true;
    }
    
    // Add SIT to User Vesting balance
    function vestSit(address _holder, uint _amount) public onlyOwner returns (bool) {
        
        uint currentVesting = shareHolders[_holder].balances.vesting; // adds a new lien entry to the _holder's array of lien and enmits event
        shareHolders[_holder].balances.vesting = SafeMath.add(currentVesting, _amount);
        
        emit Vesting(_holder, _amount);
        return true;
    }
    
    // Move user SIT from other balances to the tradable balance
    function moveToTradable (address _holder, uint _amount, string memory _sitCat, uint _lienIndex) public onlyOwner {
        
        uint _curentTradable = 0;

        if (stringsEqual(_sitCat, "allocated")) {

            uint currentlyAllocated = shareHolders[_holder].balances.allocated;
            require(currentlyAllocated >= _amount, "Amount specified is greater than amount allocated to holder" );
            shareHolders[_holder].balances.allocated = SafeMath.sub(currentlyAllocated, _amount); // Reduce _holder's SIT by _amount to withdraw
            _curentTradable = SafeMath.add(shareHolders[_holder].balances.tradable, _amount); // Increase holder's tradable SIT with the withdrawn _amount

        } else if (stringsEqual(_sitCat, "vesting")) {

            uint currentlyVesting = shareHolders[_holder].balances.vesting;
            require(currentlyVesting >= _amount, "Amount specified is greater than the holder's current vesting amount" );
            shareHolders[_holder].balances.vesting = SafeMath.sub(currentlyVesting, _amount); // Reduce _holder's SIT by _amount to withdraw
            _curentTradable = SafeMath.add(shareHolders[_holder].balances.tradable, _amount); // Increase holder's tradable SIT with the withdrawn _amount

        } else if(stringsEqual(_sitCat, "lien")) {

            Lien memory currentLien = shareHolders[_holder].balances.liens[_lienIndex];
            require(currentLien.amount >= _amount, "Amount specified is greater than the holder's current lien amount" );
            shareHolders[_holder].balances.liens[_lienIndex].isLienComplete = true; 
            _curentTradable = SafeMath.add(shareHolders[_holder].balances.tradable, _amount); // Increase holder's tradable SIT with the withdrawn _amount

        }

        emit MovedForTrading(_holder, _amount, _sitCat, _curentTradable);

    }

}