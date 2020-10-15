const debug = require('debug')('custom-prize-strategy:deploy')

module.exports = async (buidler) => {
  const { getNamedAccounts, deployments } = buidler
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()

  debug("\n  Deploying FlavorProxyFactory...")
  const flavorProxyFactoryResult = await deploy("FlavorProxyFactory", {
    from: deployer,
    skipIfAlreadyDeployed: true
  })

  debug("\n Deploying FlavorBuilder...")
  const flavorBuilderResult = await deploy("FlavorBuilder", {
    args: [
      flavorProxyFactoryResult.address
    ],
    from: deployer,
    skipIfAlreadyDeployed: true
  })

};
