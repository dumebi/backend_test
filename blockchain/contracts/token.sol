pragma solidity >=0.4.0 <0.6.0;

import "./libAuthorizer.sol";
import "./iERCs.sol";
import "./libUtils.sol";
import "./libSafeMath.sol";
import "./libMsgCode.sol";
import "./libOwner.sol";
import "./libTokenFunc.sol";
import "./libTokenScheduler.sol";


contract Token is IERC20, IERC1404 {
    
    using SafeMath for uint256;
    using TokenFunc for TokenFunc.Data;
    TokenFunc.Data tokenFunc;
    using MessagesAndCodes for MessagesAndCodes.Data;
    MessagesAndCodes.Data messagesAndCodes;
    using Ownable for Ownable.Data;
    Ownable.Data ownable;
    using TokenScheduler for TokenScheduler.Data;
    TokenScheduler.Data tokenScheduler;
    using Authorizer for Authorizer.Data;
    Authorizer.Data authorizer;
    using Authorizer for *;
    using Utils for *;
    
    modifier onlyOwner() {
        require(Ownable.isOwner(ownable), "Sorry, only the owner of this contract is authorized for this transaction");
        _;
    }
    
    modifier onlyAuthorizer() {
        require(Authorizer.isAuthorizer(authorizer, msg.sender), "You are not listed as an authorizer.");
        _;
    }
    
    modifier onlyValidShareHolder () {
        if (msg.sender != Ownable.owner(ownable)) {
            uint8 _code1 = messagesAndCodes.code.errorStringToCode["UNVERIFIED_HOLDER"];
            uint8 _code2 = messagesAndCodes.code.errorStringToCode["ACCOUNT_WITHHOLD_ERROR"];
            require(tokenFunc.shareHolders[msg.sender].isEnabled, messagesAndCodes.messages[_code1]);
            require(tokenFunc.shareHolders[msg.sender].isWithhold, messagesAndCodes.messages[_code2]);
            _;
        }
        _;
    }
    
    event NewTradable(address indexed _from, address indexed _to, uint _amount, uint indexed _date);
    event NewAllocated(address _from, address indexed _to, uint _amount, uint indexed _dateAdded);
    event NewVesting(address _from, address indexed _to, uint _amount, uint indexed _date);
    event NewLien(address _from, address indexed _to, uint _amount, uint indexed _startDate, uint indexed _lienPeriod);
    event MovedToTradable(address indexed _holder, string indexed _sitCat, uint256 catIndex);
    event NewShareholder(address indexed __holder);
    event shareHolderUpdated(address indexed _holder,bool updateData, string _updateSpecification);
    event NewSchedule(uint256 _scheduleId, string _scheduleType, uint256 _amount, bytes _data);
    event ScheduleApproved(uint256 _requestId, address _authorizer, bytes _reason); //Emit the authorizer's address that vote for approval
    event ScheduleRejected(uint256 _requestId, address _authorizer, bytes _reason); //Emit the authorizer's address that vote for rejection
    event Minted(string indexed _from, address indexed _holder, string indexed _sitCat, uint256 _amount, uint256 _scheduleType, bytes _data);
    event Withdrawn(address initiator, address indexed _holder, string indexed _sitCat, uint256 _amount, bytes _data);
    

    string public sName;
    string public sSymbol;
    address public aCoinbaseAcct; // Holds buybacks and withdrawn tokens
    uint8 public uGranularity;
    
    constructor (string memory _symbol, string memory _name, uint8 _granular, address _coinbase) public {
        sName = _name;
        sSymbol = _symbol;
        uGranularity = _granular;
        aCoinbaseAcct = _coinbase;
        Ownable.init(ownable);
        MessagesAndCodes.init(messagesAndCodes);
    }
    
    function addAuthorizer(address _approver, string memory _type) public returns(bool success)  {
        Authorizer.addAuthorizer(authorizer, _approver, _type);
        success = true;
    }

    function isAuthorizer(address _approver) public view returns (bool) {
        return Authorizer.isAuthorizer(authorizer, _approver);
    }

    function removeAuthorizer(address _approver) public returns(bool success) {
        success = Authorizer.removeAuthorizer(authorizer, _approver);
    }
    
    function messageExists (uint8 _code) public view returns (bool exist){
        exist = MessagesAndCodes.messageExists (messagesAndCodes, _code);
    }
    
    function addMessage (string memory  _errorString, string memory _message) public returns (string memory errorString) {
        errorString = MessagesAndCodes.addMessage (messagesAndCodes, _errorString, _message);
    }
    
    function updateMessage (string memory _errorString, string memory _message) public returns (bool success) {
        success = MessagesAndCodes.updateMessage (messagesAndCodes, _errorString, _message);
    }

    function removeMessage (string memory _errorString) public returns (bool success) {
        success = MessagesAndCodes.removeMessage (messagesAndCodes, _errorString);
    }

    function owner() public view returns (address) {
        return Ownable.owner(ownable);
    }
    
    function transferOwnership(address newOwner) public returns(bool success) {
        Ownable.transferOwnership(ownable, newOwner);
        success = true;
    }
    
    function totalSupply() public view  returns (uint256) {
        require(isValid(msg.sender), messagesAndCodes.messages[messagesAndCodes.code.errorStringToCode["UNVERIFIED_HOLDER_ERROR"]]);
        return TokenFunc.totalSupply(tokenFunc);
    }

    function balanceOf(address _tokenOwner) public view  returns (uint256) {
        require(isValid(msg.sender), messagesAndCodes.messages[messagesAndCodes.code.errorStringToCode["UNVERIFIED_HOLDER_ERROR"]]); // Inquire if this is valid
        return TokenFunc.balanceOf(tokenFunc, _tokenOwner);
    }
    
    function transfer(address _to, uint256 _amount) public returns (bool success) {
        require(_amount % uGranularity == 0, messagesAndCodes.messages[messagesAndCodes.code.errorStringToCode["TOKEN_GRANULARITY_ERROR"]]);
        success = TokenFunc.transfer(tokenFunc, messagesAndCodes, _to, _amount);
    }

    function transferFrom(address _from, address _to, uint256 _amount) public returns (bool success) {
        require(_amount % uGranularity == 0, messagesAndCodes.messages[messagesAndCodes.code.errorStringToCode["TOKEN_GRANULARITY_ERROR"]]);
        success = TokenFunc.transferFrom(tokenFunc, messagesAndCodes, _from, _to, _amount);
    }

    function approve(address _spender, uint256 _amount) public onlyValidShareHolder returns (bool success) {
        require(_amount % uGranularity == 0, messagesAndCodes.messages[messagesAndCodes.code.errorStringToCode["TOKEN_GRANULARITY_ERROR"]]);
        success = TokenFunc.approve(tokenFunc, messagesAndCodes, _spender, _amount);
    }
    
    function allowance(address _holder, address _spender) public view  returns (uint256) {
        require(isValid(msg.sender), messagesAndCodes.messages[messagesAndCodes.code.errorStringToCode["UNVERIFIED_HOLDER_ERROR"]]);
        return TokenFunc.allowance(tokenFunc, _holder, _spender);
    }
    
    function detectTransferRestriction (address _from, address _to, uint256 _amount) public view returns (uint8 restrictionCode) {
        return TokenFunc.detectTransferRestriction(tokenFunc, messagesAndCodes, _from, _to, _amount);
    }
        
    function messageForTransferRestriction (uint8 restrictionCode) public view returns (string memory message){
        return TokenFunc.messageForTransferRestriction(messagesAndCodes, restrictionCode);
    }
    
    function getRecordByCat(address _holder, string memory _sitCat, uint _catIndex) public returns (uint256 amount, uint256 dateAdded, uint256 lienPeriod, bool isMovedToTradable) {
        (amount, dateAdded, lienPeriod, isMovedToTradable) = TokenFunc.getRecordByCat(tokenFunc, messagesAndCodes, _holder, _sitCat, _catIndex);
    }
    
    function moveToTradable(address _holder, string memory _sitCat, uint _catIndex) public onlyOwner returns (bool success) {
        require(isValid(_holder), messagesAndCodes.messages[messagesAndCodes.code.errorStringToCode["RECEIPT_TRANSFER_BLOCKED"]]);
        success = TokenFunc.moveToTradable(tokenFunc, messagesAndCodes, _holder, _sitCat, _catIndex);
    }
    
    function addShareholder(address _holder, bool _isEnabled, bool _isWithhold, bytes32 _beneficiary) public onlyOwner returns(bool success) { 
        success = TokenFunc.addShareholder(tokenFunc, messagesAndCodes, _holder, _isEnabled, _isWithhold, _beneficiary);
    }
    
    function getShareHolder(address _holder) public view returns(bool isEnabled, bool isWithhold, bytes32 beneficiary,uint tradable, uint allocated, uint vesting, uint lien ) { 
        return TokenFunc.getShareHolder(tokenFunc, _holder);
    }

    function updateShareHolder(address _holder, bool _updateData, string memory _updateSpec) public onlyOwner returns(bool success ) { 

        success = TokenFunc.updateShareHolder(tokenFunc, _holder, _updateData, _updateSpec);
    }
    
    function changeBeneficiary(bytes32 _beneficiary) public returns (bool success) {
        require(isValid(msg.sender), messagesAndCodes.messages[messagesAndCodes.code.errorStringToCode["UNVERIFIED_HOLDER_ERROR"]]);
        tokenFunc.shareHolders[msg.sender].beneficiary = _beneficiary;
        return success = true;
    }

    function isValid(address _holder) public view returns (bool) {
        if (_holder != Ownable.owner(ownable)) {
            return tokenFunc.shareHolders[_holder].isEnabled;
        }
        return true;
    }
    
    function isWithhold(address _holder) public view returns (bool) {
        return tokenFunc.shareHolders[_holder].isWithhold;
    }
    
    function createSchedule (uint256 _scheduleId, uint256 _amount, string memory _scheduleType, bytes memory _data) public onlyOwner returns(uint256 scheduleId) {
        scheduleId = TokenScheduler.createSchedule(tokenScheduler, _scheduleId, _amount, _scheduleType, _data);
    } 
    
    function approveSchedule( uint256 _scheduleId, bytes memory _reason) public onlyAuthorizer returns(uint256 scheduleId)  {
        string memory _authorizerType = authorizer.mAuthorizers[msg.sender].authorizerType;
        scheduleId = TokenScheduler.approveSchedule(tokenScheduler, _scheduleId, _reason, _authorizerType);
    } 
    
    function rejectSchedule( uint256 _scheduleId, bytes memory _reason) public onlyAuthorizer returns(uint256 scheduleId)  {
        string memory _authorizerType = authorizer.mAuthorizers[msg.sender].authorizerType;
        scheduleId = TokenScheduler.rejectSchedule(tokenScheduler, _scheduleId, _reason, _authorizerType);
    } 
    
    function removeSchedule(uint256 _scheduleId, bytes memory _reason) public returns(uint256 scheduleId)  {
        scheduleId = TokenScheduler.removeSchedule(tokenScheduler, _scheduleId, _reason);
    } 

    function mint(uint256 _scheduleIndex, address _holder, uint256 _amount, string memory _sitCat, uint256 _extraDataData, bytes memory _data) public onlyOwner returns (bool success) {
        
        if (TokenFunc.totalSupply(tokenFunc).add(_amount) < TokenFunc.totalSupply(tokenFunc)) {
            success = false;
            return success;
        }
        require(isValid(_holder), messagesAndCodes.messages[messagesAndCodes.code.errorStringToCode["RECEIPT_TRANSFER_BLOCKED"]]);
        
        success = TokenScheduler.mint(tokenScheduler, tokenFunc, messagesAndCodes, uGranularity, aCoinbaseAcct, _scheduleIndex, _holder, _amount, _sitCat, _extraDataData, _data );
    }
    
    function withdraw(address _holder, uint256 _amount, string memory _sitCat, bytes memory _reason) public onlyOwner returns (bytes memory reason) {
        if (_amount < 0) {
            return "";
        }
        reason = TokenFunc.withdraw(tokenFunc , messagesAndCodes, uGranularity, aCoinbaseAcct, _holder, _amount, _sitCat,_reason);
    }
    
    
    
    // Don't accept ETH
    function () external {
        revert("Contract cannot accept Ether and also ensure you are calling the right function!");
    }
}
