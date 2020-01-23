// this deploys the migration contract that came preinstalled when running truffle,
// truffle uses the migrations.sol smart contract to manage all subsequente migrations
const Migrations = artifacts.require("Migrations");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
};
