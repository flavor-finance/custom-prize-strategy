const FlavorBuilder = artifacts.require("FlavorBuilder");
const FlavorProxyFactory = artifacts.require("FlavorProxyFactory");
const FlavorStrategy = artifacts.require("FlavorStrategy");
//const Web3 = require('web3');
//let web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");

module.exports = async function (deployer, network, accounts) {
  // Deploy Flavor Proxy Factory
  await deployer.deploy(FlavorProxyFactory);
  const flavorProxyFactoryInst = await FlavorProxyFactory.deployed();

  // Deploy Flavor Builder with args = FlavorProxyFactory.address
  await deployer.deploy(FlavorBuilder, flavorProxyFactoryInst.address);
  const flavorBuilderInst = await FlavorBuilder.deployed();
};
