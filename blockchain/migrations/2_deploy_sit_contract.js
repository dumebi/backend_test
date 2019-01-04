/* eslint-disable no-undef */
const TokenContract = artifacts.require('token/sit.sol');

module.exports = (deployer) => {
  deployer.deploy(TokenContract, 'SIT', 'Sterling Investment Token', 200000, 200000000000,);
}
