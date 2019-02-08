var fs = require("fs");
var path = require("path");
const { web3, EthereumTx } = require("../base");
var linker = require("solc/linker");

const { compiledTokenContract, compiledTokenFuncLib } = require("./compile.js");

//Get all accounts
async function deploy() {
  try {
    const accounts = await web3.eth.getAccounts();

    // let tokenFunc = await new web3.eth.Contract(compiledTokenFuncLib.abi)
    //   .deploy({ data: compiledTokenFuncLib.evm.bytecode.object })
    //   .send({ from: accounts[1], gas: "6500000" });

    // compiledTokenContract.evm.bytecode.object = await linker.linkBytecode(
    //   compiledTokenContract.evm.bytecode.object,
    //   {
    //     $$87be8fe1683d613b14bf4e174735ea236d$$: tokenFunc.options.address
    //   }
    // );
    // console.log("linked >> ", compiledTokenContract.evm.bytecode.object);

    // fs.writeFile(
    //   path.join(__dirname, "token.json"),
    //   compiledTokenContract,
    //   function(err) {
    //     if (err) {
    //       return console.log(err);
    //     }
    //     console.log("Token Json written to file");
    //   }
    // );

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

    // console.log("timeout >> ", web3.eth.transactionBlockTimeout);
    const privateKey = Buffer.from(
      "825b825f2b3ad4f258ef195b605d9cda5e0f974b4187fe4371ec9b37ae3f5973",
      "hex"
    );
    const data = await new web3.eth.Contract(compiledTokenContract.abi)
      .deploy({
        data: compiledTokenContract.evm.bytecode.object,
        arguments: [
          "SIT",
          "Sterling Investment Token",
          1,
          "0x0b544baabb787e3a9ccd68e6ca3e7a9a753fe50e",
          "0xbb723b459f84c24665a89159d94701321864e5d0"
        ]
      })
      .encodeABI();

    const gasPrice = 5;
    var nounce = await web3.eth.getTransactionCount(
      "0x87741ffaf59aa62fb42e26fba4d25daffbf2987f",
      "pending"
    );

    const gasUsed = await new web3.eth.Contract(compiledTokenContract.abi)
      .deploy({
        data: compiledTokenContract.evm.bytecode.object,
        arguments: [
          "SIT",
          "Sterling Investment Token",
          1,
          "0x0b544baabb787e3a9ccd68e6ca3e7a9a753fe50e",
          "0xbb723b459f84c24665a89159d94701321864e5d0"
        ]
      })
      .estimateGas({
        from: "0x87741ffaf59aa62fb42e26fba4d25daffbf2987f"
      });
    console.log("gasUsed >> ", gasUsed);
    const txParams = {
      nonce: nounce,
      gasLimit: 8000000000000,
      gasPrice: gasPrice * 1000000000,
      from: "0x87741ffaf59aa62fb42e26fba4d25daffbf2987f",
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
