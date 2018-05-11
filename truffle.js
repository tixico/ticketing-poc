// Allows us to use ES6 in our migrations and tests.
require('babel-register')

module.exports = {
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  networks: {
    development: {
      host: '127.0.0.1',
      port: 7545,
      network_id: '*' // Match any network id
    },
    rinkeby: {
      host: '127.0.0.1',
      port: 8545,
      network_id: 4, // Rinkeby id,
      from: '0xFE1A43B2110e387611D9834F3D4f9F19eCF6CF5E',
      gas: 6712388,
      gasPrice: 65000000000,
    }
  }
}
