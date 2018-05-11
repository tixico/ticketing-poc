import React, { Component } from 'react'

class PurchaseSecondaryTicketButton extends Component {
  render() {
    const disabledText = this.props.owned ? 'On sale' : 'Sold'
    if (this.props.bought || this.props.owned) return <span className="empty">{disabledText}</span>
    return (
      <button onClick={this.props.handlePurchase} className="btn btn-primary">Buy ticket</button>
    );
  }
}

export default PurchaseSecondaryTicketButton
