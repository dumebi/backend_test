const etherlime = require('etherlime');

const { compiledTokenContract, compiledTokenFuncLib } = require("./compile.js");

const deploy = async (network, secret) => {

    const deployer = new etherlime.EtherlimeGanacheDeployer();
    console.log("deployer >> ", deployer)

    const libraries = {
        Queue: '0x655341AabD39a5ee0939796dF610aD685a984C53',
        LinkedList: '0x619acBB5Dafc5aC340B6de4821835aF50adb29c1'
    }

    const estimate = await deployer.estimateGas(compiledTokenContract, "SIT", "Sterling Investment Token", 1, "", "");

    const defaultConfigs = {
        gasPrice: 20000000000,
        gasLimit: 4700000,
        chainId: 0 
    }

    const result = await deployer.deploy(compiledTokenContract, libraries, {
        _symbol : "SIT",
        _name:  "Sterling Investment Token",
        _granular: 1,
        _tokenbase: "",
        owner: ""
    }); 
}

module.exports = { deploy }