/* eslint-disable no-undef */
const TokenContract = artifacts.require('SIT');
const MessagesLibrary = artifacts.require('MessagesAndCodes');

module.exports = (deployer) => {
  deployer.then(async () => {
    await deployer.deploy(MessagesLibrary);
    await deployer.link(MessagesLibrary, TokenContract);
    await deployer.deploy(TokenContract, 'SIT', 'Sterling Investment Token', 1, "0x30a9498cb03a0c1c5aef76d8cb901e63dd041e16   ");
  })
}
