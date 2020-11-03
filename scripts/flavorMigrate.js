//Prize Strategy contract address from (https://builder.pooltogether.com/):
const prizeStrategyContract = "0xa1d619E7803Ff8652dabB8270189F7B83Db1Bcb9";
const prizePoolAddress = "0x12E8FB4D5b4C5A8d2a99C78F889b08ae11A4aAb5";

//Configure prize strategy contract
const flavorBuilderInst = await FlavorBuilder.deployed(); //Create link to Flavor Builder
const strategyContract = await flavorBuilderInst.createFlavorStrategy(prizeStrategyContract);
const strategyAddressProxy = strategyContract.receipt.rawLogs[0].address; //0x252396A74e71538a96e3E92F1a9d705B164B2f5B
const strategyAddress = `'0x' + strategyContract.receipt.rawLogs[0].data.slice(26)`; //0x91591B1EaBaF15991635c13df9C735a03E1eB11B;

//Recieving a strategyAddress from Tx logs in Etherscan (InterfaceImplementerSet)
const prizePoolInst = await PrizePool.at(prizePoolAddress); //Create link to Prize Pool
await prizePoolInst.setPrizeStrategy(strategyAddress);

//Creating link to FlavorStrategy contract
const flavorStrategylInst = await FlavorStrategy.at(strategyAddress);
await flavorStrategylInst.completeAward("sf");

//Adding Pod
const podAddress = "0xc17dd427fD5090bf84e677DaFf8f2EF11dde0B07";
const ETHUSDFeed = "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e";

flavorStrategylInst.addPodAddress("ETH/USD", podAddress, ETHUSDFeed);
