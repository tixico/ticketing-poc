import React, { Component } from 'react'
import SecondaryMarketListView from './SecondaryMarketListView.js'

class SecondaryMarketView extends Component {
  render() {
    return (
      <div className="container evvent secondary">
        <div className="row">
          <div className="col-12">
            <SecondaryMarketListView web3={this.props.web3} updateTokenBalance={this.props.updateTokenBalance} />
          </div>
        </div>
      </div>
    );
  }
}

export default SecondaryMarketView


