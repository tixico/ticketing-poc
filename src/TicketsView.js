import React, { Component } from 'react'
import TicketsListView from './TicketsListView.js'

class TicketsView extends Component {
  render() {
    return (
        <div className="container evvent tickets">
          <div className="row">
            <div className="col-12">
              <h2>Your tickets</h2>
              <TicketsListView web3={this.props.web3} />
            </div>
          </div>
        </div>
    );
  }
}

export default TicketsView
