// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;
import "@pooltogether/pooltogether-contracts/contracts/prize-strategy/PeriodicPrizeStrategy.sol";
import "@nomiclabs/buidler/console.sol";
import "./PriceChecker.sol";

contract FlavorStrategy is PeriodicPrizeStrategy, PriceChecker {

  // mapping from asset symbol to pod address
  mapping(string => address) public podAddresses;
  // mapping from asset symbol to price feed address
  mapping(string => address) public priceFeedAddresses;
  // mapping storing asset prices at start of prize period
  mapping(string => uint256) public startPrizePeriodPrices;

  string[] public assetSymbols;

  event PrizeDistributed(
    address indexed operator,
    string winningAsset
  );

  function init(
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
    uint256[] memory assetPrices = getAssetPrices();
    startPrizePeriod(assetPrices);
  }

  function addPodAddress(string memory assetSymbol, address podAddress, address priceFeedAddress) public onlyOwner {
    // only owner can add pod addresses
    require(podAddresses[assetSymbol] == address(0));
    podAddresses[assetSymbol] = podAddress;
    priceFeedAddresses[assetSymbol] = priceFeedAddress;
    assetSymbols.push(assetSymbol);
  }

  function getAssetPrices() internal returns (uint256[] memory) {
    uint256[] memory assetPrices = new uint[](assetSymbols.length);
    for (uint i=0; i<assetSymbols.length; i++) {
      address priceFeedAddress = priceFeedAddresses[assetSymbols[i]];
      uint256 assetPrice = getAssetPrice(priceFeedAddress);
      assetPrices[i] = assetPrice;
    }
    return assetPrices;
  }

  function startPrizePeriod(uint256[] memory assetPrices) internal {
      for (uint i=0; i<assetSymbols.length; i++) {
        uint256 assetPrice = i * 100; // placeholder value for testing
        startPrizePeriodPrices[assetSymbols[i]] = assetPrices[i];
      }
  }

  function calculateWinningAsset(uint256[] memory assetPrices) internal returns (string memory) {
    uint256 largestPercentChange = uint256(-100);
    string memory largestPercentChangeAsset;
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
function distributeAward(string memory winningAsset) external requireCanDistributeAward {
  uint256[] memory assetPrices = getAssetPrices();
  string memory winningAsset = calculateWinningAsset(assetPrices);

  _distributeAward(winningAsset);

  emit PrizeDistributed(_msgSender(), winningAsset);

  startPrizePeriod(assetPrices);
  // to avoid clock drift, we should calculate the start time based on the previous period start time.
  prizePeriodStartedAt = _calculateNextPrizePeriodStartTime(_currentTime());
  emit PrizePoolOpened(_msgSender(), prizePeriodStartedAt);
}

  function _distributeAward(string memory winningAsset) internal {
    uint256 prize = prizePool.captureAwardBalance();
    console.log("Winning asset: ", winningAsset);
    address winningPodAddress = podAddresses[winningAsset];
    console.log("Winning pod address: ", winningPodAddress);

    // winner gets all external tokens
    // TODO: is award all external tokens needed?
    _awardAllExternalTokens(winningPodAddress);
    _awardTickets(winningPodAddress, 100);
  }

  function _distribute(uint256 randomNumber) internal override {
  }

  modifier requireCanDistributeAward() {
    require(_isPrizePeriodOver(), "PeriodicPrizeStrategy/prize-period-not-over");
    _;
  }
}
