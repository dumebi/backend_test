// let SIT = artifacts.require('./sit.sol');


contract('SIT Contract', async function(accounts) {
  console.log("account >> ", accounts[0])
  it("Should return true if two strings are equal", function() {
    return SIT.deployed().then(function(instance) {
        let string1 = "oluchi";
        let string2 = "oluchi";
      let result =  await instance.stringsEqual(string1, string2).call(accounts[0]);
      let result =  await instance.stringsEqual(string1, string2).call(accounts[0]);
      console.log("result >> ", result)
      assert.equal(result, true, "It returns false for the same strijngs");
    });
  });

const SIT = artifacts.require('./sit.sol');

// test suite
contract('SIT Contract', async (accounts) => {
  let SitInstance;
  const coinbase = accounts[0];


  it('Should return true if two strings are equal', () => {
    return SIT.deployed().then((instance) => {
      SitInstance = instance;
      const string1 = 'oluchi';
      const string2 = 'oluchi';
      return SitInstance.stringsEqual(string1, string2).call(coinbase);
    }).then((result) => {
      console.log(result)
      assert.equal(result, true, 'It returns false for the same strijngs');
    });
  });
});
