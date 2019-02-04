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
beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  const { compiledTokenContract } = require("../libraries/deploy/compile.js");

  const deployedContractAddr = "0x41a49bd0940ef8f3f575c3fe848a171b0902e9f9";
  const contractABI = compiledTokenContract.abi;
  const contract = await new web3.eth.Contract(
    contractABI,
    deployedContractAddr
  );
  contractInst = contract.methods;
});

describe("Token deployment", () => {
  it("Has value for token properties after deployment", async () => {
    const result = await contractInst.owner().call({ from: accounts[0] });
    console.log("result << ", result);
    assert.equal(
      accounts[0],
      result,
      "The owner address is different form expeted owner"
    );
  });
});
