// Test for:
// Ensure that the choosen player gets paid completely on calling the pickWinner function
//     - Ensure only manager calls this
//     - ensure the winner account gets increased
//     - ensure the contract balance is empty after this call
//     - ensure the players variable is initialized to empty
// Players can enter the lottery
//     - Ensure after the enter function is called the players length increases and the last player added to the array is same as the msg.sender
//     - ensure the players do not contain the manager address
//     - ensure player do not join with amount

const assert = require("assert");
const { web3, EthereumTx } = require("./../libraries/base");

var accounts;
var contractInst;
var deployedContractAddr;
beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  const { compiledTokenContract } = require("../libraries/deploy/compile.js");

  deployedContractAddr = "0x1620782a3d70b48720af013cc8d206b2a90727e5";
  const contractABI = compiledTokenContract.abi;
  const contract = await new web3.eth.Contract(
    contractABI,
    deployedContractAddr
  );
  contractInst = contract.methods;
  // console.log("contractInst << ", contractInst);
});

describe("Token Smart Contract", () => {
  describe("Token Deployment", () => {
    describe("Token Details", () => {
      it("It has value for contract owner", async () => {
        try {
          let expectedOwner = "0xbb723b459f84c24665a89159d94701321864e5d0";
          const owner = await contractInst.owner().call({ from: accounts[0] });
          assert.equal(owner, accounts[0]);
        } catch (error) {
          console.log("error >> ", error);
        }
      });
      it("It has value for contract name", async () => {
        try {
          let expectedName = "Sterling Investment Token";
          const name = await contractInst.sName().call({ from: accounts[0] });
          assert.equal(name, expectedName);
        } catch (error) {
          console.log("error >> ", error);
        }
      });
      it("It has value for contract symbol", async () => {
        try {
          let expectedSymbol = "SIT";
          const symbol = await contractInst
            .sSymbol()
            .call({ from: accounts[0] });
          assert.equal(symbol, expectedSymbol);
        } catch (error) {
          console.log("error >> ", error);
        }
      });
      it("It has value for contract tokenbase", async () => {
        try {
          let expectedTokenBase = "0x0b544baabb787e3a9ccd68e6ca3e7a9a753fe50e";
          const tokenBase = await contractInst
            .aCoinbaseAcct()
            .call({ from: accounts[0] });
          assert.equal(
            tokenBase.toLowerCase(),
            expectedTokenBase,
            "Wrong tokenbase address"
          );
        } catch (error) {
          console.log("error >> ", error);
        }
      });
      it("It has value for contract granularity", async () => {
        try {
          let expectedGranularity = 1;
          const granularity = await contractInst
            .uGranularity()
            .call({ from: accounts[0] });
          assert.equal(granularity, expectedGranularity);
        } catch (error) {
          console.log("error >> ", error);
        }
      });
      // it("It has value for contract manager", async () => {
      //   try {
      //     let expectedResult = "0x87741ffaf59aa62fb42e26fba4d25daffbf2987f";
      //     const manager = await contractInst
      //       .aManager()
      //       .call({ from: accounts[0] });
      //     assert.equal(manager, expectedResult);
      //   } catch (error) {
      //     console.log("error >> ", error);
      //   }
      // });
    });

    describe("Linked Dependencies", () => {
      it("It should deploy and link authorizer library", async () => {
        try {
          // const _privateKey =
          //   "c32214f0887908a8607c9db7d79b87531ae939a40056c3a7858f532d3f8408de";
          // const privateKey = Buffer.from(_privateKey, "hex");
          // const data = await contractInst
          //   .addAuthorizer(accounts[9], 1)
          //   .encodeABI();
          // const gasPrice = 2000;
          // var nounce = await web3.eth.getTransactionCount(
          //   accounts[0],
          //   "pending"
          // );
          // const gasUsed = await contractInst
          //   .addAuthorizer(accounts[9], 1)
          //   .estimateGas({
          //     from: accounts[0]
          //   });
          // const txParams = {
          //   nonce: nounce,
          //   gasLimit: gasUsed,
          //   gasPrice: gasPrice * 1000000000,
          //   from: accounts[0],
          //   to: deployedContractAddr,
          //   data,
          //   chainId: 5777
          // };
          // const tx = await new EthereumTx(txParams);
          // tx.sign(privateKey);
          // const serializedTx = tx.serialize();
          // await web3.eth.sendSignedTransaction(
          //   "0x" + serializedTx.toString("hex")
          // );

          const result = await contractInst
            .getAuthorizer(accounts[9], 0)
            .call({ from: accounts[0] });
          assert.equal(
            result.authorizerAddr,
            accounts[9],
            "Authorizer library or authorizer was not added properly"
          );
          assert.equal(
            result.authorizerType,
            1,
            "authorizer type was not gotten"
          );
        } catch (error) {
          console.log("error >> ", error);
        }
      });
      it("It should deploy and link tokenFunc library", async () => {
        try {
          const result = await contractInst
            .totalSupply()
            .call({ from: accounts[0] });
          assert.equal(
            result,
            0,
            "Can't get total supply of tokens from tokenFunc"
          );
        } catch (error) {
          console.log("error >> ", error);
        }
      });
      it("It should deploy and link tokenScheduler library", async () => {
        try {
          const gasPrice = 2000;
          const data = await contractInst
            .createSchedule(
              1,
              400,
              1,
              web3.utils.toHex("Tesing library deployment")
            )
            .encodeABI();
          const _privateKey =
            "c32214f0887908a8607c9db7d79b87531ae939a40056c3a7858f532d3f8408de";
          const privateKey = Buffer.from(_privateKey, "hex");
          var nounce = await web3.eth.getTransactionCount(accounts[0]);
          const gasUsed = await contractInst
            .createSchedule(
              1,
              400,
              1,
              web3.utils.toHex("Tesing library deployment")
            )
            .estimateGas({
              from: accounts[0]
            });

          const txParams = {
            nonce: nounce,
            gasLimit: gasUsed,
            gasPrice: gasPrice * 1000000000,
            from: accounts[0],
            to: deployedContractAddr,
            data,
            chainId: 5777
          };

          const tx = await new EthereumTx(txParams);
          tx.sign(privateKey);
          const serializedTx = tx.serialize();
          const transactionId = await web3.eth.sendSignedTransaction(
            "0x" + serializedTx.toString("hex")
          );

          const schedule = await contractInst
            .getSchedule(1)
            .call({ from: accounts[0] });

          assert.equal(
            schedule.amount,
            400,
            "TokenSheduler not deployed and linked properly to contract"
          );
        } catch (error) {
          console.log("error >> ", error);
        }
      });
    });
  });

  describe("Authorizer Library", () => {
    it("It should add an authorizer", async () => {
      try {
        const _privateKey =
          "c32214f0887908a8607c9db7d79b87531ae939a40056c3a7858f532d3f8408de";
        const privateKey = Buffer.from(_privateKey, "hex");
        const data = await contractInst
          .addAuthorizer(accounts[8], 1)
          .encodeABI();
        const gasPrice = 2000;
        var nounce = await web3.eth.getTransactionCount(accounts[0], "pending");
        const gasUsed = await contractInst
          .addAuthorizer(accounts[8], 1)
          .estimateGas({
            from: accounts[0]
          });
        const txParams = {
          nonce: nounce,
          gasLimit: gasUsed,
          gasPrice: gasPrice * 1000000000,
          from: accounts[0],
          to: deployedContractAddr,
          data,
          chainId: 5777
        };
        const tx = await new EthereumTx(txParams);
        tx.sign(privateKey);
        const serializedTx = tx.serialize();
        await web3.eth.sendSignedTransaction(
          "0x" + serializedTx.toString("hex")
        );
      } catch (error) {
        console.log("error >> ", error);
      }
    });
  });
});
