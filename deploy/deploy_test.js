const debug = require("debug")("custom-prize-strategy:deploy");
const { ethers } = require("@nomiclabs/buidler");
const abiFlavorBuilder = require("../artifacts/FlavorBuilder.json").abi;
const abiFlavorProxyFactory = require("../artifacts/FlavorProxyFactory.json").abi;

async function main() {
  const [deployer] = await ethers.getSigners();

  ///Prize Pool address creaated in the Builder: https://builder.pooltogether.com/
  const prizePoolAddress = "0x5259fcC7e86E8e5997AcdDA4E09Fd326500c44A1";
  let flavorBuilderAddress = await findAddress("FlavorBuilder");
  let flavorProxyFactoryAddress = await findAddress("FlavorProxyFactory");

  console.log("Connecting contracts with the account:", await deployer.getAddress());

  console.log("Account balance:", ethers.utils.formatEther(await deployer.getBalance()));

  console.log('flavorBuilderAddress', flavorBuilderAddress);
  console.log('flavorProxyFactoryAddress', flavorProxyFactoryAddress);
  debug(`\n  Connecting to FlavorProxyFactory (${flavorProxyFactoryAddress})...`);
  const flavorProxy = await new ethers.Contract(flavorProxyFactoryAddress, abiFlavorProxyFactory, deployer);

  console.log(
    "FlavorProxyFactory address:",
    flavorProxy.address,
    "\n Contract balance:",
    ethers.utils.formatEther(await ethers.provider.getBalance(flavorProxy.address))
  );

  debug(`\n  Connecting to FlavorBuilder (${flavorBuilderAddress})...`);
  const flavorBuilder = await new ethers.Contract(flavorBuilderAddress, abiFlavorBuilder, deployer);
  console.log(
    "FlavorBuilder address:",
    flavorBuilder.address,
    "\n Contract balance:",
    ethers.utils.formatEther(await ethers.provider.getBalance(flavorProxy.address))
  );

  // console.log("Sending 0.1 ETH to flavorBuilder address:", flavorBuilder.address);
  // const tx = await deployer.sendTransaction({
  //   to: flavorBuilder.address,
  //   value: ethers.utils.parseEther("0.1"),
  // });
  //
  // //await (await tacoToken.transfer(crowdsaleContract.address, CIRCULATING_SUPPLY)).wait(1);
  console.log("send tx:", tx);

  console.log("Starting flavorBuilder.createFlavorStrategy");
  await flavorBuilder.createFlavorStrategy(prizePoolAddress);
  console.log("FlavorBuilder created Flavoer Strategy at the address:", prizePoolAddress);
  console.log("FlavorBuilder.createFlavorStrategy done");
}

async function findAddress(name) {
  const fs = require("fs");
  const addressesFile = __dirname + `/../artifacts/address/${name}.json`;
  if (!fs.existsSync(addressesFile)) {
    console.error(`You need to deploy your ${name} contract first`);
    return;
  }
  const addressJson = fs.readFileSync(addressesFile);
  const address = JSON.parse(addressJson);
  return address.address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
