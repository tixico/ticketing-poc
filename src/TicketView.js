import React, { Component } from 'react'
import EvventContract from '../build/contracts/Evvent.json'
import Event from '../public/event.json'
import removeTicket from './utils/removeTicket.js'

class TicketView extends Component {

  constructor(props) {
    super(props)

    this.state = {
      ticket: null,
      evvent: Event,
      mounted: false
    }
  }

  componentWillMount() {
    if (this.props.web3 && !this.props.cached) {
      this.retrieveTicketInformation(this.props.ticketId)
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

  retrieveCachedTicket(key) {
    var ticket = null
    this.props.web3.eth.getAccounts((error, accounts) => {
      if (!accounts[0]) { window.alert('Account not connected. Check your metamask!') }
      const cachedTickets = JSON.parse(localStorage.getItem(`${key}-${accounts[0]}`))
      if (!cachedTickets) { return null }
      ticket = cachedTickets.filter(ticket => ticket.id === this.props.ticketId)[0]
    })
    return ticket
  }

  getCachedItemInfo(key) {
    this.props.web3.eth.getAccounts((error, accounts) => {
      if (!accounts[0]) { window.alert('Account not connected. Check your metamask!') }
      const cachedTickets = JSON.parse(localStorage.getItem(`${key}-${accounts[0]}`))
      if (!cachedTickets) { return null }
      const ticket = cachedTickets.filter(ticket => ticket.id === this.props.ticketId)[0]
      if (this.state.mounted) this.setState({ ticket })
    })
  }

  retrieveTicketInformation(tid) {
    const contract = require('truffle-contract')
    const evvent = contract(EvventContract)
    evvent.setProvider(this.props.web3.currentProvider)
    var evventInstance = null

    evvent.deployed().then(eventInstance => {
      evventInstance = eventInstance
      return evventInstance.getTicketInformation(tid);
    })
    .then(ticket => {
      var changedTicket = null;
      var oTicket = this.objectifyTicket(ticket)
      this.props.web3.eth.getAccounts((error, accounts) => {
        if (!accounts[0]) { window.alert('Account not connected. Check your metamask!') }
        const cachedTickets = JSON.parse(localStorage.getItem(`changed-${accounts[0]}`))
        if (cachedTickets) changedTicket = cachedTickets.filter(ticket => ticket.id === this.props.ticketId)[0]
        if (!!changedTicket) {
          let stateTicket = changedTicket
          if ((changedTicket.burned === oTicket.burned && changedTicket.listed === oTicket.listed)) {
            stateTicket = oTicket
            this.props.web3.eth.getAccounts((error, accounts) => {
              return removeTicket(changedTicket, 'changed', accounts[0])
            })
          }
          if (this.state.mounted) this.setState({ ticket: stateTicket })
        } else {
          if (this.state.mounted) this.setState({ ticket: oTicket })
        }
      })
    }).catch(err => {
      console.log(err.message)
    })
  }

  objectifyTicket(ticket) {
    return {
      id: this.props.ticketId,
      category: ticket[0],
      burned: ticket[1],
      listed: ticket[2],
      price: ticket[3].toNumber(),
      row: ticket[4].toNumber(),
      seat: ticket[5].toNumber(),
      pending: false,
      created: new Date().getTime()
    }
  }

  renderStatusText() {
    // override this method
  }

  renderButtons() {
    // override this method
  }

  render() {
    if (!this.state.ticket) return null
    return (
      <tr className={"ticket " + (this.state.ticket.listed ? 'listed' : '') + (this.state.ticket.burned ? 'burned' : '')}>
        <td>
          <span className="status">{this.renderStatusText()}</span>
          <div className="event-image" style={{backgroundImage: `url(${this.state.evvent.image})`}}></div>
        </td>
        <td>
          <h4>{this.state.evvent.name}</h4>
          <div className="event-details">
            <div className="detail">
              <span className="ic icon-event-location"></span>
              <span>{this.state.evvent.location}</span>
            </div>
            <div className="detail">
              <span className="ic icon-event-date"></span>
              <span>{this.state.evvent.date}</span>
            </div>
            <div className="detail">
              <span className="ic icon-event-time"></span>
              <span>{this.state.evvent.time}</span>
            </div>
            <div className="detail">
              <span className="ic icon-info"></span>
              <span>Category {this.state.ticket.category}, Row {this.state.ticket.row}, Seat {this.state.ticket.seat}</span>
            </div>
          </div>
        </td>
        {this.renderButtons()}
      </tr>
    );
  }
}

export default TicketView
