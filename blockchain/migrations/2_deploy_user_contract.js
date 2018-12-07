/* eslint-disable no-undef */
const UserContract = artifacts.require('SterlingUser');
const TokenContract = artifacts.require('Token');

module.exports = (deployer) => {
  deployer.deploy(UserContract);
  deployer.deploy(TokenContract, 'SIT', 'Sterling Investment Token', 10000000000000, 1, 'NGN');
}
