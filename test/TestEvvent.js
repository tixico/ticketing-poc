var Evvent = artifacts.require("Evvent")
var TixicoToken = artifacts.require("TixicoToken")
var TixicoFaucet = artifacts.require("TixicoFaucet")

contract('Evvent', function(accounts) {
  it("Should allow the owner to create a category.", function() {
    var evvent = null
    const categoryName = 'Default1'
    return Evvent.deployed().then(function (evventInstance) {
      evvent = evventInstance
      return evvent.createCategory(categoryName, 5, {from: accounts[0]})
    }).then(function(category) {
      return evvent.getCategoryPrice(categoryName)
    }).then(function(price) {
      assert.equal(price, 5, "Saves category.")
    })
  })

  it("Should not allow the other people to create a category.", function() {
    var evvent = null
    const categoryName = 'Default2'
    return Evvent.deployed().then(function (evventInstance) {
      evvent = evventInstance
      return evvent.createCategory(categoryName, 6, {from: accounts[1]})
    }).catch(function(error) {
      assert.equal(!!error, true, "Throws exception.")
    })
  })

  it("Everyone should be able to purchase a ticket.", function() {
    var evvent = null
    const categoryName = 'Default1'
    return TixicoFaucet.deployed().then(function(faucetInstance) {
      faucetInstance.receiveTokens({from: accounts[1]})
      return Evvent.deployed().then(function (evventInstance) {
        evvent = evventInstance
        return evventInstance.getCategoryPrice(categoryName)
      }).then(function(price) {
        TixicoToken.deployed().then(function (tokenInstance) {
          return tokenInstance.approve(evvent.address, price.toNumber(), { from: accounts[1] })
        }).then(function(approval) {
          return evvent.createTicket(categoryName, 1, 1, 12311, {from: accounts[1]})
        }).then(function(ticket) {
          return evvent.getTicketIds(accounts[1])
        }).then(function(ids){
          assert.equal(ids.length, 1, "Stores ticket.")
        })
      })
    })
  })

  it("Cannot list a ticket that is not owned by lister.", function() {
    var evvent = null
    const categoryName = 'Default1'
    return TixicoFaucet.deployed().then(function(faucetInstance) {
      faucetInstance.receiveTokens({from: accounts[1]})
      return Evvent.deployed().then(function (evventInstance) {
        evvent = evventInstance
        return evventInstance.getCategoryPrice(categoryName)
      }).then(function(price) {
        TixicoToken.deployed().then(function (tokenInstance) {
          return tokenInstance.approve(evvent.address, price.toNumber(), { from: accounts[1] })
        }).then(function(approval) {
          return evvent.createTicket(categoryName, 1, 1, 1232, {from: accounts[1]})
        }).then(function(ticket) {
          return evvent.getTicketIds(accounts[1])
        }).then(function(ids) {
          return evvent.listTicket(ids[0], 5, { from: accounts[0] })
        }).catch(function(error) {
          assert.equal(!!error, true, "Throws exception.")
        })
      })
    })
  })

  it("Can list a ticket that is owned by lister.", function() {
    var evvent = null
    const categoryName = 'Default1'
    return TixicoFaucet.deployed().then(function(faucetInstance) {
      faucetInstance.receiveTokens({from: accounts[1]})
      return Evvent.deployed().then(function (evventInstance) {
        evvent = evventInstance
        return evventInstance.getCategoryPrice(categoryName)
      }).then(function(price) {
        TixicoToken.deployed().then(function (tokenInstance) {
          return tokenInstance.approve(evvent.address, price.toNumber(), { from: accounts[1] })
        }).then(function(approval) {
          return evvent.createTicket(categoryName, 1, 1, 1231, {from: accounts[1]})
        }).then(function(ticket) {
          return evvent.getTicketIds(accounts[1])
        }).then(function(ids) {
          return evvent.listTicket(ids[0], 5, { from: accounts[1] })
        }).then(function(listing) {
          assert.equal(listing.logs[0].event, 'LogTicketListed', "Lists ticket.")
        })
      })
    })
  })
})
