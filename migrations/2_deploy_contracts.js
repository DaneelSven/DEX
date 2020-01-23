/* eslint-disable no-undef */

// artifacts is reading the truffle artifacts that truffle looks for inside the digitalAsset abi.
//In the digitalAsset.json file it creates an abstraction/representation of the smart contract and it can read from the global artifacts variable and just require the digitalAsset out of it.
 const DigitalAsset = artifacts.require("DigitalAsset");
 const Exchange = artifacts.require("Exchange")

 module.exports = async function(deployer) {
  
  const accounts = await web3.eth.getAccounts();
  await deployer.deploy(DigitalAsset);
  const feeAcount = accounts[0];
  const feePercent = 10;
  await deployer.deploy(Exchange, feeAcount, feePercent);
 };
