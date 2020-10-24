const flavorProxyFactoryInst = await FlavorProxyFactory.deployed(); //Create link to Flavor Proxy Factory
const flavorBuilderInst = await FlavorBuilder.deployed(); //Create link to Flavor Builder

//Prize Strategy contract address from (https://builder.pooltogether.com/):
const prizeStrategyContract = "0xFb1aCf83F5A6d01ab2CA244a6328E4779C2d6689";
const prizePoolAddress = "0xAbE1646a7d6a0a995f0c88570fA1BCc5204b7850";


//Configure prize strategy contract
const strategyContract = await flavorBuilderInst.createFlavorStrategy(prizeStrategyContract);

//Recieving a strategyAddress from Tx logs in Etherscan (InterfaceImplementerSet)
const prizePoolInst = await PrizePool.at(prizePoolAddress); //Create link to Prize Pool
const strategyAddress = "0xe8e55e4f2037e79c726ff374bbdaa94eb7cff24c";
await prizePoolInst.setPrizeStrategy(strategyAddress);

//Creating link to FlavorStrategy contract
const flavorStragyAddress = await flavorProxyFactoryInst.instance();
const flavorStrategylInst = await FlavorStrategy.at(flavorStragyAddress);
await flavorStrategylInst.completeAward("sf");
//0xe8e55e4f2037e79c726ff374bbdaa94eb7cff24c