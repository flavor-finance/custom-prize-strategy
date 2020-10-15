// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.6.0 <0.7.0;
pragma experimental ABIEncoderV2;

import "./FlavorProxyFactory.sol";

/* solium-disable security/no-block-members */
contract FlavorBuilder {

  FlavorProxyFactory public flavorProxyFactory;

  constructor (
    FlavorProxyFactory _flavorProxyFactory
  ) public {
    require(address(_flavorProxyFactory) != address(0), "FlavorBuilder/flavorProxyFactory-not-zero");
    flavorProxyFactory = _flavorProxyFactory;
  }

  function createFlavorStrategy(
    PeriodicPrizeStrategy prizeStrategy
  ) external returns (FlavorStrategy) {
    FlavorStrategy fs = flavorProxyFactory.create();

    address[] memory externalErc20s;


    fs.init(
      prizeStrategy.trustedForwarder(),
      prizeStrategy.prizePeriodStartedAt(),
      prizeStrategy.prizePeriodSeconds(),
      prizeStrategy.prizePool(),
      address(prizeStrategy.ticket()),
      address(prizeStrategy.sponsorship()),
      prizeStrategy.rng(),
      externalErc20s
    );


    fs.transferOwnership(msg.sender);

    return fs;
  }
}
