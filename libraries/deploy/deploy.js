var bip39 = require("bip39");
const { web3, EthereumTx } = require("../base");
var linker = require("solc/linker");

const {
  compiledTokenContract,
  compiledMessagesLibrary,
  compiledAuthorizerLib,
  compiledOwnerLib,
  compiledTokenFuncLib,
  compiledTokenScheduleLib
} = require("./compile.js");

//Get all accounts
async function deploy() {
  try {
    const accounts = await web3.eth.getAccounts();

    let msgLib = await new web3.eth.Contract(compiledMessagesLibrary.abi)
      .deploy({ data: compiledMessagesLibrary.evm.bytecode.object })
      .send({ from: accounts[1], gas: "6500000" });

    // let authorizer = await new web3.eth.Contract(compiledAuthorizerLib.abi)
    //   .deploy({ data: compiledAuthorizerLib.evm.bytecode.object })
    //   .send({ from: accounts[1], gas: "6500000" });

    // let owner = await new web3.eth.Contract(compiledOwnerLib.abi)
    //   .deploy({ data: compiledOwnerLib.evm.bytecode.object })
    //   .send({ from: accounts[1], gas: "6500000" });

    let tokenFunc = await new web3.eth.Contract(compiledTokenFuncLib.abi)
      .deploy({ data: compiledTokenFuncLib.evm.bytecode.object })
      .send({ from: accounts[1], gas: "6500000" });

    // let tokenSchedule = await new web3.eth.Contract(
    //   compiledTokenScheduleLib.abi
    // )
    //   .deploy({ data: compiledTokenScheduleLib.evm.bytecode.object })
    //   .send({ from: accounts[0], gas: "6500000" });

    // const MyContract = await new web3.eth.Contract(compiledTokenContract.abi);
    // var bytecodeWithParam = MyContract.new.getData(
    //   "SIT",
    //   "Sterling Investment Token",
    //   1,
    //   "0x0b544BaabB787e3A9CcD68e6ca3e7a9A753fE50E",
    //   { data: compiledTokenContract.evm.bytecode }
    // );

    // let token = await MyContract(compiledTokenContract.abi)
    //   .deploy({ data: bytecodeWithParam })
    //   .send({ from: accounts[0], gas: "6500000" });
    // const tokenToHex = await web3.utils.toHex(
    //   compiledTokenContract.evm.bytecode
    // );
    console.log(compiledTokenContract.evm.bytecode);
    compiledTokenContract.evm.bytecode.object = await linker.linkBytecode(
      compiledTokenContract.evm.bytecode.object,
      {
        $87be8fe1683d613b14bf4e174735ea236d$: msgLib.options.address,
        $78db8394021623a37b514b2cea0f60d732$: tokenFunc.options.address
      }
    );

    // let token = await new web3.eth.Contract(compiledTokenContract.abi)
    //   .deploy({
    //     data: compiledTokenContract.evm.bytecode.object),
    //     arguments: [
    //       "SIT",
    //       "Sterling Investment Token",
    //       1,
    //       "0x0b544BaabB787e3A9CcD68e6ca3e7a9A753fE50E"
    //     ]
    //   })
    //   .send({
    //     from: accounts[0],
    //     gasLimit: "3000000",
    //     gasPrice: "2000000"
    //   });

    // new web3.eth.Contract(compiledTokenContract.abi)
    //   .deploy({
    //     data: web3.utils.toHex(compiledTokenContract.evm.bytecode.object),
    //     arguments: [
    //       "SIT",
    //       "Sterling Investment Token",
    //       1,
    //       "0x0b544BaabB787e3A9CcD68e6ca3e7a9A753fE50E"
    //     ]
    //   })
    //   .send({ from: accounts[0], gasLimit: "30000000", gasPrice: "2000" })
    //   .on("transactionHash", transactionHash => {
    //     console.log("error is >> ", transactionHash);
    //   })
    //   .on("receipt", receipt => {
    //     console.log("receipt >> ", receipt.contractAddress); // contains the new contract address
    //   })
    //   .on("confirmation", (confirmationNumber, receipt) => {
    //     console.log("confirmationNumber >> ", confirmationNumber);
    //   })
    //   .on("error", error => {
    //     console.log("error is >> ", error);
    //   })
    //   .then(newContractInstance => {
    //     console.log(newContractInstance.options.address); // instance with the new contract address
    //   });
    // console.log("bytecode >> ", token);
    console.log("timeout >> ", web3.eth.transactionBlockTimeout);
    const privateKey = Buffer.from(
      "c32214f0887908a8607c9db7d79b87531ae939a40056c3a7858f532d3f8408de",
      "hex"
    );
    const data = await new web3.eth.Contract(compiledTokenContract.abi)
      .deploy({
        data: compiledTokenContract.evm.bytecode.object,
        arguments: [
          "SIT",
          "Sterling Investment Token",
          1,
          "0x0b544BaabB787e3A9CcD68e6ca3e7a9A753fE50E"
        ]
      })
      .encodeABI();

    const gasPrice = 5;
    var nounce = await web3.eth.getTransactionCount(
      "0xBb723B459F84c24665a89159d94701321864e5d0",
      "pending"
    );

    const gasUsed = await new web3.eth.Contract(compiledTokenContract.abi)
      .deploy({
        data: compiledTokenContract.evm.bytecode.object,
        arguments: [
          "SIT",
          "Sterling Investment Token",
          1,
          "0x0b544baabb787e3a9ccd68e6ca3e7a9a753fe50e"
        ]
      })
      .estimateGas({
        from: "0xBb723B459F84c24665a89159d94701321864e5d0"
      });
    console.log("gasUsed >> ", gasUsed);
    const txParams = {
      nonce: nounce,
      gasLimit: 8000000000000,
      gasPrice: gasPrice * 1000000000,
      from: "0xBb723B459F84c24665a89159d94701321864e5d0",
      data,
      chainId: 5777
    };

    const tx = await new EthereumTx(txParams);
    tx.sign(privateKey); // tx.gasPrice =
    const serializedTx = tx.serialize();
    const transactionId = await web3.eth.sendSignedTransaction(
      "0x" + serializedTx.toString("hex")
    );

    console.log("transactionId >> ", transactionId);
  } catch (error) {
    console.log("err > ", error);
  }
}

deploy();
module.exports = compiledTokenFuncLib.abi;
