var { ethers, ethProvider } = require("../libraries/base.js");
const { compiledTokenContract, compiledTokenScheduleLib } = require("./compile.js");
var linker = require("solc/linker");
require('dotenv').config();

// Load the wallet to deploy the contract with
let privateKey = process.env.CONTRACT_OWNER_KEY;
let wallet = new ethers.Wallet(privateKey, ethProvider);

// Deployment Params

const symbol = process.argv[2]
const name = process.argv[3]
const granularity = process.argv[4]
const owner = process.argv[5]
const tokenbase = process.argv[6] 

(async function() {

    const tokenScheduleLib = new ethers.ContractFactory(compiledTokenScheduleLib.abi, compiledTokenScheduleLib.evm.bytecode, wallet)
    const tokenScheduler = await tokenScheduleLib.deploy()
    tokenScheduler.deployed()
    console.log("tokenScheduleLib >> ", tokenScheduler.address)

    compiledTokenContract.evm.bytecode.object = await linker.linkBytecode(
      compiledTokenContract.evm.bytecode.object,
      {
        $f7052eb780b0b8a74d049ee05427d21ee6$ : tokenScheduler.address
      }
    );
    console.log("linked >> ", compiledTokenContract.evm.bytecode.object);
    // Token Contract interface & bytecode
    let abi = compiledTokenContract.abi
    let bytecode = compiledTokenContract.evm.bytecode

    // Create an instance of a Contract Factory for the Token contract
    let factory = new ethers.ContractFactory(abi, bytecode, wallet);

    let contract = await factory.deploy(
            symbol,
            name,
            granularity,
            owner,
            tokenbase);
        
    process.env.TEST_CONTRACT_ADDRESS = await contract.address;
    console.log("env TEST_CONTRACT_ADDRESS >>> ", process.env.TEST_CONTRACT_ADDRESS, '\n')
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