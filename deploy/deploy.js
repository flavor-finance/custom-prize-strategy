const debug = require("debug")("custom-prize-strategy:deploy");
const { ethers } = require("@nomiclabs/buidler");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log(
    "Deploying contracts with the account:",
    await deployer.getAddress()
  );

  console.log("Account balance:", (await deployer.getBalance()).toString());

  debug("\n  Deploying FlavorProxyFactory...");
  const FlavorProxyFactory = await ethers.getContractFactory(
    "FlavorProxyFactory"
  );
  const flavorProxy = await FlavorProxyFactory.deploy();
  await flavorProxy.deployed();
  console.log("FlavorProxyFactory address:", flavorProxy.address);

  debug("\n  Deploying Flavor Builder...");
  const FlavorBuilder = await ethers.getContractFactory("FlavorBuilder");
  const flavorBuilder = await FlavorBuilder.deploy(flavorProxy.address);
  await flavorBuilder.deployed();
  console.log("FlavorBuilder address:", flavorBuilder.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
