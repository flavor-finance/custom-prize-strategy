# Flavor Prize Strategy

Flavor uses a prize strategy developed on top of the [PoolTogether V3](https://www.pooltogether.com/) protocol.

It facilitates the depositing and withdrawal of USDC as a `collateral asset` and uses Chainlink for retrieving an arbitrary number of `prediction asset` price feeds. A pod contract address must be deployed and configured for each `prediction asset`.

## Deployment

Deployment happens in a few steps. First a generic prize pool is deployed. Then the prize strategy is deployed. Finally, the prize pool is updated to use the custom prize strategy.

Install dependencies `yarn`

Install [Truffle](https://www.trufflesuite.com/docs/truffle/getting-started/installation) if needed.

Add variables in `.env` file (use `.env.example` as a reference). For `HDWALLET_MNEMONIC` use mnemonic phrases from your MetaMask Test account or any other Ethereum wallet.
Sign up [Infura](https://infura.io/) for receiving `INFURA_API_KEY`.

### Deploy Prize Pool Contract

Deploy prize pool contracts using the [Prize Pool Builder](https://builder.pooltogether.com/). Make sure to select same the network as will be using in further FlavorContracts deployment. The Single Random Winner strategy will be used, and will be modified later.
[Pool Contracts Project Documentation](https://github.com/pooltogether/pooltogether-pool-contracts/tree/version-3)

Save Prize Pool contract address as `prizePoolAddress` and Prize Strategy contract address `prizeStrategyContract` for references in the next steps.

### Deploy Prize Strategy Contract

Deploy the FlavorProxyFactory and FlavorBuilder contracts with command:

```
truffle migrate --network rinkeby
```

Make sure to consistently specify which network is being used (i.e, `--network rinkeby`) when running `truffle` commands.

Run `truffle console --network rinkeby` and use `prizeStrategyContract` address from the previous step to create the strategy contract.

```
const flavorBuilderInst = await FlavorBuilder.deployed(); //Create link to the FlavorBuilder
const strategyContract = await flavorBuilderInst.createFlavorStrategy(prizeStrategyContract);
```

There are now two contracts: a "proxy" contract that forwards transactions to an "implementation" contract, and the "implementation" contract that will be swapped for another contract when an upgrade takes place.

The proxy contract address is `strategyContract.receipt.rawLogs[0].address`, save it as `strategyAddressProxy`

The implementation contract address is `'0x' + strategyContract.receipt.rawLogs[0].data.slice(26)` save address as `strategyAddress`.

### Configure Prize Pool Strategy

Create Prize Pool using the `prizePoolAddress` and call `setPrizeStrategy` with the `strategyAddress` contract address value.

```
const prizePoolInst = await PrizePool.at(prizePoolAddress);
prizePoolInst.setPrizeStrategy(strategyAddress); //need to check both strategyAddress and strategyAddressProxy
```

### Deploy Pods and Configure Pod Addresses

First, clone our fork of the [Pod Contracts repository](https://github.com/flavor-finance/pooltogether-pod-contracts).

Add variables in `.env` file (use `.env.example` as a reference). For `HDWALLET_MNEMONIC` use mnemonic phrases from your MetaMask Test account or any other Ethereum wallet.
Sign up [Infura](https://infura.io/) for receiving `INFURA_API_KEY`.

Run `yarn` to install dependencies.

To deploy a pod contract, complete the following steps. Don't forget to specify desired network.

1. Edit `migrations/2_initial_migration` and save the Pool address created via [Builder](https://builder.pooltogether.com/) in the `tokenAddress` variable.

2. Depending on the desired number of copies, edit function `deployCopy`

3. Run `truffle migrate --network rinkeby` to deploy a new pod contracts.

4. Once the pod contract is deployed, get the deployed pod contract addresses in `migrations/deployedAddress`. Save it as `podAddress`

5. Return to Flavor Strategy repository and run console. Derive link to FlavorStrategy contract using `strategyAddress` obtained on previous step:

```
const flavorStrategylInst = await FlavorStrategy.at(strategyAddress);
```

5. For each instance of Pod Contract Call

```
flavorStrategylInst.addPodAddress(string memory assetSymbol, address podAddress, address priceFeedAddress)
```

For arguments use: the Pod asset symbol, the Pod contract address `podAddress`, and the [Chainlink price feed address](https://docs.chain.link/docs/reference-contracts) for the asset's USD price feed.

### Completing Prize Periods

The [flavor-finance](https://github.com/flavor-finance/flavor-finance) repository contains a web server setup to facilitate a daily cron job that calls the `completeAward` method, which calculates the winning pod and distributes the daily award to it, and creates the next prize period. In the event this web server is offline, this is a public method can can be successfully called by anyone so long as the prize period has ended.