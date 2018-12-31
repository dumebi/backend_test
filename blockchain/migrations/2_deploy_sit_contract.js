/* eslint-disable no-undef */
const TokenContract = artifacts.require('token/sit.sol');

module.exports = (deployer) => {
  deployer.deploy(TokenContract, 'SIT', 'Sterling Investment Token', 10000000000000, 1, 'NGN');
}
