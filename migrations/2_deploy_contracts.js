var TixicoToken = artifacts.require('TixicoToken');
var TixicoFaucet = artifacts.require('TixicoFaucet');
var Evvent = artifacts.require('Evvent');

module.exports = function(deployer, network, accounts) {
    const rate = new web3.BigNumber(1000);
    const wallet = accounts[1];

    return deployer.then(() => {
            return deployer.deploy(TixicoToken);
        }).then(() => {
            return deployer.deploy(TixicoFaucet, rate, wallet, TixicoToken.address);
        }).then(() => {
            return tixicoTokenInstance = TixicoToken.at(TixicoToken.address);
        }).then(() => {
            return tixicoTokenInstance.transferOwnership(TixicoFaucet.address);
        }).then(() => {
            return deployer.deploy(Evvent, 1000, 9999, 0, TixicoToken.address);
        });
};
