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
        require(Ownable.isOwner(ownable), "Only contract owner can initiate this transaction");
        _;
    }
    
    modifier onlyManager() {
        require(aManager == msg.sender, "Only contract manager can initiate this transaction");
        _;
    }
    
    modifier onlyAdmin () {
        if (msg.sender != Ownable.owner(ownable)) {
            require(tokenFunc.administrators[msg.sender], "Only contract administrators can initiate this transaction");
            _;
        }
        _;
    }
    
    modifier onlyAuthorizer() {
        require(Authorizer.isAuthorizer(authorizer, msg.sender), "You are not listed as an authorizer.");
        _;
    }
    
    modifier onlyValidShareHolder () {
        if (msg.sender != Ownable.owner(ownable)) {
            require(tokenFunc.shareHolders[msg.sender].isEnabled, messagesAndCodes.messages[messagesAndCodes.code.errorStringToCode["UNVERIFIED_HOLDER"]]);
            require(!tokenFunc.shareHolders[msg.sender].isWithhold, messagesAndCodes.messages[messagesAndCodes.code.errorStringToCode["ACCOUNT_WITHHOLD_ERROR"]]);
            _;
        }
        _;
    }
    
    event NewTradable(address indexed _from, address indexed _to, uint _amount, uint indexed _date);
    event NewAllocated(address _from, address indexed _to, uint _amount, uint indexed _dateAdded);
    event NewVesting(address _from, address indexed _to, uint _amount, uint indexed _date);
    event NewLien(address _from, address indexed _to, uint _amount, uint indexed _startDate, uint indexed _lienPeriod);
    event MovedToTradable(address indexed _holder, TokenFunc.TokenCat _sitCat, uint256 catIndex);
    event NewShareholder(address indexed __holder);
    event shareHolderUpdated(address indexed _holder,bool _isEnabled, bool _isWithhold);
    event NewSchedule(uint256 _scheduleId, TokenScheduler.ScheduleType _scheduleType, uint256 _amount, bytes _data);
    event ScheduleApproved(uint256 _requestId, address _authorizer, bytes _reason); //Emit the authorizer's address that vote for approval
    event ScheduleRejected(uint256 _requestId, address _authorizer, bytes _reason); //Emit the authorizer's address that vote for rejection
    event Minted(uint8 _from, address indexed _holder, TokenFunc.TokenCat _sitCat, uint256 _amount, uint256 _scheduleType, bytes _data);
    event Withdrawn(address initiator, address indexed _holder, TokenFunc.TokenCat _sitCat, uint256 _amount, bytes _data);
    

    string public sName;
    string public sSymbol;
    address public aCoinbaseAcct; // Holds buybacks and withdrawn tokens
    uint8 public uGranularity;
    address aManager; 
    
    constructor (string memory _symbol, string memory _name, uint8 _granular, address _coinbase, address owner) public {
        sName = _name;
        sSymbol = _symbol;
        uGranularity = _granular;
        aCoinbaseAcct = _coinbase;
        aManager = msg.sender;
        // Ownable.init(ownable, owner);
        // MessagesAndCodes.init(messagesAndCodes);
    }
    
    // function changeManager(address newManager) public onlyManager returns(bool success)  {
    //     aManager = newManager;
    //     return true;
    // }
    
    // function addAdmin(address admin) public onlyOwner returns(bool success)  {
    //     tokenFunc.administrators[msg.sender] = true;
    //     return true;
    // }
    
    // function removeAdmin(address admin) public onlyOwner returns(bool success)  {
    //     tokenFunc.administrators[msg.sender] = false;
    //     return true;
    // }
    
    function addAuthorizer(address _approver, TokenScheduler.ScheduleType _type) public onlyOwner returns(bool success)  {
        Authorizer.addAuthorizer(authorizer, _approver, _type);
        success = true;
    }

    function countAuthorizer() public view onlyOwner returns (uint) {
        return authorizer.mAuthorizers.length;
    }
    
    function getAuthorizer(address _approver, uint _index) public view onlyOwner returns (address authorizerAddr, TokenScheduler.ScheduleType authorizerType) {
        return Authorizer.getAuthorizer(authorizer, _approver, _index);
    }

    function removeAuthorizer(address _approver) public returns(bool success) {
        success = Authorizer.removeAuthorizer(authorizer, _approver);
    }
    
    function messageExists (uint8 _code) public view returns (bool exist){
        exist = MessagesAndCodes.messageExists (messagesAndCodes, _code);
    }
    
    function addMessage (string memory  _errorString, string memory _message) public returns (string memory errorString) {
        string memory errorString = MessagesAndCodes.addMessage(messagesAndCodes, _errorString, _message);
        return errorString;
    }
    
    function updateMessage (string memory _errorString, string memory _message) public returns (bool success) {
        success = MessagesAndCodes.updateMessage(messagesAndCodes, _errorString, _message);
    }

    function removeMessage (string memory _errorString) public returns (bool success) {
        success = MessagesAndCodes.removeMessage(messagesAndCodes, _errorString);
    }

    function owner() public view returns (address) {
        return Ownable.owner(ownable);
    }
    
    function transferOwnership(address newOwner) public returns(bool success) {
        Ownable.transferOwnership(ownable, newOwner);
        success = true;
    }
    
    function totalSupply() public view  returns (uint256) {
        // require(isValid(msg.sender), messagesAndCodes.messages[messagesAndCodes.code.errorStringToCode["UNVERIFIED_HOLDER_ERROR"]]);
        return TokenFunc.totalSupply(tokenFunc);
    }

    function balanceOf(address _tokenOwner) public view  returns (uint256) {
        // require(isValid(msg.sender), messagesAndCodes.messages[messagesAndCodes.code.errorStringToCode["UNVERIFIED_HOLDER_ERROR"]]); // Inquire if this is valid
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
    
    function getRecordByCat(address _holder, TokenFunc.TokenCat _sitCat, uint _catIndex) public view returns (uint256 amount, uint256 dateAdded, uint256 duration, bool isMovedToTradable) {
        (amount, dateAdded, duration, isMovedToTradable) = TokenFunc.getRecordByCat(tokenFunc, _holder, _sitCat, _catIndex);
    }
    
    function moveToTradable(address _holder, TokenFunc.TokenCat _sitCat, uint _catIndex) public onlyOwner returns (bool success) {
        require(isValid(_holder), messagesAndCodes.messages[messagesAndCodes.code.errorStringToCode["RECEIPT_TRANSFER_BLOCKED"]]);
        success = TokenFunc.moveToTradable(tokenFunc, messagesAndCodes, _holder, _sitCat, _catIndex);
    }
    
    function addShareholder(address _holder, bool _isEnabled, bool _isWithhold) public onlyOwner returns(bool success) { 
        success = TokenFunc.addShareholder(tokenFunc, messagesAndCodes, _holder, _isEnabled, _isWithhold);
    }
    
    function getShareHolder(address _holder) public view returns(bool isEnabled, bool isWithhold, uint tradable, uint allocated, uint vesting, uint lien ) { 
        return TokenFunc.getShareHolder(tokenFunc, _holder);
    }

    function updateShareHolder(address _holder, bool isEnabled, bool isWithhold) public onlyOwner returns(bool success ) { 

        success = TokenFunc.updateShareHolder(tokenFunc, _holder, isEnabled, isWithhold);
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
    
    function createSchedule (uint256 _scheduleId, uint256 _amount, TokenScheduler.ScheduleType _scheduleType, bytes memory _data) public onlyOwner returns(uint256 scheduleId) {
        scheduleId = TokenScheduler.createSchedule(tokenScheduler, _scheduleId, _amount, _scheduleType, _data);
    } 
    
    function getSchedule (uint _scheduleId) public view returns(uint amount, uint activeAmount, bool isApproved, bool isRejected, bool isActive, TokenScheduler.ScheduleType scheduleType ) {
        return TokenScheduler.getSchedule(tokenScheduler, _scheduleId);
    }
    
    function getScheduleAuthorizer (uint _scheduleId, uint _authorizerIndex) public view returns(address authorizerAddress, bytes memory reason) {
        return TokenScheduler.getScheduleAuthorizer(tokenScheduler, _scheduleId, _authorizerIndex);
    }
    
    function approveSchedule( uint256 _scheduleId, bytes memory _reason) public onlyAuthorizer returns(uint256 scheduleId)  {
        TokenScheduler.ScheduleType _authorizerType = authorizer.mAuthorizers[authorizer.authorizerToIndex[msg.sender].index].authorizerType;
        scheduleId = TokenScheduler.approveSchedule(tokenScheduler, _scheduleId, _reason, _authorizerType);
    } 
    
    function rejectSchedule( uint256 _scheduleId, bytes memory _reason) public onlyAuthorizer returns(uint256 scheduleId)  {
        TokenScheduler.ScheduleType _authorizerType = authorizer.mAuthorizers[authorizer.authorizerToIndex[msg.sender].index].authorizerType;
        scheduleId = TokenScheduler.rejectSchedule(tokenScheduler, _scheduleId, _reason, _authorizerType);
    } 
    
    function removeSchedule(uint256 _scheduleId, bytes memory _reason) public onlyOwner returns(uint256 scheduleId)  {
        scheduleId = TokenScheduler.removeSchedule(tokenScheduler, _scheduleId, _reason);
    } 

    function mint(uint256 _scheduleIndex, address _holder, uint256 _amount, TokenFunc.TokenCat _sitCat, uint256 _lienPeriod, bytes memory _data) public onlyOwner returns (bool success) {
        
        if (TokenFunc.totalSupply(tokenFunc).add(_amount) < TokenFunc.totalSupply(tokenFunc)) {
            success = false;
            return success;
        }
        require(isValid(_holder), messagesAndCodes.messages[messagesAndCodes.code.errorStringToCode["RECEIPT_TRANSFER_BLOCKED"]]);
        
        success = TokenScheduler.mint(tokenScheduler, tokenFunc, messagesAndCodes, uGranularity, aCoinbaseAcct, _scheduleIndex, _holder, _amount, _sitCat, _lienPeriod, _data );
    }
    
    function withdraw(address _holder, uint256 _amount, TokenFunc.TokenCat _sitCat, uint _recordId, bytes memory _reason) public onlyOwner returns (bytes memory reason) {
        if (_amount < 0) {
            return "";
        }
        reason = TokenFunc.withdraw(tokenFunc , messagesAndCodes, uGranularity, aCoinbaseAcct, _holder, _amount, _sitCat, _recordId, _reason);
    }
    
    // Don't accept ETH
    function () external {
        revert("Contract cannot accept Ether and also ensure you are calling the right function!");
    }
}
