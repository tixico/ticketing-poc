import React, { Component } from 'react'

class ListTicketButton extends Component {
  constructor(props) {
    super(props)

    this.handleOpenModal = this.props.handleOpenModal.bind(this)
    this.handleInputChange = this.props.handleInputChange.bind(this)
  }

  render() {
    if (this.props.listed) {
      return (
        <div>
          <a href="/secondary" className="btn btn-primary btn-small">View listing</a>
        </div>
      )
    } else {
      return (
        <div>
          <button onClick={this.handleOpenModal} className="btn btn-primary btn-small">List for sale</button>
        </div>
      )
    }
  }
}

export default ListTicketButton
