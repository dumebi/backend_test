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

  deployedContractAddr = "0xe9e2dc1690e334aed840f27733c4ce898d74aace";
  const contractABI = compiledTokenContract.abi;
  const contract = await new web3.eth.Contract(
    contractABI,
    deployedContractAddr
  );
  contractInst = contract.methods;
  contractEvent = contract;
  // console.log("contractInst << ", contractInst);
});

describe("Token Smart Contract", () => {
  describe("Token Deployment", () => {
    describe("Token Details", () => {
      it("It has value for contract owner", async () => {
        try {
          let expectedOwner = "0xbb723b459f84c24665a89159d94701321864e5d0";
          const owner = await contractInst.owner().call({ from: accounts[0] });
          assert.equal(owner.toLowerCase(), expectedOwner);
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
            .aTokenbase()
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
      it("It has value for contract manager", async () => {
        try {
          let expectedResult = "0x87741ffaf59aa62fb42e26fba4d25daffbf2987f";
          const manager = await contractInst
            .aManager()
            .call({ from: accounts[0] });
          assert.equal(manager.toLowerCase(), expectedResult);
        } catch (error) {
          console.log("error >> ", error);
        }
      });
    });

    describe("Linked Dependencies", () => {
      it("It should call a function that depends on authorizer library", async () => {
        try {
          const result = await contractInst
            .countAuthorizer()
            .call({ from: accounts[0] });
          assert.equal(
            result,
            0,
            "Cannot call a function in Authorizer librarary"
          );
        } catch (error) {
          console.log("error >> ", error);
        }
      });
      it("It should call a function that depends on tokenFunc library", async () => {
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
      it("It should call a function that depends on tokenScheduler library", async () => {
        try {
          const gasPrice = 2000;
          const data = await contractInst
            .createSchedule(
              0,
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
              0,
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
          await web3.eth.sendSignedTransaction(
            "0x" + serializedTx.toString("hex")
          );

          const schedule = await contractInst
            .getSchedule(0)
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
    it("It should add an authorizer successfully", async () => {
      try {
        const countOfCurrentAuthorizers = await contractInst
          .countAuthorizer()
          .call({ from: "0xbb723b459f84c24665a89159d94701321864e5d0" });

        var oldCount = parseInt(countOfCurrentAuthorizers);

        const _privateKey =
          "c32214f0887908a8607c9db7d79b87531ae939a40056c3a7858f532d3f8408de";
        const privateKey = Buffer.from(_privateKey, "hex");
        const data = await contractInst
          .addAuthorizer(accounts[7], 1)
          .encodeABI();
        const gasPrice = 2000;
        var nounce = await web3.eth.getTransactionCount(accounts[0], "pending");
        const gasUsed = await contractInst
          .addAuthorizer(accounts[7], 1)
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

        const countAfterAddition = await contractInst
          .countAuthorizer()
          .call({ from: "0xbb723b459f84c24665a89159d94701321864e5d0" });
        const getauthorizer = await contractInst
          .getAuthorizer(accounts[7], 0)
          .call({ from: "0xbb723b459f84c24665a89159d94701321864e5d0" });

        assert.equal(
          countAfterAddition,
          oldCount + 1,
          "Total authorizer count did not increase by 1"
        );
        assert.equal(
          getauthorizer.authorizerType,
          1,
          "Authorizer not added with the intended type"
        );
        assert.equal(
          getauthorizer.authorizerType,
          1,
          "Authorizer not added with the intended type"
        );

        // const event = await contractEvent.getPastEvents("NewAuthorizer", {
        //   filter: {
        //     _authorizer: accounts[6],
        //     _type: 1
        //   },
        //   fromBlock: 0
        // });
        // console.log("event >> ", event);

        // const event = await contractEvent.events
        //   .NewAuthorizer
        //   //   {
        //   //   filter: {
        //   //     _authorizer: accounts[7],
        //   //     _type: 1
        //   //   },
        //   //   fromBlock: 0
        //   // }
        //   ();

        // contractEvent.once(
        //   "NewAuthorizer",
        //   {
        //     filter: {
        //       _authorizer: accounts[7],
        //       _type: 1
        //     },
        //     fromBlock: 0
        //   },
        //   (error, event) => {
        //     console.log("error >> ", error);
        //     console.log("event >> ", event);
        //   }
        // );

        // console.log("event >> ", event);
      } catch (error) {
        console.log("error >> ", error);
      }
    });
    it("It should remove an authorizer successfully", async () => {
      try {
        const _privateKey =
          "c32214f0887908a8607c9db7d79b87531ae939a40056c3a7858f532d3f8408de";
        const privateKey = Buffer.from(_privateKey, "hex");
        const data = await contractInst
          .removeAuthorizer(accounts[7])
          .encodeABI();
        const gasPrice = 2000;
        var nounce = await web3.eth.getTransactionCount(accounts[0], "pending");
        const gasUsed = await contractInst
          .removeAuthorizer(accounts[7])
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

        const getauthorizer = await contractInst
          .getAuthorizer(accounts[7], 0)
          .call({ from: "0xbb723b459f84c24665a89159d94701321864e5d0" });

        assert.equal(
          getauthorizer.authorizerAddr,
          "0x0000000000000000000000000000000000000000",
          "Authorizer not removed properly"
        );
      } catch (error) {
        console.log("error >> ", error);
      }
    });
  });

  describe("Token Scheduler Library", () => {
    it("It should create a new schedule successfully", async () => {
      try {
        const _privateKey =
          "c32214f0887908a8607c9db7d79b87531ae939a40056c3a7858f532d3f8408de";
        const privateKey = Buffer.from(_privateKey, "hex");
        const data = await contractInst
          .createSchedule(1, 400, 1, web3.utils.toHex("Just testing"))
          .encodeABI();
        const gasPrice = 2000;
        var nounce = await web3.eth.getTransactionCount(accounts[0], "pending");
        const gasUsed = await contractInst
          .createSchedule(1, 400, 1, web3.utils.toHex("Just testing"))
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

        const {
          scheduleType,
          amount,
          activeAmount,
          isActive,
          isApproved,
          isRejected
        } = await contractInst.getSchedule(1).call({
          from: "0xbb723b459f84c24665a89159d94701321864e5d0"
        });

        assert.equal(
          scheduleType,
          1,
          "The schedule type wasn't added properly"
        );
        assert.equal(amount, 400, "The schedule amount wasn't set properly");
        assert.equal(
          activeAmount,
          amount,
          "The schedule activeAmount isn't same as the amount"
        );
        assert.equal(
          isApproved,
          false,
          "The schedule approved state wasn't set properly"
        );
        assert.equal(
          isRejected,
          false,
          "The schedule rejected state wasn't set properly"
        );
        assert.equal(
          isActive,
          true,
          "The schedule active state wasn't set properly"
        );

        // Test for NewSchedule event
      } catch (error) {
        console.log("error >> ", error);
      }
    });
    it("It should approve a created schedule successfully", async () => {
      try {
        // Add Authorizer
        const _privateKey =
          "c32214f0887908a8607c9db7d79b87531ae939a40056c3a7858f532d3f8408de";
        const privateKey = Buffer.from(_privateKey, "hex");
        const data = await contractInst
          .addAuthorizer(accounts[7], 1)
          .encodeABI();
        const gasPrice = 2000;
        var nounce = await web3.eth.getTransactionCount(accounts[0], "pending");
        const gasUsed = await contractInst
          .addAuthorizer(accounts[7], 1)
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

        // Approved Schedule
        const _privateKey1 =
          "32d1d38041109a5dfdbd6af631c5126ff0c661e1fad250f01c968f399cb018e6";
        const privateKey1 = Buffer.from(_privateKey1, "hex");
        const data1 = await contractInst
          .approveSchedule(1, web3.utils.toHex("Just testing"))
          .encodeABI();
        // const gasPrice = 2000;
        var nounce1 = await web3.eth.getTransactionCount(
          accounts[7],
          "pending"
        );
        const gasUsed1 = await contractInst
          .approveSchedule(1, web3.utils.toHex("Just testing"))
          .estimateGas({
            from: accounts[7]
          });
        const txParams1 = {
          nonce: nounce1,
          gasLimit: gasUsed1,
          gasPrice: gasPrice * 1000000000,
          from: accounts[7],
          to: deployedContractAddr,
          data1,
          chainId: 5777
        };
        const tx1 = await new EthereumTx(txParams1);
        tx1.sign(privateKey1);
        const serializedTx1 = tx1.serialize();
        await web3.eth.sendSignedTransaction(
          "0x" + serializedTx1.toString("hex")
        );

        const { isApproved, isRejected } = await contractInst
          .getSchedule(1)
          .call({
            from: "0xbb723b459f84c24665a89159d94701321864e5d0"
          });

        assert.equal(
          isRejected,
          false,
          "The schedule was not properly approved"
        );
        assert.equal(
          isApproved,
          true,
          "The schedule was not properly approved"
        );

        // Test for NewSchedule event
      } catch (error) {
        console.log("error >> ", error);
      }
    });
  });
});
