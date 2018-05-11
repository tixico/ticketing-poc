import React from 'react'
import Modal from 'react-modal'
import ToggleInput from './ToggleInput.js'
import TicketView from './TicketView.js'
import EvventContract from '../build/contracts/Evvent.json'
import BurnTicketButton from './BurnTicketButton.js'
import ListTicketButton from './ListTicketButton.js'
import cacheTicket from './utils/cacheTicket.js'
import Event from '../public/event.json'

const modalStyle = {
  content: {
    display: 'block'
  }
}

class TicketItemView extends TicketView {

  constructor(props) {
    super(props)

    this.state = {
      ticket: null,
      showModal: false,
      evvent: Event
    }

    this.openDialog = this.openDialog.bind(this)
    this.closeDialog = this.closeDialog.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.listTicket = this.listTicket.bind(this)
    this.burnTicket = this.burnTicket.bind(this)

    Modal.setAppElement('#root')
  }

  componentWillMount() {
    super.componentWillMount()
    this.getCachedItemInfo('tickets')
  }

  openDialog(state) {
    this.setState({
      [state]: true,
      showModal: true
    })
  }

  closeDialog() {
    this.setState({
      listingInitiated: false,
      burningInitiated: false,
      burningFinalized: false,
      showModal: false
    })
  }

  burnCell() {
    const cachedListings = JSON.parse(localStorage.getItem('listings'))
    const cachedBurnings = JSON.parse(localStorage.getItem('burnings'))
    const pending = this.props.cached ||
                    (cachedListings && cachedListings.map(ticket => ticket.id).includes(this.state.ticket.id) && !this.state.ticket.listed) ||
                    (cachedBurnings && cachedBurnings.map(ticket => ticket.id).includes(this.state.ticket.id) && !this.state.ticket.burned)
    if (pending) return <td>Transaction pending</td>
    if (this.state.ticket.listed || this.props.listing) return null
    return (
      <BurnTicketButton ticketId={this.state.ticket.id}
                        handleOpenModal={() => { this.openDialog('burningInitiated') }}
                        burned={this.state.ticket.burned}
                        web3={this.props.web3} />
    )
  }

  burnTicket(e) {
    e.preventDefault();

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
        return evventInstance.burnTicket.sendTransaction(this.state.ticket.id, { from: account });
      }).then(() => {
        let ticket = this.state.ticket
        ticket.burned = true
        cacheTicket(ticket, 'changed', account)
        cacheTicket(ticket, 'burnings', account)
        this.setState({
          ticket,
          burningInitiated: false,
          burningFinalized: true
        })
      }).catch(err => {
        console.log(err.message)
      })
    })
  }

  listCell() {
    const cachedListings = JSON.parse(localStorage.getItem('listings'))
    const cachedBurnings = JSON.parse(localStorage.getItem('burnings'))
    const empty = (this.state.ticket.burned || this.props.cached || this.props.listing) ||
                  (cachedListings && cachedListings.map(ticket => ticket.id).includes(this.state.ticket.id) && !this.state.ticket.listed) ||
                  (cachedBurnings && cachedBurnings.map(ticket => ticket.id).includes(this.state.ticket.id) && !this.state.ticket.burned)
    if (empty) return null
    return (
      <ListTicketButton ticketId={this.state.ticket.id}
                        listed={this.state.ticket.listed}
                        listingPrice={this.state.listingPrice}
                        handleOpenModal={() => { this.openDialog('listingInitiated') }}
                        handleInputChange={this.handleInputChange}
                        web3={this.props.web3} />
      )
  }

  handleInputChange(e) {
    this.setState({ listingPrice: e.target.value })
  }

  listTicket(e) {
    e.preventDefault();
    if (this.state.ticket.id === 0) {
      console.log('something went wrong')
      return false
    }
    const price = parseInt(this.refs.listPrice.refs.inputValue.value, 10)
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
        return evventInstance.listTicket.sendTransaction(this.state.ticket.id, price, { from: account });
      }).then(() => {
        let ticket = this.state.ticket
        ticket.listed = true
        ticket.price = price
        cacheTicket(ticket, 'listings', account)
        cacheTicket(ticket, 'changed', account)
        this.setState({
          ticket,
          showModal: false,
        })
      }).catch(err => {
        console.log(err.message)
      })
    })
  }

  renderStatusText() {
    if (this.state.ticket.listed) return 'Listed on the secondary market'
    if (this.state.ticket.burned) return 'Checked in'
    return 'Need to check in or list for sale'
  }

  renderModalContent() {
    if (this.state.listingInitiated) {
      return (
        <div>
          <h4>List ticket in secondary market</h4>

          <ToggleInput  label={'Price'}
                        value={this.state.listingPrice}
                        updateValue={this.updateListingPrice}
                        ref="listPrice" />
          <br />
          <button className="btn btn-primary" onClick={this.listTicket}>Accept listing</button>
        </div>
      )
    }


    if (this.state.burningInitiated) {
      return (
        <div>
          <h4>Information</h4>

          <p>You will now see a MetaMask prompt. <br/>Accepting the transaction will burn your ticket on the blockchain. <br/>This is irreversible!</p>
          <br />
          <button className="btn btn-primary" onClick={this.burnTicket}>Burn ticket</button>
        </div>
      )
    }

    if (this.state.burningFinalized) {
      return (
        <div>
          <h4>Checked in!</h4>

          <p>Great, you did it! See you at the event!</p>
          <br />
          <button className="btn btn-primary" onClick={this.closeDialog}>Close</button>
        </div>
      )
    }
  }

  renderButtons() {
    if (this.props.cached) return <td><span className="unconf">Not confirmed</span></td>
    return (
      <React.Fragment>
        <Modal  isOpen={this.state.showModal}
                portalClassName="ReactModalPortal portal"
                overlayClassName="overlay"
                className="modal"
                style={modalStyle} >
          {this.renderModalContent()}
        </Modal>
        <td>
          {this.burnCell()}
          {this.listCell()}
        </td>
      </React.Fragment>
    )
  }
}

export default TicketItemView
