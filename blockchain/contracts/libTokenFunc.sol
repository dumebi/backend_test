pragma solidity >=0.4.0 <0.6.0;

import "./libSafeMath.sol";
import "./libMsgCode.sol";
import "./libSharing.sol";


library TokenFunc {
    
    using SafeMath for uint256;
    
    
    event Transfer(address indexed _from, address indexed _to, uint256 _amount);
    event NewUpfront(address indexed _to, uint _amount, bytes32 _recordId, uint indexed _dateAdded);
    event NewLoan(address indexed _to, uint _amount, bytes32 _recordId, uint indexed _date);
    event NewLien(address indexed _to, uint _amount, bytes32 _recordId, uint indexed _dateAdded);
    event MovedToTradable(address indexed _holder, Sharing.TokenCat _sitCat, bytes32 _recordId);
    event NewShareholder(address indexed __holder);
    event shareHolderUpdated(address indexed _holder, bool _isWithhold);
    event shareHolderRemoved(address indexed _holder);
    event Withdrawn(address _initiator, address indexed _holder, Sharing.TokenCat _sitCat, uint256 _amount, bytes32 _recordId, bytes _data);
    

    function _totalSupply_(Sharing.DataToken storage self) internal view  returns (uint256) {
        return self.uTotalSupply;
    }

    function _balanceOf_(Sharing.DataToken storage self, address _tokenOwner) internal view returns (uint256) {
        return self.mBalances[_tokenOwner];
    }
    
    function _transfer_(Sharing.DataToken storage self, address _to, uint256 _amount) internal returns (bool) {
        _verifyTransfer_(self, msg.sender, _to, _amount);
        self.mBalances[msg.sender] = self.mBalances[msg.sender].sub(_amount);
        self.mBalances[_to] = self.mBalances[_to].add(_amount);
        emit Transfer(msg.sender, _to, _amount);
        return true;
    }

    function _verifyTransfer_ (Sharing.DataToken storage self, address _from,address _to,uint256 _amount)internal view returns (bool success){
        MessagesAndCodes.Reason restrictionCode = _detectTransferRestriction_(self, _from, _to, _amount);
        require(MessagesAndCodes.isOk(uint8(restrictionCode)), _messageForTransferRestriction_(uint8(restrictionCode)));
        return true;
    }
    
    function _detectTransferRestriction_ (Sharing.DataToken storage self, address _from, address _to, uint256 _amount) internal view returns (MessagesAndCodes.Reason)
    {
        MessagesAndCodes.Reason restrictionCode = MessagesAndCodes.Reason.SUCCESS;
        if (self.mBalances[_from] < _amount) {
            restrictionCode = MessagesAndCodes.Reason.INSUFFICIENT_FUND_ERROR;
        } else if (_amount <= 0 && self.mBalances[_to].add(_amount) <= self.mBalances[_to]) {
            restrictionCode = MessagesAndCodes.Reason.INVALID_ERROR;
        } else if (self.shareHolders[_from].isWithhold) {
            restrictionCode = MessagesAndCodes.Reason.ACCOUNT_WITHHOLD_ERROR;
        }
        return restrictionCode;
    }
    
    
    function _messageForTransferRestriction_ (uint8 restrictionCode) internal pure returns (string memory){
        return MessagesAndCodes.appCode(restrictionCode);
    }
    
    function _addToEscrow_(Sharing.DataToken storage self, address _holder, uint _amount) internal returns(uint totalInEscrow) {
        require(self.mBalances[_holder] >= _amount, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.INSUFFICIENT_FUND_ERROR)));
        self.mBalances[_holder] = self.mBalances[_holder].sub(_amount);
        self.mExchangeEscrow[_holder] = self.mExchangeEscrow[_holder].add(_amount);
        totalInEscrow = self.mExchangeEscrow[_holder];
    }
    
    function _removeFromEscrow_(Sharing.DataToken storage self, address _holder, uint _amount) internal returns(uint totalInEscrow) {
        require(self.mExchangeEscrow[_holder] >= _amount, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.INSUFFICIENT_FUND_ERROR)));
        self.mExchangeEscrow[_holder] = self.mExchangeEscrow[_holder].sub(_amount);
        self.mBalances[_holder] = self.mBalances[_holder].add(_amount);
        totalInEscrow = self.mExchangeEscrow[_holder];
    }
    
    function _totalInEscrow_(Sharing.DataToken storage self, address _holder) internal view returns(uint total) {
       return self.mExchangeEscrow[_holder];
    }
    
    function _addToLoanEscrow_(Sharing.DataToken storage self, address _holder, uint _amount, bytes32 _loanId) internal returns(uint totalInEscrow) {
        require(self.mBalances[_holder] >= _amount, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.INSUFFICIENT_FUND_ERROR)));
        self.mBalances[_holder] = self.mBalances[_holder].sub(_amount);
        self.shareHolders[_holder].sitBalances.loanEscrow = self.shareHolders[_holder].sitBalances.loanEscrow.add(_amount);
        _addToLoanEscrow(self, _holder, _amount, _loanId, now);
        totalInEscrow = self.shareHolders[_holder].sitBalances.loanEscrow;
    }
        
    function _getRecordByCat_(Sharing.DataToken storage self, address _holder, Sharing.TokenCat _sitCat, bytes32 _recordId) internal view returns ( bytes32 recordId, uint256 amount, uint256 dateAdded, bool isMovedToTradable, bool isWithdrawn) {
        
        if (Sharing.TokenCat.Lien == _sitCat) {
            Sharing.Lien memory _lien;
            _lien = self.mLiens[_holder][_recordId];
                    
            return(_recordId,_lien.amount, _lien.dateAdded, _lien.isMovedToTradable, _lien.isWithdrawn);
        } else  if (Sharing.TokenCat.Loan == _sitCat) {
            Sharing.Loan memory _loan;
            _loan = self.mLoanEscrow[_holder][_recordId];
                    
            return(_recordId, _loan.amount, _loan.dateAdded, _loan.isMovedToTradable, _loan.isWithdrawn);
        } else  if (Sharing.TokenCat.Upfront == _sitCat) {
            Sharing.Upfront memory _upfront;
            _upfront = self.mUpfronts[_holder][_recordId];
                    
            return(_recordId, _upfront.amount, _upfront.dateAdded, _upfront.isMovedToTradable, _upfront.isWithdrawn);
        } 
    }

    function _addToUpfront (Sharing.DataToken storage self, address _holder, uint _amount, bytes32 _upfrontId, uint _dateAdded) internal returns(bool success) {
        self.mUpfronts[_holder][_upfrontId] = Sharing.Upfront(_amount, _dateAdded, false, false);
        emit NewUpfront(_holder, _amount, _upfrontId, _dateAdded);
        return true;
    }
    
    function _addToLoanEscrow (Sharing.DataToken storage self, address _holder, uint _amount, bytes32 _loanId, uint _dateAdded) internal returns(bool success) {
        self.mLoanEscrow[_holder][_loanId] = (Sharing.Loan(_amount, _dateAdded, false, false));
        emit NewLoan(_holder, _amount, _loanId, _dateAdded);
        return true;
    }
    
    function _addToLien (Sharing.DataToken storage self, address _holder, uint _amount, bytes32 _lienId, uint _dateAdded) internal returns(bool success) {
        self.mLiens[_holder][_lienId] = Sharing.Lien(_amount, _dateAdded, false, false);
        emit NewLien(_holder, _amount, _lienId, _dateAdded);
        return true;
    }    
    
    function _moveToTradable_(Sharing.DataToken storage self, address _holder, Sharing.TokenCat _sitCat, bytes32 _recordId) internal returns (string memory success) {
        
        if (Sharing.TokenCat.Lien == _sitCat) {
            require(!self.mLiens[_holder][_recordId].isMovedToTradable, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.NOTALLOWED_ERROR)));
            require(!self.mLiens[_holder][_recordId].isWithdrawn, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.NOTALLOWED_ERROR)));
            self.mLiens[_holder][_recordId].isMovedToTradable = true;
            self.mBalances[_holder] = self.mBalances[_holder].add(self.mLiens[_holder][_recordId].amount);
            emit MovedToTradable(_holder,_sitCat, _recordId);
        // } 
        // else  if (Sharing.TokenCat.Loan == _sitCat) {
        //     require(!self.mLoanEscrow[_holder][_recordId].isMovedToTradable, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.NOTALLOWED_ERROR)));
        //     require(!self.mLoanEscrow[_holder][_recordId].isWithdrawn, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.NOTALLOWED_ERROR)));
        //     self.mLoanEscrow[_holder][_recordId].isMovedToTradable = true;
        //     self.mBalances[_holder] = self.mBalances[_holder].add(self.mLoanEscrow[_holder][_recordId].amount);
        //     emit MovedToTradable(_holder,_sitCat, _recordId);
        } else  if (Sharing.TokenCat.Upfront == _sitCat) {
            require(!self.mUpfronts[_holder][_recordId].isMovedToTradable, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.NOTALLOWED_ERROR)));
            require(!self.mUpfronts[_holder][_recordId].isWithdrawn, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.NOTALLOWED_ERROR)));
            self.mUpfronts[_holder][_recordId].isMovedToTradable = true;
            self.mBalances[_holder] = self.mBalances[_holder].add(self.mUpfronts[_holder][_recordId].amount);
            emit MovedToTradable(_holder,_sitCat, _recordId);
        } 
        success = MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.SUCCESS));
    }
    
    function _addShareholder_(Sharing.DataToken storage self, address _holder, bool _isWithhold) internal returns(string memory success) { 
        require(!self.shareHolders[_holder].uniqueHolder, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.UNIQUENESS_ERROR)));
        Sharing.SitBalanceByCat memory _holderBalance = Sharing.SitBalanceByCat(0, 0, 0);
        self.shareHolders[_holder] = Sharing.SitHolder(true,_isWithhold, _holderBalance);
        self.mBalances[_holder] = 100;
        emit NewShareholder(_holder);
        return MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.SUCCESS));
    }
    
    function _getShareHolder_(Sharing.DataToken storage self, address _holder) internal view returns(address shareholder, bool isWithhold, uint tradable, uint upfront, uint lien ) { 
        return (_holder, self.shareHolders[_holder].isWithhold, self.mBalances[_holder], self.shareHolders[_holder].sitBalances.upfront, self.shareHolders[_holder].sitBalances.lien);
    }

    function _updateShareHolder_(Sharing.DataToken storage self, address _holder, bool _isWithhold) internal returns(string memory success) { 

        self.shareHolders[_holder].isWithhold = _isWithhold;           
        emit shareHolderUpdated(_holder, _isWithhold);
        return MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.SUCCESS));
    }
    
    function _removeShareHolder_(Sharing.DataToken storage self, address _holder) internal returns(string memory success) { 
        delete self.shareHolders[_holder];
        emit shareHolderRemoved(_holder);
        return  MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.SUCCESS));
    }
    
    function _withdraw_(Sharing.DataToken storage self, uint8 _granularity, address _coinBase, address _holder, uint256 _amount, Sharing.TokenCat _sitCat, bytes32 _recordId, bytes memory _reason) internal returns (string memory success) {
        
        if(_amount % _granularity != 0) {
          return MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.TOKEN_GRANULARITY_ERROR));
        }
        if (Sharing.TokenCat.Lien == _sitCat) {
            require(!self.mLiens[_holder][_recordId].isMovedToTradable, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.NOTALLOWED_ERROR)));
            self.mLiens[_holder][_recordId].amount = 0;
            self.mLiens[_holder][_recordId].isWithdrawn = true;
            self.shareHolders[_holder].sitBalances.lien = self.shareHolders[_holder].sitBalances.lien.sub(_amount);
        // } else  if (Sharing.TokenCat.Loan == _sitCat) {
        //     require(!self.mLoanEscrow[_holder][_recordId].isMovedToTradable, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.NOTALLOWED_ERROR)));
        //     self.mLoanEscrow[_holder][_recordId].amount = 0;
        //     self.mLoanEscrow[_holder][_recordId].isWithdrawn = true;
        //     self.shareHolders[_holder].sitBalances.loanEscrow = self.shareHolders[_holder].sitBalances.loanEscrow.sub(_amount);
        } else if (Sharing.TokenCat.Upfront == _sitCat) {
            require(!self.mUpfronts[_holder][_recordId].isMovedToTradable, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.NOTALLOWED_ERROR)));
            self.mUpfronts[_holder][_recordId].amount = 0;
            self.mUpfronts[_holder][_recordId].isWithdrawn = true;
            self.shareHolders[_holder].sitBalances.upfront = self.shareHolders[_holder].sitBalances.upfront.sub(_amount);
        } else if (Sharing.TokenCat.Tradable == _sitCat) {
            require(_balanceOf_(self, _holder) >= _amount, MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.INSUFFICIENT_FUND_ERROR)));
            self.mBalances[_holder] = self.mBalances[_holder].sub(_amount);
        }
        
        self.mBalances[_coinBase] = self.mBalances[_coinBase].add(_amount);
        emit Withdrawn(msg.sender, _holder, _sitCat, _amount, _recordId, _reason);
        return MessagesAndCodes.appCode(uint8(MessagesAndCodes.Reason.SUCCESS));
    }
}
