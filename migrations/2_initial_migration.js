const FlavorBuilder = artifacts.require("FlavorBuilder");
const FlavorProxyFactory = artifacts.require("FlavorProxyFactory");

module.exports = async function (deployer, network, accounts) {
  // Deploy Flavor Proxy Factory
  await deployer.deploy(FlavorProxyFactory);
  const flavorProxyFactoryInst = await FlavorProxyFactory.deployed();

  // Deploy Flavor Builder with args = FlavorProxyFactory.address
  await deployer.deploy(FlavorBuilder, flavorProxyFactoryInst.address);
  const flavorBuilderInst = await FlavorBuilder.deployed();
};
