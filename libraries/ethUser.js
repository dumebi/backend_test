const bip39 = require("bip39");
var HDKey = require("hdkey");
var { ethers, ethUtil, ethProvider } = require("./base.js");

console.log("ethProvider >> ", ethProvider)

module.exports = {
  newMnemonic() {
    const mnemonic = bip39.generateMnemonic();
    return mnemonic;
  },

  validateMnemonic(mnemonic) {
    return bip39.validateMnemonic(mnemonic);
  },

  generateSeed(mnemonic) {
    return bip39.mnemonicToSeedHex(mnemonic);
  },

  generateKeys(mnemonicSeed) {
    const root = HDKey.fromMasterSeed(new Buffer(mnemonicSeed, 'hex'));

    const childKey = root.derive("m/44'/60'/0'/0/0");
    const childPrivKey = childKey._privateKey; // Child private key
    const childPubKey = ethUtil.privateToPublic(childPrivKey); // 64bits only used to generate child address
    const addr = ethUtil.publicToAddress(childPubKey).toString('hex');
    const childAddress = ethUtil.toChecksumAddress(addr);

    return {
      xmasterPrivateKey: root.privateExtendedKey.toString('hex'),
      childPrivKey: childPrivKey.toString('hex'),
      childPubKey: childKey._publicKey.toString('hex'),
      childAddress
    };
  },

  async balance(address) {
    try {
      var balance = await ethProvider.getBalance(address)
      balance = await ethers.utils.formatEther(balance);

      return balance;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },


  async transfer(toAddress, amount, privateKey) {
    try {
      // We require a provider to send transactions
      let wallet = new ethers.Wallet(privateKey, ethProvider);
      amount = await ethers.utils.parseEther(amount);

      let tx = {
          to: toAddress,
          value: amount
      };

      let transaction = await wallet.sendTransaction(tx);
      return transaction
    } catch (error) {
      console.log('error >> ', error.reason);
      throw error;
    }
  }
};
