import React, { Component } from 'react'
import EvventContract from '../build/contracts/Evvent.json'
import SecondaryMarketItemView from './SecondaryMarketItemView.js'
import syncTickets from './utils/syncTickets.js'

class SecondaryMarketListView extends Component {

  constructor(props) {
    super(props)

    this.state = {
      ticketIds: [],
      userTicketIds: [],
      cachedTicketIds: [],
      mounted: false
    }
  }

  componentWillMount() {
    if (this.props.web3) {
      this.retrieveTicketIds()
    }
  }

  componentDidMount() {
    this.setState({
      mounted: true
    })
  }

  componentWillUnmount() {
    this.setState({
      mounted: false
    })
  }

  sync(tIds) {
    return this.props.web3.eth.getAccounts((error, accounts) => {
      if (!accounts[0]) { window.alert('Account not connected. Check your metamask!') }
      return syncTickets('listings', accounts[0], this, tIds)
    })
  }

  retrieveTicketIds() {
    const contract = require('truffle-contract')
    const evvent = contract(EvventContract)
    evvent.setProvider(this.props.web3.currentProvider)
    var evventInstance = null
    var account = null
    var user = null
    var all = null

    this.props.web3.eth.getAccounts((error, accounts) => {
      account = accounts[0]
      if (!account) { window.alert('Account not connected. Check your metamask!') }
      evvent.deployed().then(eventInstance => {
        evventInstance = eventInstance
        return evventInstance.getListedTicketIds.call()
      }).then(listedIds => {
        all = new Set(listedIds.map(id => id.toNumber()))
        this.sync([...all])
        return evventInstance.getTicketIds.call(account)
      })
      .then(ticketIds => {
        let tempIds = new Set(JSON.parse(localStorage.getItem(`tickets-${account}`)).map(t => t.id))
        user = new Set(ticketIds.filter(id => id.c[0] !== 0).map(id => id.toNumber()))
        const usrTickets = [...user].filter(x => all.has(x))
        const tickets = [...all].filter(x => !user.has(x) && !tempIds.has(x))
        if (this.state.mounted) {
          this.setState({
            userTicketIds: usrTickets,
            ticketIds: tickets
          })
        }
        return true
      }).catch(err => {
        console.log(err.message)
        return this.sync()
      })
    })
  }

  render() {
    return (
      <div>
        {(this.state.cachedTicketIds.length + this.state.userTicketIds.length) > 0 &&
          <div>
            <h2>My listed tickets</h2>
            <table id="js-tickets" className="user-tickets tix">
              <thead></thead>
              <tbody>
                {this.state.userTicketIds.map((ticketId, i) => <SecondaryMarketItemView ticketId={ticketId} key={i} web3={this.props.web3} owned={true} updateTokenBalance={this.props.updateTokenBalance} />)}
                {this.state.cachedTicketIds.map((ticketId, i) => <SecondaryMarketItemView ticketId={ticketId} key={i} web3={this.props.web3} owned={true} cached={true} updateTokenBalance={this.props.updateTokenBalance} />)}
              </tbody>
            </table>
          </div>
        }
        {this.state.ticketIds.length > 0 &&
          <div>
            <h2>All listed tickets</h2>
            <table id="js-tickets" className="user-tickets tix">
              <thead></thead>
              <tbody>
                {this.state.ticketIds.map((ticketId, i) => <SecondaryMarketItemView ticketId={ticketId} key={i} web3={this.props.web3} updateTokenBalance={this.props.updateTokenBalance} />)}
              </tbody>
            </table>
          </div>
        }
      </div>
    );
  }
}

export default SecondaryMarketListView
