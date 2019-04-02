    pragma solidity >=0.4.0 <0.6.0;
    
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
        
        modifier onlyOwner() {
            require(Ownable._isOwner_(ownable), MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.UNAUTHORIZED_ERROR)));
            _;
        }
        
        modifier onlyManager() {
            require(aManager == msg.sender, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.UNAUTHORIZED_ERROR)));
            _;
        }
        
        modifier onlyAdmin () {
            if (msg.sender != Ownable._owner_(ownable)) {
                require(isAdmin(msg.sender), MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.UNAUTHORIZED_ERROR)));
                _;
            } else {
                _;
                
            }
        }
        
        modifier onlyValidShareHolder () {
            if (msg.sender != Ownable._owner_(ownable)) {
                require(!tokenFunc.shareHolders[msg.sender].isWithhold, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.ACCOUNT_WITHHOLD_ERROR)));
                _;
            } else {
             _;
            }
        }
    
        event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
        event Transfer(address indexed _from, address indexed _to, uint256 _amount);
        event Approval(address indexed _owner, address indexed _spender, uint256 _amount);
        event NewUpfront(address indexed _to, uint _amount, bytes32 _recordId, uint indexed _dateAdded);
        event NewLoan(address indexed _to, uint _amount, bytes32 _recordId, uint indexed _date);
        event NewLien(address indexed _to, uint _amount, bytes32 _recordId, uint indexed _dateAdded);
        event MovedToTradable(address indexed _holder, Sharing.TokenCat _sitCat, bytes32 _recordId);
        event NewShareholder(address indexed __holder);
        event shareHolderUpdated(address indexed _holder, bool _isWithhold);
        event shareHolderRemoved(address indexed _holder);
        event Withdrawn(address _initiator, address indexed _holder, Sharing.TokenCat _sitCat, uint256 _amount, bytes32 _recordId, bytes _data);
        event NewSchedule(bytes32 indexed _scheduleId, Sharing.ScheduleType _scheduleType, uint256 _amount, bytes _reason);
        event ScheduleRemoved(bytes32 indexed _scheduleId, address indexed _initiator, bytes _reason);
        event Minted(uint8 indexed _from, address indexed _holder, Sharing.TokenCat _sitCat, uint256 _amount, bytes32 _scheduleId , bytes _reason);
        event Preloaded(address indexed _holder, uint256 _lien, uint256 _upfront, uint256 _loan, uint256 _tradable, bytes _reason);
        
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
            return Ownable._owner_(ownable);
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
        
        function transferOwnership(address newOwner) public onlyOwner returns(bool success) {
            Ownable._transferOwnership_(ownable, newOwner);
            success = true;
        }
        
        function totalSupply() public view  returns (uint256) {
            return TokenFunc._totalSupply_(tokenFunc);
        }
    
        function balanceOf(address _tokenOwner) public view  returns (uint256) {
            return TokenFunc._balanceOf_(tokenFunc, _tokenOwner);
        }
        
        function transfer(address _to, uint256 _amount) public returns (bool success) {
            require(_amount % uGranularity == 0, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.TOKEN_GRANULARITY_ERROR)));
            success = TokenFunc._transfer_(tokenFunc, _to, _amount);
        }
    
        function transferFrom(address _from, address _to, uint256 _amount) public onlyValidShareHolder returns (bool success) {
            require(_amount % uGranularity == 0, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.TOKEN_GRANULARITY_ERROR)));
            success = TokenFunc._transferFrom_(tokenFunc, _from, _to, _amount);
        }
    
        function approve(address _spender, uint256 _amount) public onlyValidShareHolder returns (bool success) {
            require(_amount % uGranularity == 0, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.TOKEN_GRANULARITY_ERROR)));
            success = TokenFunc._approve_(tokenFunc, _spender, _amount);
        }
        
        function allowance(address _holder, address _spender) public view  returns (uint256) {
           return TokenFunc._allowance_(tokenFunc, _holder, _spender);
        }
        
        function detectTransferRestriction (address _from, address _to, uint256 _amount) public view returns (uint8 restrictionCode) {
            return uint8(TokenFunc._detectTransferRestriction_(tokenFunc, _from, _to, _amount));
        }
        
        function messageForTransferRestriction (uint8 restrictionCode) public pure returns (string memory){
            return TokenFunc._messageForTransferRestriction_(restrictionCode);
        }
        
        function addToEscrow(uint _amount) public onlyValidShareHolder  returns(uint totalInEscrow) {
            return TokenFunc._addToEscrow_(tokenFunc,msg.sender, _amount);
        }
        
        function addToLoanEscrow(address _holder, uint _amount, bytes32 _loanId) public returns(uint totalInEscrow) {
           return TokenFunc._addToLoanEscrow_(tokenFunc, _holder, _amount, _loanId);
        }
            
       function removeFromEscrow(uint _amount) public onlyValidShareHolder returns(uint totalInEscrow) {
            return TokenFunc._removeFromEscrow_(tokenFunc,msg.sender, _amount);
        }
        
        function totalInEscrow() public view returns(uint total) {
            return TokenFunc._totalInEscrow_(tokenFunc,msg.sender);
        }
        
        function recordByCat(address _holder, Sharing.TokenCat _sitCat, bytes32 _recordId) public view returns (uint256 amount, uint256 dateAdded, bytes32 recordId, bool isMovedToTradable, bool isWithdrawn) {
            (amount, dateAdded, recordId, isMovedToTradable, isWithdrawn) = TokenFunc._getRecordByCat_(tokenFunc, _holder, _sitCat, _recordId);
        }
        
        
        function moveToTradable(address _holder, Sharing.TokenCat _sitCat, bytes32 _recordId) public onlyAdmin returns (string memory success) {
           success = TokenFunc._moveToTradable_(tokenFunc, _holder, _sitCat, _recordId);
        }
        
        function addShareholder(address _holder, bool _isWithhold) public onlyAdmin returns(string memory success) { 
            success = TokenFunc._addShareholder_(tokenFunc, _holder, _isWithhold);
        }
        
        function getShareHolder(address _holder) public view returns(bool isWithhold, uint tradable, uint upfront, uint loan, uint lien ) { 
            return TokenFunc._getShareHolder_(tokenFunc, _holder);
        }
    
        function updateShareHolder(address _holder, bool isWithhold) public onlyAdmin returns(string memory success ) { 
    
            success = TokenFunc._updateShareHolder_(tokenFunc, _holder, isWithhold);
        }
        
        function removeShareHolder(address _holder) public onlyAdmin returns(string memory success) { 
                return  TokenFunc._removeShareHolder_(tokenFunc, _holder);
        }
    
        function isWithhold(address _holder) public view returns (bool) {
            return tokenFunc.shareHolders[_holder].isWithhold;
        }
            
        function createSchedule (bytes32 _scheduleId, uint256 _amount, Sharing.ScheduleType _scheduleType, bytes memory _data) public onlyAdmin returns(string memory success) {
            return TokenScheduler._createSchedule_(tokenScheduler, _scheduleId, _amount, _scheduleType, _data);
        } 
        
        function getSchedule (bytes32 _scheduleId) public view onlyAdmin returns(bytes32 scheduleId,uint amount, uint activeAmount, bool isActive, Sharing.ScheduleType scheduleType ) {
            return TokenScheduler._getSchedule_(tokenScheduler, _scheduleId);
        }
        
        function removeSchedule(bytes32 _scheduleId, bytes memory _reason) public onlyAdmin returns(bool success)  {
            success = TokenScheduler._removeSchedule_(tokenScheduler, _scheduleId, _reason);
        } 
    
        function mint(bytes32 _scheduleIndex, address _holder, uint256 _amount, Sharing.TokenCat _sitCat, bytes32 _recordId, bytes memory _data) public onlyAdmin returns (string memory success) {
            
            if (TokenFunc._totalSupply_(tokenFunc).add(_amount) < TokenFunc._totalSupply_(tokenFunc)) {
                return MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.FAILURE));
            }
            
            success = TokenScheduler._mint_(tokenScheduler, tokenFunc, uGranularity, aTokenbase, _scheduleIndex, _holder, _amount, _sitCat, _recordId, _data );
        }
        
        function preloadToken(address _holder, uint _lien, uint _upfront, uint _loan, uint _tradable, bytes32 _idLien, bytes32 _idUpfront, bytes32 _idLoan, bytes memory _data) public returns (string memory success) {
            return TokenScheduler._preloadToken_(tokenFunc, uGranularity, _holder, _lien, _upfront, _loan, _tradable, _idLien, _idUpfront, _idLoan, _data);
        }
    
        function withdraw(address _holder, uint256 _amount, Sharing.TokenCat _sitCat, bytes32 _recordId, bytes memory _reason) public onlyAdmin returns (string memory success) {
            if (_amount < 0) {
                return "";
            }
            success = TokenFunc._withdraw_(tokenFunc, uGranularity, aTokenbase, _holder, _amount, _sitCat, _recordId, _reason);
        }
        
        // Don't accept ETH
        function () external {
            revert("Contract cannot accept Ether and also ensure you are calling the right function!");
        }
    }
