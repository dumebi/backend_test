var { ethers, ethProvider } = require("../libraries/base.js");
const { compiledTokenContract, compiledTokenFuncLib } = require("./compile.js");
var linker = require("solc/linker");
const utils = require('../helpers/utils');
require('dotenv').config();

// The Contract interface
let abi = compiledTokenContract.abi

// The bytecode from Solidity, compiling the above source
let bytecode = compiledTokenContract.evm.bytecode

// Load the wallet to deploy the contract with
let privateKey = '0x2b3f39c11f8d9d8c5313517de66722e0adfe6ec41fbbd4273255ca11d064f54a';
let wallet = new ethers.Wallet(privateKey, ethProvider);

(async function() {

  
    // compiledTokenContract.evm.bytecode.object = await linker.linkBytecode(
    //   compiledTokenContract.evm.bytecode.object,
    //   {
    //     $$87be8fe1683d613b14bf4e174735ea236d$$: tokenFunc.options.address
    //   }
    // );
    // console.log("linked >> ", compiledTokenContract.evm.bytecode.object);
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

    // Create an instance of a Contract Factory
    let factory = new ethers.ContractFactory(abi, bytecode, wallet);

    let contract = await factory.deploy(
            "SIT",
            "Sterling Investment Token",
            1,
            "0x368eb314285235b7f692fbf14d075760e957848e",
            "0x35ab166f5a524ee576ae6cd3adeef87feb0b7b51");
        
    process.env.TEST_CONTRACT_ADDRESS = await contract.address;
    process.env.CONTRACT_ADDRESS = "contract.address"
    // console.log("env >>> ", process.env.TEST_CONTRACT_ADDRESS)
    utils.config.contract = contract.address
    process.stdout.write(contract.address);
    
    await contract.deployed()

})();