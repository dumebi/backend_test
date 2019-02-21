/*
 * NB: since truffle-hdwallet-provider 0.0.5 you must wrap HDWallet providers in a
 * function when declaring them. Failure to do so will cause commands to hang. ex:
 * ```
 * mainnet: {
 *     provider: function() {
 *       return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/<infura-key>')
 *     },
 *     network_id: '1',
 *     gas: 4500000,
 *     gasPrice: 10000000000,
 *   },
 */

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: "localhost",
      port: 7545,
      network_id: "*", // Match any network id
<<<<<<< HEAD
      gas: 300000000,
=======
      gas: 8000000000,
>>>>>>> 36a8fee4e427f91acf3ace77e9a415ba266e0945
      allowUnlimitedContractSize: true
    },
    geth: {
      host: "localhost",
      port: 8545,
      network_id: "4224",
      gas: 4612388
    },
    solc: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};
