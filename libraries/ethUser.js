const HD = require('ethereumjs-wallet');
const bip39 = require('bip39');
const HDKey = require('hdkey');
const axios = require('axios');
const { web3, EthereumTx, ethUtil } = require('./base.js');

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
      const balance = await web3.eth.getBalance(address);
      const balanceToEther = await web3.utils.fromWei(balance, 'ether');

      return balanceToEther;
    } catch (error) {
      console.log(error);
    }
  },

  async fundAcct(fromAddress, toAddress, amount, _privateKey) {
    try {
      const isValidFrom = await ethUtil.isValidAddress(fromAddress);
      const isValidTo = await ethUtil.isValidAddress(toAddress);

      if (!isValidFrom) {
        return 'Invalid from address';
      } if (!isValidTo) {
        return 'Invalid to address';
      }

      const privateKey = Buffer.from(_privateKey, 'hex');
      let nounce = await web3.eth.getTransactionCount(fromAddress);
      const gasUsed = await web3.eth.estimateGas({
        to: toAddress,
        value: web3.utils.toHex(web3.utils.toWei(amount, 'ether')),
        chainId: 4
      });
      const txParams = {
        nonce: nounce++,
        gasLimit: gasUsed,
        gasPrice: 4 * 1000000000,
        to: toAddress,
        value: web3.utils.toHex(web3.utils.toWei(amount, 'ether')),
        chainId: 4
      };

      const tx = await new EthereumTx(txParams);
      tx.sign(privateKey);
      const serializedTx = tx.serialize();
      const transactionId = await web3.eth.sendSignedTransaction(
        `0x${serializedTx.toString('hex')}`
      );
      console.log('transactionId', transactionId);
      return transactionId;
    } catch (error) {
      console.log('error >> ', error);
    }
  },

  async transfer(fromAddress, toAddress, amount, _privateKey) {
    try {
      const isValidFrom = await ethUtil.isValidAddress(fromAddress);
      const isValidTo = await ethUtil.isValidAddress(toAddress);

      if (!isValidFrom) {
        return 'Invalid from address';
      } if (!isValidTo) {
        return 'Invalid to address';
      }

      const privateKey = Buffer.from(_privateKey, 'hex');
      let nounce = await web3.eth.getTransactionCount(fromAddress);
      const gasUsed = await web3.eth.estimateGas({
        to: toAddress,
        value: web3.utils.toHex(web3.utils.toWei(amount, 'ether')),
        chainId: 4 // Rinkeby - Changed for production
      });

      const txParams = {
        nonce: nounce++,
        gasLimit: gasUsed,
        gasPrice: 4 * 1000000000,
        from: fromAddress,
        to: toAddress,
        value: web3.utils.toHex(web3.utils.toWei(amount, 'ether')),
        chainId: 4
      };

      const tx = await new EthereumTx(txParams);
      tx.sign(privateKey);
      const serializedTx = tx.serialize();
      const transactionId = await web3.eth.sendSignedTransaction(
        `0x${serializedTx.toString('hex')}`
      );
      console.log('transactionId', transactionId);
      return transactionId;
    } catch (error) {
      console.log('error >> ', error);
      throw error;
    }
  }
};
