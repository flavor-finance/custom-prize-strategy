const flavorProxyFactoryInst = await FlavorProxyFactory.deployed(); //Create link to Flavor Proxy Factory
const flavorBuilderInst = await FlavorBuilder.deployed(); //Create link to Flavor Builder

//Prize Strategy contract address from (https://builder.pooltogether.com/):
const PrizeStrategyContract = "0xFb1aCf83F5A6d01ab2CA244a6328E4779C2d6689";
const prizePool = "0xAbE1646a7d6a0a995f0c88570fA1BCc5204b7850";
const prizePoolInst = await PrizePool.at(prizePool); //Create link to Prize Pool

//Deployed prize strategy contract
const strategyContract = await flavorBuilderInst.createFlavorStrategy(PrizeStrategyContract);

//Recieving a strategyAddress from Tx logs in Etherscan (InterfaceImplementerSet)
const strategyAddress = "0x1b722013c594a526d62e8115876b96934e2e95b6";
await prizePoolInst.setPrizeStrategy(strategyAddress);
