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

    event NewUser(address user, bool accessLevel);
    event ApproveRequest(address _authorizer, uint _count,  string _reason); //Emit the authorizer's address that vote for approval
    event RejectRequest(address _authorizer, uint _count,  string _reason); //Emit the authorizer's address that vote for rejection
    event Authorized(uint _authorizedAmount, uint _rejectCount, uint _approveCount); // Emit the rejected vote count
    event Rejected(uint _authorizedAmount, uint _rejectCount, uint _approveCount);// Emit the approve vote count 
    event SitToLien(address user, uint amount, uint lienIndex);// Emit the accounts whose SITs are still inLien trade their SITs
    event Allocated(address user, uint amount);// Emit the accounts whose SITs are still inLien trade their SITs
    event Vesting(address user, uint amount);// Emit the accounts whose SITs are still inLien trade their SITs
    event Distributed(address recipient, uint amount, string sitCat, uint lienIndex);
    event Withdrawn(address user, uint amount, string sitCat);
    event MovedForTrading(address user, uint amount, string sitCat);
    event ExchangeRate(uint min, uint max);

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

    Rate public exchangeRate;

    User[] public users;
    Offering[] public offerings;

    mapping(address => bool) public enabledUsers; // xchange
    mapping(address => Offering[]) UserToSitForSale; //maps users who have put up their SIT for sale to an offering; xchange
    mapping(address => address) beneficiary; //Incase of death, users SIT will be transfered 
    mapping(address => Lien[]) public liens;

    mapping(address => uint) userId; // Address can be in any of the 4 cat of SIT

    mapping(address => Lien[]) public onlien;
    mapping(address => uint) public allocated;
    mapping(address => uint) public vesting;


    string public symbol;
    string public name;
    uint8 public decimals = 18;
    uint256 _totalSupply;
    uint256 internal maxTotalSupply;
    mapping (address => uint256) balances;
    mapping (address => mapping (address => uint256)) allowed;

    uint transferLimit; //xchange
    uint private SITForDistribution;
    uint approveCount;
    uint rejectCount;
    bool activeRequest;
    bool canMint;


    constructor (string memory _symbol, string memory _name, uint _total, uint _maxSupply) public {
        symbol = _symbol;
        name = _name;
        _totalSupply = _total;
        maxTotalSupply = _maxSupply;
        balances[owner()] = _totalSupply;
        activeRequest = false;
        canMint = false;
    }

    function mint(address _recipient, uint256 _amount) public onlyOwner {

        require(canMint == true, "Sorry, minting is not yet authorized");
        require(_recipient == msg.sender && _amount == SITForDistribution, "You can only mint the authorized _amount to the owner's account");
        require(_totalSupply <= maxTotalSupply, "Cannot mint above the maximum supply"); // Overflow check

        _totalSupply += _amount;
        balances[_recipient] += _amount;
        emit Transfer(address(0), _recipient, _amount);
    }

    function totalSupply() public view  returns (uint256) {
        return _totalSupply;
    }

    // What is the balance of a particular account?
    function balanceOf(address _owner) public view  returns (uint256) {
        return balances[_owner];
    }

    // Transfer the balance from owner's account to another account
    function transfer(address _to, uint256 _amount) public returns (bool success) {

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

    // Send _value amount of tokens from address _from to address _to
    // The transferFrom method is used for a withdraw workflow, allowing contracts to send
    // tokens on your behalf, for example to "deposit" to a contract address and/or to charge
    // fees in sub-currencies; the command should fail unless the _from account has
    // deliberately authorized the sender of the message via some mechanism; we propose
    // these standardized APIs for approval:
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

    function addUser(address user, bool accessLevel, uint sit) public onlyOwner {

        uint _userId = users.push(User(user)) - 1;
        userId[user] = _userId;
        enabledUsers[user] = accessLevel;

        transfer(user, sit); // sit is transfered on adding new users 

        emit NewUser(user, accessLevel);
    }
    
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

        emit Distributed(_recipient, _amount, _sitCat, _lienIndex);
    }

    function withdraw(address _recipient, uint256 _amount, string memory  _sitCat, uint _lienIndex) public onlyOwner {
        
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

    function setMaxSupply(uint _maxTotalSupply) public onlyOwner returns (bool) {
        maxTotalSupply = _maxTotalSupply;
        return true;
    }

    function getMaxSupply() public view onlyOwner returns (uint) {
        return maxTotalSupply;
    }

    function setRate(uint _min, uint _max) public onlyOwner  {

        require(_max >= _min, "Maximum exchange rate should not be less than _minimum");
        exchangeRate = Rate(_min, _max);

        emit ExchangeRate(_min, _max);
    }

    function enableUser(address _recipient) public onlyOwner returns (bool) {
        
        enabledUsers[_recipient] = true;
        return true;
    }

    function diableUser(address _recipient) public onlyOwner returns (bool) {
        enabledUsers[_recipient] = false;
        return true;
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

    function generateRequest(uint _amount) public onlyOwner returns (bool) {
        require(_totalSupply + _amount >= _totalSupply, "Your request amount would reduces the total supply, make a burn request instead.");
        SITForDistribution = _amount;
        activeRequest = true;
    }

    function getRequestValue () public view onlyAuthorizer returns (uint) {
        return SITForDistribution;
    }

    function authorizeGen(bool _approval, string memory _reason) public onlyAuthorizer returns(bool)  {

        require(activeRequest == true, "There is no active request to authorize");
        uint _auth = authorizers.length / 2;

        if (approveCount > _auth) {
        
            approveCount = 0;
            activeRequest = false;
            canMint = true;
            emit Authorized(SITForDistribution, approveCount, rejectCount);
            return true;
            
        } else if(rejectCount > _auth) {
            
            approveCount = 0;
            activeRequest = false;
            canMint = false;
            emit Rejected(SITForDistribution, approveCount, rejectCount);
            return false;
            
        }

        if (_approval) {
            approveCount++;
            emit ApproveRequest(msg.sender, approveCount, _reason);
            return true;
        }else {
            rejectCount++;
            emit RejectRequest(msg.sender, rejectCount, _reason);
            return false;
        }

    }


    function addlien(address _recipient, uint _amount, uint _startDate, uint _endDate) public onlyOwner returns (uint) {
        
        uint lienIndex = liens[_recipient].push(Lien(_amount, _startDate, _endDate)); // adds a new lien entry to the _recipient's array of lien and enmits event
        
        emit SitToLien(_recipient, _amount, lienIndex);
        return lienIndex;
    }

    function allocate(address _recipient, uint _amount) public onlyOwner  returns (bool) {
        
        uint currentAllocated = allocated[_recipient]; // adds a new lien entry to the _recipient's array of lien and enmits event
        allocated[_recipient] = SafeMath.add(currentAllocated, _amount);
        
        emit Allocated(_recipient, _amount);
        return true;
    }

    function vestSit(address _recipient, uint _amount) public onlyOwner returns (bool) {
        
        uint currentAllocated = allocated[_recipient]; // adds a new lien entry to the _recipient's array of lien and enmits event
        allocated[_recipient] = SafeMath.add(currentAllocated, _amount);
        
        emit Vesting(_recipient, _amount);
        return true;
    }

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

    function addBeneficiaryAddress(address _recipient, address _beneficiaryAddr) public onlyOwner returns (bool) {
        beneficiary[_recipient] = _beneficiaryAddr;
        return true;
    }

}