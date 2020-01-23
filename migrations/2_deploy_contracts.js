
// artifacts is reading the truffle artifacts that truffle looks for inside the digitalAsset abi.
//In the digitalAsset.json file it creates an abstraction/representation of the smart contract and it can read from the global artifacts variable and just require the digitalAsset out of it.
 const DigitalAsset = artifacts.require("DigitalAsset");

 module.exports = function(deployer) {
   deployer.deploy(DigitalAsset);
 };
