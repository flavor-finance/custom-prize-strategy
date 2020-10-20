const debug = require("debug")("custom-prize-strategy:deploy");
const { ethers } = require("@nomiclabs/buidler");

async function main() {
  const [deployer] = await ethers.getSigners();

  ///Prize Pool address creaated in the Builder: https://builder.pooltogether.com/
  const prizePoolAddress = "0x5259fcC7e86E8e5997AcdDA4E09Fd326500c44A1";

  console.log(
    "Deploying contracts with the account:",
    await deployer.getAddress()
  );

  console.log("Account balance:", (await deployer.getBalance()).toString());

  debug("\n  Deploying FlavorProxyFactory...");
  const FlavorProxyFactory = await ethers.getContractFactory(
    "FlavorProxyFactory"
  );
  const flavorProxyInst = await FlavorProxyFactory.deploy();
  await flavorProxyInst.deployed();
  saveContractAddress("FlavorProxyFactory", flavorProxyInst.address);
  console.log("FlavorProxyFactory address:", flavorProxyInst.address);

  debug("\n  Deploying FlavorBuilder...");
  const FlavorBuilder = await ethers.getContractFactory("FlavorBuilder");
  const flavorBuilderInst = await FlavorBuilder.deploy(flavorProxyInst.address);
  await flavorBuilderInst.deployed();
  saveContractAddress("FlavorBuilder", flavorBuilderInst.address);
  console.log("FlavorBuilder address:", flavorBuilderInst.address);

  const tx = deployer.sendTransaction({
    to: flavorBuilderInst.address,
    value: ethers.utils.parseEther("0.1"),
  });

  await deployer.waitForTransaction(tx, 1);
  console.log("send tx:", tx);

  console.log("Starting flavorBuilder.createFlavorStrategy");
  await flavorBuilderInst.createFlavorStrategy(prizePoolAddress);
  console.log(
    "FlavorBuilder created Flavoer Strategy at the address:",
    prizePoolAddress
  );

  //const erc20_rw = new ethers.Contract(address, abi, signer)
  // const prizePoolContract = await ethers.Contract(
  //   prizePoolAddress,

  // );

  console.log("adddress: ", prizePoolContract.address);
  //PrizePoolContract.setPrizeStrategy(strategyAddress)
}

function saveContractAddress(name, address) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../artifacts/address";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + `/${name}.json`,
    JSON.stringify({ address: address }, undefined, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
