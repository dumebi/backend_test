pragma solidity >=0.4.0 <0.6.0;

import "./libAuthorizer.sol";
import "./iERCs.sol";
import "./libSafeMath.sol";
import "./libMsgCode.sol";
import "./libOwner.sol";
import "./libTokenFunc.sol";
import "./libTokenScheduler.sol";


contract Token is IERC20, IERC1404 {
    
    using SafeMath for uint256;
    using Sharing for Sharing.DataToken;
    Sharing.DataToken tokenFunc;
    using Sharing for Sharing.DataOwner;
    Sharing.DataOwner ownable;
    using Sharing for Sharing.DataSchedule;
    Sharing.DataSchedule tokenScheduler;
    using Sharing for Sharing.DataAuthorizer;
    Sharing.DataAuthorizer authorizer;
    
    modifier onlyOwner() {
        require(Ownable.isOwner(ownable), MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.UNAUTHORIZED_ERROR)));
        _;
    }
    
    modifier onlyManager() {
        require(aManager == msg.sender, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.UNAUTHORIZED_ERROR)));
        _;
    }
    
    modifier onlyAdmin () {
        if (msg.sender != Ownable.owner(ownable)) {
            require(isAdmin(msg.sender), MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.UNAUTHORIZED_ERROR)));
            _;
        } else {
            _;
            
        }
    }
    
    modifier onlyAuthorizer() {
        require(Authorizer.isAuthorizer(authorizer, msg.sender), MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.UNAUTHORIZED_ERROR)));
        _;
    }
    
    modifier onlyValidShareHolder () {
        if (msg.sender != Ownable.owner(ownable)) {
            require(tokenFunc.shareHolders[msg.sender].isEnabled, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.UNVERIFIED_HOLDER)));
            require(!tokenFunc.shareHolders[msg.sender].isWithhold, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.ACCOUNT_WITHHOLD_ERROR)));
            _;
        }
        _;
    }

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event NewAuthorizer(address indexed _authorizer, Sharing.ScheduleType indexed _type);
    event AuthorizerRemoved(address indexed _authorizer);
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
    event NewTradable(address indexed _from, address indexed _to, uint _amount, uint indexed _date);
    event NewAllocated(address _from, address indexed _to, uint _amount, uint indexed _dateAdded);
    event NewVesting(address _from, address indexed _to, uint _amount, uint indexed _date);
    event NewLien(address _from, address indexed _to, uint _amount, uint indexed _dateAdded, uint indexed _lienPeriod);
    event MovedToTradable(address indexed _holder, Sharing.TokenCat _sitCat, uint256 catIndex);
    event NewShareholder(address indexed __holder);
    event shareHolderUpdated(address indexed _holder,bool _isEnabled, bool _isWithhold);
    event shareHolderRemoved(address _holder);
    event Withdrawn(address initiator, address indexed _holder, Sharing.TokenCat _sitCat, uint256 _amount, bytes _data);
    event NewSchedule(uint256 _scheduleId, Sharing.ScheduleType _scheduleType, uint256 _amount, bytes _data);
    event ScheduleApproved(uint256 _requestId, address _authorizer, bytes _reason); //Emit the authorizer's address that vote for approval
    event ScheduleRejected(uint256 _requestId, address _authorizer, bytes _reason); //Emit the authorizer's address that vote for rejection
    event ScheduleRemoved(uint256 indexed _scheduleId, address indexed _initiator, bytes _reason);
    event Minted(uint8 indexed _from, address indexed _holder, Sharing.TokenCat _sitCat, uint256 _amount, uint256 _scheduleType, bytes _data);
    

    string public sName;
    string public sSymbol;
    address public aTokenbase; // Holds buybacks and withdrawn tokens
    uint8 public uGranularity;
    address public aManager; 
    
    constructor (string memory _symbol, string memory _name, uint8 _granular, address _tokenbase, address owner) public {
        sName = _name;
        sSymbol = _symbol;
        uGranularity = _granular;
        aTokenbase = _tokenbase;
        aManager = msg.sender;
        Ownable.init(ownable, owner);
    }
    
    
    function owner() public view returns (address) {
        return Ownable.owner(ownable);
    }
    
    function changeManager(address newManager) public onlyOwner returns(bool success)  {
        aManager = newManager;
        return true;
    }
    
    function addAdmin(address admin) public onlyOwner returns(bool success)  {
        tokenFunc.administrators[admin] = true;
        return true;
    }
    
    function isAdmin(address admin) public view returns(bool)  {
        return tokenFunc.administrators[admin];
    }
    
    function removeAdmin(address admin) public onlyOwner returns(bool success)  {
        tokenFunc.administrators[admin] = false;
        return true;
    }
    
    function addAuthorizer(address _approver, Sharing.ScheduleType _type) public onlyOwner returns(bool success)  {
        Authorizer.addAuthorizer(authorizer, _approver, _type);
        success = true;
    }

    function totalAuthorizer() public view returns (uint) {
        return authorizer.mAuthorizers.length;
    }
    
    
    function getAuthorizer(address _approver) public view onlyAdmin returns (address authorizerAddr, Sharing.ScheduleType authorizerType) {
        return Authorizer.getAuthorizer(authorizer, _approver);
    }

    function removeAuthorizer(address _approver) public onlyOwner returns(bool success) {
        success = Authorizer.removeAuthorizer(authorizer, _approver);
    }
    
    function transferOwnership(address newOwner) public onlyOwner returns(bool success) {
        Ownable.transferOwnership(ownable, newOwner);
        success = true;
    }
    
    function totalSupply() public view  returns (uint256) {
        return TokenFunc.totalSupply(tokenFunc);
    }

    function balanceOf(address _tokenOwner) public view  returns (uint256) {
        return TokenFunc.balanceOf(tokenFunc, _tokenOwner);
    }
    
    function transfer(address _to, uint256 _amount) public returns (bool success) {
        require(_amount % uGranularity == 0, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.TOKEN_GRANULARITY_ERROR)));
        success = TokenFunc.transfer(tokenFunc, _to, _amount);
    }

    function transferFrom(address _from, address _to, uint256 _amount) public onlyValidShareHolder returns (bool success) {
        require(_amount % uGranularity == 0, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.TOKEN_GRANULARITY_ERROR)));
        success = TokenFunc.transferFrom(tokenFunc, _from, _to, _amount);
    }

    function approve(address _spender, uint256 _amount) public onlyValidShareHolder returns (bool success) {
        require(_amount % uGranularity == 0, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.TOKEN_GRANULARITY_ERROR)));
        success = TokenFunc.approve(tokenFunc, _spender, _amount);
    }
    
    function allowance(address _holder, address _spender) public view  returns (uint256) {
        require(isValid(msg.sender),MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.UNVERIFIED_HOLDER_ERROR)));
        return TokenFunc.allowance(tokenFunc, _holder, _spender);
    }
    
    function detectTransferRestriction (address _from, address _to, uint256 _amount) public view returns (uint8 restrictionCode) {
        return uint8(TokenFunc.detectTransferRestriction(tokenFunc, _from, _to, _amount));
    }
    
    function messageForTransferRestriction (uint8 restrictionCode) public view returns (string memory){
        return TokenFunc.messageForTransferRestriction(restrictionCode);
    }
    
    function totalRecordsByCat(address _holder, Sharing.TokenCat _sitCat) public view returns (uint) {
        return TokenFunc.totalRecordsByCat (tokenFunc, _holder, _sitCat);
    }
    
    function recordByCat(address _holder, Sharing.TokenCat _sitCat, uint _catIndex) public view returns (uint256 amount, uint256 dateAdded, uint256 duration, bool isMovedToTradable, bool isWithdrawn) {
        (amount, dateAdded, duration, isMovedToTradable, isWithdrawn) = TokenFunc.getRecordByCat(tokenFunc, _holder, _sitCat, _catIndex);
    }
    
    function moveToTradable(address _holder, Sharing.TokenCat _sitCat, uint _catIndex) public onlyAdmin returns (string memory success) {
        require(isValid(_holder),MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.RECEIPT_TRANSFER_BLOCKED)));
        success = TokenFunc.moveToTradable(tokenFunc, _holder, _sitCat, _catIndex);
    }
    
    function addShareholder(address _holder, bool _isEnabled, bool _isWithhold) public onlyAdmin returns(string memory success) { 
        success = TokenFunc.addShareholder(tokenFunc, _holder, _isEnabled, _isWithhold);
    }
    
    function getShareHolder(address _holder) public view returns(bool isEnabled, bool isWithhold, uint tradable, uint allocated, uint vesting, uint lien ) { 
        return TokenFunc.getShareHolder(tokenFunc, _holder);
    }

    function updateShareHolder(address _holder, bool isEnabled, bool isWithhold) public onlyAdmin returns(string memory success ) { 

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
    
    function createSchedule (uint256 _scheduleId, uint256 _amount, Sharing.ScheduleType _scheduleType, bytes memory _data) public onlyAdmin returns(string memory success) {
        success = TokenScheduler.createSchedule(tokenScheduler, _scheduleId, _amount, _scheduleType, _data);
    } 
    
    function getSchedule (uint _scheduleId) public view onlyAdmin returns(uint amount, uint activeAmount, bool isApproved, bool isRejected, bool isActive, Sharing.ScheduleType scheduleType ) {
        return TokenScheduler.getSchedule(tokenScheduler, _scheduleId);
    }
    
    function getScheduleAuthorizer (uint _scheduleId, uint _authorizerIndex) public view returns(address authorizerAddress, bytes memory reason) {
        return TokenScheduler.getScheduleAuthorizer(tokenScheduler, _scheduleId, _authorizerIndex);
    }
    
    function approveSchedule( uint256 _scheduleId, bytes memory _reason) public onlyAuthorizer returns(string memory success)  {
        Sharing.ScheduleType _authorizerType = authorizer.mAuthorizers[authorizer.authorizerToIndex[msg.sender].index].authorizerType;
        success = TokenScheduler.approveSchedule(tokenScheduler, _scheduleId, _reason, _authorizerType);
    } 
    
    function rejectSchedule( uint256 _scheduleId, bytes memory _reason) public onlyAuthorizer returns(string memory success)  {
        Sharing.ScheduleType _authorizerType = authorizer.mAuthorizers[authorizer.authorizerToIndex[msg.sender].index].authorizerType;
        success = TokenScheduler.rejectSchedule(tokenScheduler, _scheduleId, _reason, _authorizerType);
    } 
    
    function removeSchedule(uint256 _scheduleId, bytes memory _reason) public onlyAdmin returns(uint256 scheduleId)  {
        scheduleId = TokenScheduler.removeSchedule(tokenScheduler, _scheduleId, _reason);
    } 

    function mint(uint256 _scheduleIndex, address _holder, uint256 _amount, Sharing.TokenCat _sitCat, uint256 _duration, bytes memory _data) public onlyAdmin returns (string memory success) {
        
        if (TokenFunc.totalSupply(tokenFunc).add(_amount) < TokenFunc.totalSupply(tokenFunc)) {
            return MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.FAILURE));
        }
        require(isValid(_holder), MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.RECEIPT_TRANSFER_BLOCKED)));
        
        success = TokenScheduler.mint(tokenScheduler, tokenFunc, uGranularity, aTokenbase, _scheduleIndex, _holder, _amount, _sitCat, _duration, _data );
    }
    
    function withdraw(address _holder, uint256 _amount, Sharing.TokenCat _sitCat, uint _recordId, bytes memory _reason) public onlyAdmin returns (string memory success) {
        if (_amount < 0) {
            return "";
        }
        success = TokenFunc.withdraw(tokenFunc, uGranularity, aTokenbase, _holder, _amount, _sitCat, _recordId, _reason);
    }
    
    // Don't accept ETH
    function () external {
        revert("Contract cannot accept Ether and also ensure you are calling the right function!");
    }
}
