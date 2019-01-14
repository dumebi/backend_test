pragma solidity >=0.4.0 <0.6.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/sit.sol";

contract TestSitContract {
    
    function testStringsEqual() public {

        SIT mycontract = new SIT("SIT","Sterling",1,address(0x6a0E53381008EDe2515681d885a7Fa745089bd9C));
        string memory string1 = "oluchi";
        string memory string2 = "oluchi";
        Assert.equal(mycontract.stringsEqual(string1, string2), true, "The two strings are expected to be equal");
    }
}