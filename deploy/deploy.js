const debug = require("debug")("custom-prize-strategy:deploy");
const { ethers } = require("@nomiclabs/buidler");
const abiPrizePool = require("../artifacts/PrizePool.json").abi;

async function main() {
  const [deployer] = await ethers.getSigners();

  ///Prize Pool address creaated in the Builder: https://builder.pooltogether.com/
  const prizePoolAddress = "0x5259fcC7e86E8e5997AcdDA4E09Fd326500c44A1";

  console.log("Deploying contracts with the account:", await ethers.utils.formatEther(deployer.getAddress()));

  console.log("Account balance:", (await deployer.getBalance()).toString());

  debug("\n  Deploying FlavorProxyFactory...");
  const FlavorProxyFactory = await ethers.getContractFactory("FlavorProxyFactory");
  const flavorProxyInst = await FlavorProxyFactory.deploy();
  await flavorProxyInst.deployed();
  saveContractAddress("FlavorProxyFactory", flavorProxyInst.address);
  console.log(
    "FlavorProxyFactory address:",
    flavorProxyInst.address,
    "\n Current balance:",
    ethers.utils.formatEther(await ethers.provider.getBalance(flavorProxyInst.address))
  );

  debug("\n  Deploying FlavorBuilder...");
  const FlavorBuilder = await ethers.getContractFactory("FlavorBuilder");
  const flavorBuilderInst = await FlavorBuilder.deploy(flavorProxyInst.address);
  await flavorBuilderInst.deployed();
  saveContractAddress("FlavorBuilder", flavorBuilderInst.address);
  console.log(
    "FlavorBuilder address:",
    flavorBuilderInst.address,
    "\n Current balance:",
    ethers.utils.formatEther(await ethers.provider.getBalance(flavorBuilderInst.address))
  );

  const tx = deployer.sendTransaction({
    to: flavorBuilderInst.address,
    value: ethers.utils.parseEther("0.1"),
  });

  await ethers.provider.waitForTransaction(tx, 1);
  console.log("send 0.1 ETH on FlavorBuilder Tx:", tx);
  console.log(
    "FlavorBuilder address:",
    flavorBuilderInst.address,
    "\n Current balance:",
    ethers.utils.formatEther(await ethers.provider.getBalance(flavorBuilderInst.address))
  );

  console.log("Starting flavorBuilder.createFlavorStrategy");
  const flavorStrategy = await flavorBuilderInst.createFlavorStrategy(prizePoolAddress);
  console.log("FlavorBuilder created Flavoer Strategy at the address:", flavorStrategy.address);

  const prizePoolInst = await new ethers.Contract(flavorBuilderAddress, abiPrizePool, deployer);
  console.log("Connected to PrizePool Contract at address: ", prizePoolInst.address);

  prizePoolInst.setPrizeStrategy(flavorStrategy.address);
}

function saveContractAddress(name, address) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../artifacts/address";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(contractsDir + `/${name}.json`, JSON.stringify({ address: address }, undefined, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
