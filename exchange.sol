pragma solidity ^0.5.0;
// pragma experimental SMTChecker;

import "../library/safeMath.sol";

contract SIT {

    using SafeMath for uint256;

    event ExchangeRate(uint _min, uint _max);

    struct Offering {
        uint price;
        uint amount;
    }

    struct Rate {
        uint minimum;
        uint maximum;
    }

    struct ExchangeInfo {
        string tokenName;
        address tokenAddress;
        address tokenManager;
    }


        
    // Exchange Info
    Rate public exchangeRate;
    mapping(address => uint) userId; // Address can be in any of the 4 cat of SIT
    mapping(address => bool) public enabledUsers; // xchange
    mapping(address => Offering[]) UserToSitForSale; //maps users who have put up their SIT for sale to an offering; xchange
    Offering[] public offerings;


    constructor (string memory _symbol, string memory _name, uint _total, uint _maxSupply) public {
     
    }

    // jonnathan col.....check out 

    function setRate(uint _min, uint _max) public onlyOwner  {

        require(_max >= _min, "Maximum exchange rate should not be less than _minimum");
        exchangeRate = Rate(_min, _max);

        emit ExchangeRate(_min, _max);
    }

    
    function enableUser(address _recipient) public onlyOwner returns (bool) {
        
        enabledUsers[_recipient] = true;
        return true;
    }

    function disableUser(address _recipient) public onlyOwner returns (bool) {
        enabledUsers[_recipient] = false;
        return true;
    }

}