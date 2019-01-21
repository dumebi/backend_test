/* eslint-disable no-undef */
const TokenContract = artifacts.require('Token');
const MessagesLibrary = artifacts.require('MessagesAndCodes');
const AuthorizerLib = artifacts.require('Authorizer');
const OwnerLib = artifacts.require('Ownable');
const TokenFuncLib = artifacts.require('TokenFunc');
const TokenScheduleLib = artifacts.require('TokenScheduler');

module.exports = (deployer) => {
  deployer.then(async () => {
    await deployer.deploy(MessagesLibrary);
    await deployer.deploy(OwnerLib);
    await deployer.deploy(AuthorizerLib);
    await deployer.deploy(TokenFuncLib);
    await deployer.deploy(TokenScheduleLib);
    await deployer.link(MessagesLibrary, TokenContract);
    await deployer.link(OwnerLib, TokenContract);
    await deployer.link(AuthorizerLib, TokenContract);
    await deployer.link(TokenFuncLib, TokenContract);
    await deployer.link(TokenScheduleLib, TokenContract);
    await deployer.deploy(TokenContract, 'SIT', 'Sterling Investment Token', 1, "0x51b369542d38211d1d52ab377b7e59067cf08594");
  })
}
