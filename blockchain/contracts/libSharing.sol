pragma solidity >=0.4.0 <0.6.0;


/**
* @title Sharing
* @dev This library is used for sharing static data within libraries".
*/
library Sharing {
    enum ScheduleType { PayScheme, UpfrontScheme}
    enum TokenCat { Tradable, Lien, Allocated, Vesting }
    
    // Token Scheduler
    
    struct Authorising {
        address authorizer;
        bytes reason;
    }
    struct Schedule {
        uint amount;
        uint activeAmount;
        bool isApproved;
        bool isRejected;
        bool isActive;
        uint8 authorizedCount;
        Sharing.ScheduleType scheduleType;
        mapping(uint => Authorising) authorizedBy;
    }
    
    struct DataSchedule {
        mapping(uint256 => Schedule) mMintSchedules;
        mapping (address => bool) trackApproves;
    }
    
    // Owner 
    
    struct DataOwner {
        address _owner;
    }
    
    
    // Authorizer
    struct Authorizer {
        bool isUnique;
        address authorizer;
        Sharing.ScheduleType authorizerType; // Type can be montly or custom
    }
    
    struct TrackIndex {
        bool isUnique;
        uint index;
    }
    
    struct DataAuthorizer {
        mapping(address => TrackIndex) authorizerToIndex;
        Authorizer[] mAuthorizers;
    }
    
    // Token Data
     
    struct DataToken {
        mapping(address => bool) administrators; 
        uint256 uTotalSupply;
        mapping(address => uint256) mBalances; //The tradable balance for SITHolders
        mapping (address => mapping (address => uint256)) mAllowed;
        mapping(address => Lien[]) mLiens;
        mapping(address => Allocated[]) mAllocations;
        mapping(address => Vesting[]) mVestings;
        mapping(address => SitHolder) shareHolders; 
    }
    
    struct Lien {
        uint amount;
        uint dateAdded;
        uint lienPeriod;
        bool isWithdrawn;
        bool isMovedToTradable;
    }

    struct Vesting {
        uint amount;
        uint dateAdded;
        bool isWithdrawn;
        bool isMovedToTradable;
    }

    struct Allocated {
        uint amount;
        uint dateAdded;
        uint dueDate;
        bool isWithdrawn;
        bool isMovedToTradable;
    }

    struct SitBalanceByCat {
        uint256 allocated;
        uint256 vesting;
        uint256 lien;
    }
    
    struct SitHolder {
        bool uniqueHolder;
        bool isEnabled;
        bool isWithhold;
        SitBalanceByCat sitBalances;
    }
}
