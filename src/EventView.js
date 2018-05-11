import React, { Component } from 'react'
import Modal from 'react-modal'
import $ from "jquery"
import PurchaseTicketButton from './PurchaseTicketButton.js'
import EvventContract from '../build/contracts/Evvent.json'

const modalStyle = {
  content: {
    display: 'block'
  }
}

class EventView extends Component {
  constructor(props) {
    super(props)

    this.state = {
      ticketCount: '???',
      showModal: false,
      purchaseInitiated: false,
    }

    this.updateTokenBalance = this.props.updateTokenBalance.bind(this)
    this.handleOpenModal = this.handleOpenModal.bind(this)
    this.handleCloseModal = this.handleCloseModal.bind(this)
    this.initiatePurchase = this.initiatePurchase.bind(this)

    Modal.setAppElement('#root')
  }

  componentWillMount() {
    if (this.props.web3) {
      this.remainingTickets()
    }
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
    this.updateTokenBalance(-10)
  }

  remainingTickets() {
    const contract = require('truffle-contract')
    const evvent = contract(EvventContract)
    evvent.setProvider(this.props.web3.currentProvider)

    evvent.deployed().then(eventInstance => {
      return eventInstance.ticketsLeft()
    }).then((ticketCount) => {
      this.setState({
        ticketCount: ticketCount.toNumber()
      })
    }).catch(err => {
      console.log(err.message)
    })
  }

  revealDescription(e) {
    $('.desc').removeClass('expanded')
    $(e.target).closest('.desc').addClass('expanded')
  }

  textToggler() {
    if (this.props.evvent.description.length < 450) return null
    return (
      <a className="more" onClick={this.revealDescription}>
        <span>More about the event</span>
        <span className="ic icon-chevron-down"></span>
      </a>
    )
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
          <PurchaseTicketButton
            evvent={this.props.evvent}
            initiatePurchase={this.initiatePurchase}
            web3={this.props.web3}
          />
        </div>
      )
    }
  }

  render() {
    const toggler = this.textToggler();
    return (
      <div className="container evvent">
        <Modal
           isOpen={this.state.showModal || this.state.purchaseInitiated}
           portalClassName="ReactModalPortal portal"
           overlayClassName="overlay"
           className="modal"
           style={modalStyle}
        >
          {this.renderModalContent()}
        </Modal>
        <div className="row">
          <div className="col-12">
            <h2>Upcoming events</h2>
          </div>
        </div>
        <div className="row event-list">
          <div className="col-12">
            <div className="row event-row">
              <div className="seperator col-12">
                <div></div>
              </div>
              <div className="col-md-3">
                <div className="event-image" style={{backgroundImage: `url(${this.props.evvent.image})`}}></div>
              </div>
              <div className="col-md-9">
                <h4>{this.props.evvent.name}</h4>
                <div className="event-details">
                  <div className="detail">
                    <span className="ic icon-event-location"></span>
                    <span>{this.props.evvent.location}</span>
                  </div>
                  <div className="detail">
                    <span className="ic icon-event-date"></span>
                    <span>{this.props.evvent.date}</span>
                  </div>
                  <div className="detail">
                    <span className="ic icon-event-time"></span>
                    <span>{this.props.evvent.time}</span>
                  </div>
                </div>
                <div className="desc">
                  <p>{this.props.evvent.description}</p>
                  {toggler}
                </div>
                <div className="controls">
                  <span className="tickets-left">{this.state.ticketCount} tickets left</span>
                  <button className="btn btn-primary" onClick={this.handleOpenModal}>Buy ticket</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default EventView
