# Flavor Prize Strategy

Flavor is built on the[PoolTogether V3](https://www.pooltogether.com/) protocol.  It facilitates the depositing, withdrawal and yield earning of USDC as a `collateral asset` and uses Chainlink for retrieving an arbitrary number of `prediction asset` price feeds used to determine which group of FLAVOR token owners should be allocated the yield earned during a prize period taking place over a period of time such as one day or one week.


### Deployment Overview

Setting up Flavor contracts consists of the following steps:

* Deploy a PoolTogether [Prize Pool](https://github.com/pooltogether/pooltogether-pool-contracts). The Prize Pool contract allows funds to be pooled together into a no-loss yield source, such as Compound, and have the yield safely exposed to a separate Prize Strategy.  The Prize Pool can either be deployed via the [Builder application](https://builder.pooltogether.com/) or from the [project source code](https://github.com/pooltogether/pooltogether-pool-contracts).

* Deploy and initialize a Flavor Prize Strategy contract and pass the address of the deployed prize strategy contract to the  `setPrizeStrategy` method of the previously deployed prize pool contract.

* Deploy one or more [Pod contracts]((https://github.com/pooltogether/pooltogether-pod-contracts) with each pod corresponding to a `prediction asset` to be used in the prize period contest. Specify the address of the Prize Pool contract when initializing each pod, and use the PrizeStrategy `addPodAddress`  method to save the pod address and link it to a corresponding Chainlink price feed.

* *Note*:  A `prediction asset` can be anything with a price feed - there is no need to interact for this system with a token address for a `prediction asset` if it does happen to be an Ethereum token.


### Usage Overview


* Use the `completeAward` method of the Flavor Prize Strategy contract to allocate rewards after a prize period has ended and setup a new prize period.

* To mint FLAVOR tokens, approve USDC transfers to the Pod corresponding to a chosen `prediction asset`, and then use the `deposit` method of the Pod contract and specify the amount of USDC to exchange for shares represented by a FLAVOR token balance.

* To exchange FLAVOR tokens for collateral, use the `redeemSharesInstantly` method and specify the number of shares to redeem.


-----


## Deployment

Deployment happens in a few steps. First a generic prize pool is deployed. Then the prize strategy is deployed. Finally, the prize pool is updated to use the custom prize strategy.

Make sure to consistently specify which network is being used (i.e, `--network kovan`) when running `buidler` commands.


### Deploy Prize Pool Contract

Refer to the [Pool Contracts Project Documentation](https://github.com/pooltogether/pooltogether-pool-contracts) for detailed instructions on deploying.

The easiest way to quickly deploy a prize pool is using the [Prize Pool Builder](https://builder.pooltogether.com/). Make sure to have the correct network and collateral type selected. The Single Random Winner strategy will be used, and will be modified later.

Copy the prize pool address for reference in one of the next steps where it will be referred to as `prizePoolAddress`.

### Deploy Prize Strategy Contract

Deploy the prize strategy proxy factory and builder: `buidler deploy`.

Run `buidler console` and use the prize pool address from the previous step to create the strategy contract:

```
deployed = await deployments.all()
signers = await ethers.getSigners()
builder = await ethers.getContractAt(deployed.FlavorBuilder.abi, deployed.FlavorBuilder.address, signers[0])
```

Now get the address that will be used for the deployed prize strategy contract using the generated prize pool address:

```
await builder.callStatic.createFlavorStrategy(prizePoolAddress)
```

After saving the strategy address (it will be referred to as `strategyAddress`), create the strategy:

```
await builder.createFlavorStrategy(prizePoolAddress)
```


### Configure Prize Pool Strategy


Deploy the prize strategy proxy factory and builder: `buidler deploy`.

Run `buidler console`, then call the `setPrizeStrategy` method on the pool contract, using the strategy contract address as an argument:

```
signers = await ethers.getSigners()
pool = await ethers.getContractAt('PrizePool', prizePoolAddress, signers[0])
pool.setPrizeStrategy(strategyAddress)
```


### Deploy Pods and Configure Pod Addresses

First, clone our fork of the [Pod Contracts repository](https://github.com/flavor-finance/pooltogether-pod-contracts) and edit the `scripts/migrate.js` script, setting the `poolAddress` address for the network you are using as the prize pool address from the first step.

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

Make sure to update the enviroment variables with suitable values.  You'll want to administer any pools you create, so be sure to use a mnemonic that you used to create a prize pool.

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
