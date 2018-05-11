import React, { Component } from 'react'
import EvventContract from '../build/contracts/Evvent.json'
import TicketItemView from './TicketItemView.js'
import syncTickets from './utils/syncTickets.js'

class TicketsListView extends Component {

  constructor(props) {
    super(props)

    this.state = {
      ticketIds: [],
      cachedTicketIds: [],
      account: null
    }
  }

  componentWillMount() {
    if (this.props.web3) {
      this.retrieveTicketIds()
    }
  }

  retrieveTicketIds() {
    const contract = require('truffle-contract')
    const evvent = contract(EvventContract)
    evvent.setProvider(this.props.web3.currentProvider)
    var evventInstance = null
    var account = null

    this.props.web3.eth.getAccounts((error, accounts) => {
      account = accounts[0]
      if (!account) { window.alert('Account not connected. Check your metamask!') }
      evvent.deployed().then(eventInstance => {
        evventInstance = eventInstance
        return evventInstance.getTicketIds(account);
      })
      .then(ticketIds => {
        this.setState({
          ticketIds: ticketIds.map(id => id.toNumber())
        })
        syncTickets('tickets', account, this)
      }).catch(err => {
        console.log(err.message)
        syncTickets('tickets', account, this)
      })
    })
  }

  render() {
    return (
      <table id="js-tickets" className="user-tickets tix">
        <thead></thead>
        <tbody>
          {this.state.ticketIds.map((ticketId, i) =>
            <TicketItemView ticketId={ticketId} key={i} web3={this.props.web3} />)
          }
          {this.state.cachedTicketIds.map((ticketId, i) =>
            <TicketItemView ticketId={ticketId} key={i} web3={this.props.web3} cached={true} />
          )}
        </tbody>
      </table>
    );
  }
}

export default TicketsListView
