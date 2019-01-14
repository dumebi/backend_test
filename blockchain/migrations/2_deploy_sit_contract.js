/* eslint-disable no-undef */
const TokenContract = artifacts.require('SIT');
const MessagesLibrary = artifacts.require('MessagesAndCodes');

module.exports = (deployer) => {
  deployer.then(async () => {
    await deployer.deploy(MessagesLibrary);
    await deployer.link(MessagesLibrary, TokenContract);
    await deployer.deploy(TokenContract, 'SIT', 'Sterling Investment Token', 1, "0x6a0e53381008ede2515681d885a7fa745089bd9c");
  })
}
