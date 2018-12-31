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
  contracts_build_directory: "./deployment",
  ganache: {
    host: 'localhost',
    port: 7545,
    network_id: '*' // Match any network id
  },
  geth: {
    host: 'localhost',
    port: 8545,
    network_id: '4224',
    gas: 4612388
  },
  compilers: {
    solc: {
      version: "^0.5.0", // A version or constraint - Ex. "^0.5.0"
                          // Can also be set to "native" to use a native solc
      settings: {
        optimizer: {
          enabled: true,
          runs: 1   // Optimize for how many times you intend to run the code
        }
      }
    }
  }
}