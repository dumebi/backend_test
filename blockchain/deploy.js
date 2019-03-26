var { ethers, ethProvider } = require("../libraries/base.js");
const { compiledTokenContract, compiledTokenScheduleLib } = require("./compile.js");
var linker = require("solc/linker");
require('dotenv').config();

// Load the wallet to deploy the contract with
let privateKey = '0x639c4793182b4d1577b191bb9dd113f9c7224c26afe082c51b55e2b0f01fecf0';
let wallet = new ethers.Wallet(privateKey, ethProvider);

(async function() {

    const tokenScheduleLib = new ethers.ContractFactory(compiledTokenScheduleLib.abi, compiledTokenScheduleLib.evm.bytecode, wallet)
    await tokenScheduleLib.deploy()
    console.log("tokenScheduleLib >> ", tokenScheduleLib.address)
    await tokenScheduleLib.deployed()

    compiledTokenContract.evm.bytecode.object = await linker.linkBytecode(
      compiledTokenContract.evm.bytecode.object,
      {
        $f7052eb780b0b8a74d049ee05427d21ee6$ : tokenScheduleLib.address
      }
    );
    console.log("linked >> ", compiledTokenContract.evm.bytecode.object);
    // Token Contract interface & bytecode
    let abi = compiledTokenContract.abi
    let bytecode = compiledTokenContract.evm.bytecode

    // Create an instance of a Contract Factory for the Token contract
    let factory = new ethers.ContractFactory(abi, bytecode, wallet);

    let contract = await factory.deploy(
            "SIT",
            "Sterling Investment Token",
            1,
            "0x0f08e214c8311c05bc16c0d65cd7f23231bdf1ca",
            "0xca8323e6268cb4e5c36c51dc94a68db47d3e0d18");
        
    process.env.TEST_CONTRACT_ADDRESS = await contract.address;
    console.log("env TEST_CONTRACT_ADDRESS >>> ", process.env.TEST_CONTRACT_ADDRESS, '\n')
    // process.stdout.write(contract.address);
    await contract.deployed()

})();



    // function replaceLinkReferences(bytecode, linkReferences, libraryName) {
    //   var linkId = "__" + libraryName;
    
    //   while (linkId.length < 40) {
    //     linkId += "_";
    //   }
    
    //   linkReferences.forEach(function(ref) {
    //     // ref.start is a byte offset. Convert it to character offset.
    //     var start = (ref.start * 2) + 2;
    
    //     bytecode = bytecode.substring(0, start) + linkId + bytecode.substring(start + 40);
    //   });
    
    //   return bytecode;
    // };