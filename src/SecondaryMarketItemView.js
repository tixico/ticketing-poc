import React from 'react'
import Modal from 'react-modal'
import TicketView from './TicketView.js'
import EvventContract from '../build/contracts/Evvent.json'
import TixicoTokenContract from '../build/contracts/TixicoToken.json'
import PurchaseSecondaryTicketButton from './PurchaseSecondaryTicketButton.js'
import cacheTicket from './utils/cacheTicket.js'
import Event from '../public/event.json'

const modalStyle = {
  content: {
    display: 'block'
  }
}

class SecondaryMarketItemView extends TicketView {

  constructor(props) {
    super(props)

    // normally event would be set in will mount
    this.state = {
      ticket: null,
      bought: false,
      evvent: Event,
      showModal: false,
      mounted: false,
    }

    this.updateTokenBalance = this.props.updateTokenBalance.bind(this)
    this.handleOpenModal = this.handleOpenModal.bind(this)
    this.handleCloseModal = this.handleCloseModal.bind(this)
    this.initiatePurchase = this.initiatePurchase.bind(this)
    this.handlePurchase = this.handlePurchase.bind(this)

    Modal.setAppElement('#root')
  }

  componentWillMount() {
    super.componentWillMount()
    if (this.props.cached) this.getCachedItemInfo('listings')
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

  initiatePurchase() {
    this.setState({
      purchaseInitiated: true,
      showModal: true
    })
  }

  handleOpenModal () {
    this.setState({
      showModal: true
    });
  }

  handleCloseModal () {
    this.setState({
      showModal: false,
      purchaseInitiated: false
    });
    this.updateTokenBalance(-this.state.ticket.price)
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

    this.props.web3.eth.getAccounts((error, accounts) => {
      account = accounts[0]
      if (!account) { window.alert('Account not connected. Check your metamask!') }
      evvent.deployed().then(eventInstance => {
        evventInstance = eventInstance
      })
      .then(() => {
        evvent.deployed().then(eventInstance => {
          return evventInstance.swapTicket(this.state.ticket.id, { from: account })
        })
      })
      .then(result => {
        this.initiatePurchase()
        cacheTicket(this.state.ticket, 'tickets', account)
        if (this.state.mounted) this.setState({ bought: true })
        return result
      }).catch(err => {
        console.log(err.message)
      })
    })
  }

  renderModalContent() {
    if (this.state.purchaseInitiated) {
      return (
        <div>
          <h4>Success!</h4>
          <p>Your ticket will be available in Your Tickets tab. <br /> Make sure you don’t forget to check it in!</p>
          <br />
          <button className="btn btn-primary" onClick={this.handleCloseModal}>Continue</button>
        </div>
      )
    } else {
      return (
        <div>
          <h4>Information</h4>
          <p>The purchase will be handled by Metamask. <br /> You will have to accept a transaction.</p>
          <br />
          <PurchaseSecondaryTicketButton  bought={this.state.bought}
                                          owned={this.props.owned}
                                          ticket={this.state.ticket}
                                          handlePurchase={this.handlePurchase}
                                          initiatePurchase={this.initiatePurchase}
                                          web3={this.props.web3} />
        </div>
      )
    }
  }

  renderStatusText() {
    if (this.props.owned) return 'Listed'
    if (this.state.ticket.listed && !this.state.bought) return 'Available'
    return 'Sold'
  }

  renderSmallButton() {
    if (this.state.bought) {
      return ( <span className="empty">Sold</span> )
    }
    else if (!this.props.owned) {
       return (
        <button className="btn btn-primary btn-small" onClick={this.handleOpenModal}>Buy ticket</button>
      )
    } else {
      return ( <span className="empty">On sale</span> )
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
          <div className="round-wrap-btn small">
            <span className="price-tag tag">{this.state.ticket.price} TXI</span>
            {this.renderSmallButton()}
          </div>
        </td>
      </React.Fragment>
    )
  }
}

export default SecondaryMarketItemView
