import React, { Component } from 'react'

class BurnTicketButton extends Component {
  constructor(props) {
    super(props)

    this.handleOpenModal = this.props.handleOpenModal.bind(this)
  }

  render() {
    if (this.props.burned) {
      return (
        <a href="/dummy-ticket.pdf" target="_blank" className="btn btn-white btn-small">
          <span>Get ticket</span>
          <span className="ic icon-download"></span>
        </a>
      )
    } else {
      return (
        <button onClick={this.handleOpenModal} className="btn btn-danger btn-small">Check-in</button>
      )
    }
  }
}

export default BurnTicketButton
