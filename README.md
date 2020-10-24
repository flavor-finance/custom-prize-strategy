# Flavor Prize Strategy

Flavor uses a prize strategy developed on top of the [PoolTogether V3](https://www.pooltogether.com/) protocol.

It facilitates the depositing and withdrawal of USDC as a `collateral asset` and uses Chainlink for retrieving an arbitrary number of `prediction asset` price feeds. A pod contract address must be deployed and configured for each `prediction asset`.

## Deployment

Deployment happens in a few steps. First a generic prize pool is deployed. Then the prize strategy is deployed. Finally, the prize pool is updated to use the custom prize strategy.

First install dependencies `yarn`. Install [Truffle](https://www.trufflesuite.com/docs/truffle/getting-started/installation) if needed.

Add variable in .env file (use .env.example as a reference). For HDWALLET_MNEMONIC use mnemonic phrases from your MetaMask Test account or use any other Ethereum wallet.
Sign up [Infura] (https://infura.io/) for recieving INFURA_API_KEY.

### Deploy Prize Pool Contract

Deploy prize pool contracts using the [Prize Pool Builder](https://builder.pooltogether.com/). Make sure to select same network as will be using for further FlavorContracts depoyment. The Single Random Winner strategy will be used, and will be modified later. [Pool Contracts Project Documentation](https://github.com/pooltogether/pooltogether-pool-contracts/tree/version-3)

Save Prize Pool contract address as `prizePoolAddress` and Prize Strategy contract address `prizeStrategyContract` for references in the next steps.

### Deploy Prize Strategy Contract

Deploy the FlavorProxyFactory.sol and FlavorBuilder.sol with command: `truffle migrate --network rinkeby`.
Make sure to consistently specify which network is being used (i.e, `--network rinkeby`) when running `truffle` commands.

Run `truffle console --network rinkeby` and use the prize pool address from the previous step to create the strategy contract:

```
const flavorBuilderInst = await FlavorBuilder.deployed(); //Create link to the FlavorBuilder
//Configure prize strategy contract
const strategyContract = await flavorBuilderInst.createFlavorStrategy(prizeStrategyContract);
```

After running the next command save returned address as `strategyAddress`, it will be used for the deployed prize strategy contract using the generated prize pool address.

### Configure Prize Pool Strategy

Create Prize Pool using prizePoolAddress saved bellow

```
const prizePoolInst = await PrizePool.at(prizePoolAddress); //Link to Prize Pool
pool.setPrizeStrategy(strategyAddress)
```

### Deploy Pods and Configure Pod Addresses

First, clone our fork of the [Pod Contracts repository](https://github.com/flavor-finance/pooltogether-pod-contracts) and edit the `scripts/migrate.js` script, setting the `POOL_USDC` address for the network you are using as the prize pool address from the first step.

Run `yarn` to install dependencies.

Get the prize strategy loaded up via `buidler console` from this repository:

```
deployed = await deployments.all()
signers = await ethers.getSigners()
prizeStrategy = await ethers.getContractAt(deployed.FlavorStrategy.abi, strategyAddress, signers[0])
```

To deploy a pod contract, complete the following steps:

1. Run `yarn migrate` to deploy a new pod contract instance.

2. Once the pod contract is deployed, get the deployed pod contract address by opening `build/contracts/Pod.json` and finding the `address` property under the correct network in the `networks` object.

3. Call `prizeStrategy.addPodAddress` with the asset symbol to use for the pod, the contract address of the pod, and the [Chainlink price feed address](https://docs.chain.link/docs/reference-contracts) for the asset's USD price feed.

Repeat these three steps for each prediction asset that should be supported.

### Completing Prize Periods

The [flavor-finance](https://github.com/flavor-finance/flavor-finance) repository contains a web server setup to facilitate a daily cron job that calls the `completeAward` method, which calculates the winning pod and distributes the daily award to it, and creates the next prize period. In the event this web server is offline, this is a public method can can be successfully called by anyone so long as the prize period has ended.

---

## Setup

First clone the repository then run:

```bash
$ yarn
```

Copy over .envrc.example to .envrc

```
$ cp .envrc.example .envrc
```

Make sure to update the enviroment variables with suitable values. You'll want to administer any pools you create, so be sure to use a mnemonic that you used to create a prize pool.

Now enable the env vars using [direnv](https://direnv.net/docs/installation.html)

```
$ direnv allow
```

### Setup PoolTogether Contracts as a separate project

Clone the [PoolTogether Contracts](https://github.com/pooltogether/pooltogether-pool-contracts/tree/version-3) repository in another directory:

```
$ cd ..
$ yarn clone git@github.com:pooltogether/pooltogether-pool-contracts.git
$ cd pooltogether-pool-contracts
$ git checkout version-3
```

Notice that we check out the `version-3` branch.

**Follow the setup instruction in the [README](https://github.com/pooltogether/pooltogether-pool-contracts/tree/version-3)**

Now start a local node:

```
$ yarn start
```

You should now have a local node running that is fully bootstrapped with:

- PoolTogether contracts
- Mock DAI
- Mock Compound cDai
- Mock yEarn yDAI Vault

### Deploy the Custom Prize Strategy

```
$ yarn deploy-pt
```

This will compile and deploy the contracts against the local node started in the other project.

### Test it out!

Create a prize pool in the normal way, and then try swapping out the strategy!
