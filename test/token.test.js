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
beforeEach(() => {
  accounts = web3.eth.getAccounts();
  const { compiledTokenContract } = require("../libraries/deploy/compile.js");

  const deployedContractAddr = "0xfe7a80a5f425db9b8de32e84381927da3eb1b273";
  const contractABI = compiledTokenContract.abi;
  contractInst = new web3.eth.Contract(contractABI, deployedContractAddr);
});

describe("Token deployment", () => {
  it("Has value for token properties after deployment", async (accounts, contractInst) => {
    const result = await contractInst.owner().call({ from: fromAddress });
    assert.equal(
      accounts[0],
      result,
      "The owner address is different form expeted owner"
    );
    done();
  });
});
