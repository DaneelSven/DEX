// Setting up truffle to work with the Es6 features
require('babel-polyfill');
require('babel-register');

// will inject all our enviroment variables into our truffle project
require('dotenv').config();



module.exports = {

  networks: {
    // development settings to connect to our ganache blockchain.
   development: {
     host: "127.0.0.1",
     port: 7545,
     network_id: "*" // Match any network id
   }
  },

  // change where the smart contracts go and the abi's go
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',


  // Configure your compilers
  compilers: {
    // truffle is responsible for compiling our source code into machine readable code this is what solc is for
    solc: {
      optimizer: {
        enable: true,
        runs: 200
      }

    }
  }
}
