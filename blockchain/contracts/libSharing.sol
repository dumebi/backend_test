pragma solidity >=0.4.0 <0.6.0;


/**
* @title Sharing
* @dev This library is used for sharing static data within libraries".
*/
library Sharing {
    enum ScheduleType { PayScheme, UpfrontScheme}
    enum TokenCat { Tradable, Lien, Upfront, Loan }
    
    // Token Scheduler
    struct Schedule {
        uint amount;
        uint activeAmount;
        bool isActive;
        Sharing.ScheduleType scheduleType;
    }
    
    struct DataSchedule {
        mapping(uint256 => Schedule) mMintSchedules;
    }
    
    // Owner 
    struct DataOwner {
        address _owner;
    }

    struct TrackIndex {
        bool isUnique;
        uint index;
    }
    
    // Token Data
     
    struct DataToken {
        mapping(address => bool) administrators; 
        uint256 uTotalSupply;
        mapping(address => uint256) mBalances; //The tradable balance for SITHolders
        mapping (address => mapping (address => uint256)) mAllowed;
        mapping(address => Lien[]) mLiens;
        mapping(address => Upfront[]) mUpfronts;
        mapping(address => Loan[]) mLoanEscrow;
        mapping(address => SitHolder) shareHolders; 
        mapping(address => uint) mExchangeEscrow; 
    }
    
    struct Lien {
        uint amount;
        uint dateAdded;
        uint lienId;
        bool isWithdrawn;
        bool isMovedToTradable;
    }

    struct Loan {
        uint amount;
        uint dateAdded;
        uint loanId;
        bool isWithdrawn;
        bool isMovedToTradable;
    }

    struct Upfront {
        uint amount;
        uint dateAdded;
        uint upfrontId;
        bool isWithdrawn;
        bool isMovedToTradable;
    }

    struct SitBalanceByCat {
        uint256 upfront;
        uint256 lien;
        uint256 loanEscrow;
    }
    
    struct SitHolder {
        bool uniqueHolder;
        bool isWithhold;
        SitBalanceByCat sitBalances;
    }
}
