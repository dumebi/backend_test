pragma solidity >=0.4.0 <0.6.0;

library MessagesAndCodes {

    enum Reason  {
        SUCCESS,
        FAILURE,
        UNIQUENESS_ERROR,
        INVALID_ERROR,
        UNAUTHORIZED_ERROR,
        NOTFOUND_ERROR,
        NOTALLOWED_ERROR,
        UNVERIFIED_HOLDER,
        INVALID_PARAMS_ERROR,
        RECEIPT_TRANSFER_BLOCKED,
        SEND_TRANSFER_BLOCKED,
        TOKEN_GRANULARITY_ERROR,
        TRANSFER_VERIFIED_ERROR,
        INSUFFICIENT_FUND_ERROR,
        SPENDER_BALANCE_ERROR,
        ACCOUNT_WITHHOLD_ERROR,
        MOVE_LIEN_ERROR,
        UNVERIFIED_HOLDER_ERROR,
        ZERO_SCHEDULE_ERROR,
        INVALID_MINT_ERROR
        
    }
    

    function appCode(uint8 _code) internal pure returns (string memory code) {
        if(_code == uint8(Reason.SUCCESS)){
            return "SUCCESS";
        }else if(_code == uint8(Reason.FAILURE)){
            return "FAILURE";
        }else if(_code == uint8(Reason.UNIQUENESS_ERROR)){
            return "UNIQUENESS_ERROR";
        }else if(_code == uint8(Reason.INVALID_ERROR)){
            return "INVALID_ERROR";
        }else if(_code == uint8(Reason.UNAUTHORIZED_ERROR)){
            return "UNAUTHORIZED_ERROR";
        }else if(_code == uint8(Reason.NOTFOUND_ERROR)){
            return "NOTFOUND_ERROR";
        }else if(_code == uint8(Reason.NOTALLOWED_ERROR)){
            return "NOTALLOWED_ERROR";
        }else if(_code == uint8(Reason.INVALID_PARAMS_ERROR)){
            return "INVALID_PARAMS_ERROR";
        }else if(_code == uint8(Reason.UNVERIFIED_HOLDER)){
            return "UNVERIFIED_HOLDER";
        }else if(_code == uint8(Reason.RECEIPT_TRANSFER_BLOCKED)){
            return "RECEIPT_TRANSFER_BLOCKED";
        }else if(_code == uint8(Reason.SEND_TRANSFER_BLOCKED)){
            return "SEND_TRANSFER_BLOCKED";
        }else if(_code == uint8(Reason.TOKEN_GRANULARITY_ERROR)){
            return "TOKEN_GRANULARITY_ERROR";
        }else if(_code == uint8(Reason.TRANSFER_VERIFIED_ERROR)){
            return "TRANSFER_VERIFIED_ERROR";
        }else if(_code == uint8(Reason.INSUFFICIENT_FUND_ERROR)){
            return "INSUFFICIENT_FUND_ERROR";
        }else if(_code == uint8(Reason.SPENDER_BALANCE_ERROR)){
            return "SPENDER_BALANCE_ERROR";
        }else if(_code == uint8(Reason.ACCOUNT_WITHHOLD_ERROR)){
            return "ACCOUNT_WITHHOLD_ERROR";
        }else if(_code == uint8(Reason.MOVE_LIEN_ERROR)){
            return "MOVE_LIEN_ERROR";
        }else if(_code == uint8(Reason.UNVERIFIED_HOLDER_ERROR)){
            return "UNVERIFIED_HOLDER_ERROR";
        }else if(_code == uint8(Reason.ZERO_SCHEDULE_ERROR)){
            return "ZERO_SCHEDULE_ERROR";
        }else if(_code == uint8(Reason.INVALID_MINT_ERROR)){
            return "INVALID_MINT_ERROR";
        }
    }

    function isFailure(uint8 _code) internal pure returns (bool) {
        return _code == 1;
    }

    function isOk(uint8 _code) internal pure returns (bool) {
        return _code == 0;
    } 
}