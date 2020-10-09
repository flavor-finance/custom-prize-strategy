// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;
import "@pooltogether/pooltogether-contracts/contracts/prize-strategy/PeriodicPrizeStrategy.sol";
import "@nomiclabs/buidler/console.sol";

contract FlavorStrategy is PeriodicPrizeStrategy {

  // mapping from asset symbol to pod pod address
  mapping(string => address) public podAddresses;
  // mapping storing asset prices at start of prize period
  mapping(string => uint256) public startPrizePeriodPrices;

  string[] assetSymbols;

  function initialize(
    address _trustedForwarder,
    uint256 _prizePeriodStart,
    uint256 _prizePeriodSeconds,
    PrizePool _prizePool,
    address _ticket,
    address _sponsorship,
    RNGInterface _rng,
    address[] memory _externalErc20s
  ) public initializer {
    // TODO: rng isn't needed for flavor strategy
    PeriodicPrizeStrategy.initialize(
      _trustedForwarder,
      _prizePeriodStart,
      _prizePeriodSeconds,
      _prizePool,
      _ticket,
      _sponsorship,
      _rng,
      _externalErc20s
    );
    uint256[] assetPrices = getAssetPrices();
    startPrizePeriod(assetPrices);

  }

  function addPodAddress(string assetSymbol, address podAddress) public onlyOwner {
    // only owner can add pod addresses
    require(!podAddresses[assetSymbol]);
    podAddresses[assetSymbol] = podAddress;
    assetSymbols.push(assetSymbol);
  }

  function getAssetPrices() internal {
    uint256 assetPrices = [];
    for (uint i=0; i<assetSymbols.length; i++) {
      // TODO: get oracle price feed data
      uint256 assetPrice = 0;
      assetPrices.push(assetPrice);
    }
  }

  function startPrizePeriod(uint256[] assetPrices) internal {
      for (uint i=0; i<assetSymbols.length; i++) {
        uint256 assetPrice = i * 100; // placeholder value for testing
        startPrizePeriodPrices[assetSymbols[i]] = assetPrices[i];
      }
  }

  function calculateWinningAsset(uint256[] assetPrices) internal returns (string) {
    uint256 largestPercentChange = -Infinity;
    string largestPercentChangeAsset;
    for (uint i=0; i<assetSymbols.length; i++) {
      uint256 startPrice = startPrizePeriodPrices[assetSymbols[i]];
      uint256 endPrice = assetPrices[i];
      uint256 priceDiff = endPrice - startPrice;
      uint256 percentChange = priceDiff/startPrice * 100;
      if (percentChange > largestPercentChange){
        largestPercentChange = percentChange;
        largestPercentChangeAsset = assetSymbols[i];
      }
    }
    return largestPercentChangeAsset;
  }

/// @notice Completes the award process and awards the winners.
// Because randomNumber isn't used, startAward function is not needed
function completeAward(string winningAsset) external override requireCanCompleteAward {
  uint256[] assetPrices = getAssetPrices();
  // string winningAsset = calculateWinningAsset(assetPrices);
  // for initial testing, assetSymbol is passed in manually

  _distribute(winningAsset);

  emit PrizePoolAwarded(_msgSender(), winningAsset);

  startPrizePeriod(assetPrices);
  // to avoid clock drift, we should calculate the start time based on the previous period start time.
  prizePeriodStartedAt = _calculateNextPrizePeriodStartTime(_currentTime());
  emit PrizePoolOpened(_msgSender(), prizePeriodStartedAt);
}

  function _distribute(string winningAsset) internal override {
    uint256 prize = prizePool.captureAwardBalance();
    console.log("Winning asset: ", winningAsset);
    address winningPodAddress = podAddresses[winningAsset];
    console.log("Winning pod address: ", winningPodAddress);

    // winner gets all external tokens
    // TODO: is award all external tokens needed?
    _awardAllExternalTokens(winningPodAddress);
    _awardTickets(winningPodAddress, 100);
  }

  modifier requireCanCompleteAward() {
    require(_isPrizePeriodOver(), "PeriodicPrizeStrategy/prize-period-not-over");
    _;
  }
}
