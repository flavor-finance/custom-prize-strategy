const FlavorBuilder = artifacts.require("FlavorBuilder");
const FlavorProxyFactory = artifacts.require("FlavorProxyFactory");

var chai = require("chai"),
  expect = chai.expect,
  should = chai.should();

function tokens(n) {
  return web3.utils.toWei(n, "ether");
}

contract("FlavorStrategy", ([owner, investor]) => {
  let flavorBuilderInst, flavorProxyFactoryInst;

  before(async () => {
    // Load Contracts
    flavorProxyFactoryInst = await FlavorProxyFactory.new();
    flavorBuilderInst = await FlavorBuilder.new(flavorProxyFactoryInst.address);
    console.log("flavorBuilder address: ", flavorBuilderInst.address);
    console.log("flavorProxyFactory address: ", flavorProxyFactoryInst.address);
  });
});
