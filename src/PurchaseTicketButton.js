import React, { Component } from 'react'
import EvventContract from '../build/contracts/Evvent.json'
import TixicoTokenContract from '../build/contracts/TixicoToken.json'
import cacheTicket from './utils/cacheTicket.js'

const category = 'default'

class PurchaseTicketButton extends Component {
  constructor(props) {
    super(props)

    this.handlePurchase = this.handlePurchase.bind(this)
    this.initiatePurchase = this.props.initiatePurchase.bind(this)
  }

  handlePurchase(e) {
    e.preventDefault();

    const contract = require('truffle-contract')
    const evvent = contract(EvventContract)
    const token = contract(TixicoTokenContract)
    evvent.setProvider(this.props.web3.currentProvider)
    token.setProvider(this.props.web3.currentProvider)
    var evventInstance = null
    var account = null
    var ticket = {}

    this.props.web3.eth.getAccounts((error, accounts) => {
      account = accounts[0]
      if (!account) { window.alert('Account not connected. Check your metamask!') }
      evvent.deployed().then(eventInstance => {
        evventInstance = eventInstance
        return evventInstance.getCategoryPrice(category)
        // return evventInstance.createCategory(category, 10, { from: account });
      })
      .then(price => {
        token.deployed().then(tokenInstance => {
          ticket = this.generateTicket(price)
          return evventInstance.createTicket.sendTransaction(category, ticket.row, ticket.seat, ticket.id, { from: account })
          // return {}
        }).then(() => {
          this.initiatePurchase()
          cacheTicket(ticket, 'tickets', account)
        })
      }).catch(err => {
        console.log(err.message)
      })
    })
  }

  generateTicket(price) {
    const currentTime = new Date().getTime()
    const row = Math.ceil(Math.random() * 10) + currentTime % 100
    const seat = Math.ceil(Math.random() * 10) + currentTime % 100
    let id = currentTime + Math.ceil(Math.random() * 10)
    id = id > 0 ? id : Math.random() * 100
    return { id, category, burned: false, listed: false, price, row, seat, pending: true, created: currentTime }
  }

  render() {
    return (
      <button onClick={this.handlePurchase} className="btn btn-primary js-event-buy">Buy ticket</button>
    );
  }
}

export default PurchaseTicketButton
