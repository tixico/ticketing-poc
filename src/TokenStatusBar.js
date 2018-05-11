import React, { Component } from 'react'
import Modal from 'react-modal'
import EvventContract from '../build/contracts/Evvent.json'
import TixicoFaucetContract from '../build/contracts/TixicoFaucet.json'
import TixicoTokenContract from '../build/contracts/TixicoToken.json'

const modalStyle = {
  content: {
    display: 'block'
  }
}

class TokenStatusBar extends Component {
  constructor(props) {
    super(props)

    this.state = {
      showModal: false
    }

    this.handleTokenRequest = this.handleTokenRequest.bind(this)
    this.updateTokenBalance = this.props.updateTokenBalance.bind(this)
  }

  handleTokenRequest(e) {
    e.preventDefault();

    const contract = require('truffle-contract')
    const faucet = contract(TixicoFaucetContract)
    const evvent = contract(EvventContract)
    const token = contract(TixicoTokenContract)
    faucet.setProvider(this.props.web3.currentProvider)
    evvent.setProvider(this.props.web3.currentProvider)
    token.setProvider(this.props.web3.currentProvider)
    var tixicoFaucetInstance = null
    var account = null
    this.setState({
      showModal: true
    })

    this.props.web3.eth.getAccounts((error, accounts) => {
      account = accounts[0]
      if (!account) { window.alert('Account not connected. Check your metamask!') }
      faucet.deployed().then(faucetInstance => {
        tixicoFaucetInstance = faucetInstance
        return tixicoFaucetInstance.receiveTokens({ from: account })
      }).then(success => {
        this.updateTokenBalance(100)
        evvent.deployed().then(eventInstance => {
          token.deployed().then(tokenInstance => {
            return tokenInstance.approve(eventInstance.address, 1000, { from: account })
          }).then(() => {
            this.setState({
              showModal: false
            })
          })
        })
      }).catch(err => {
        console.log(err.message)
      })
    })
  }

  render() {
    return (
      <div className="token-status">
        <Modal
           isOpen={this.state.showModal}
           portalClassName="ReactModalPortal portal"
           overlayClassName="overlay"
           className="modal"
           style={modalStyle}
        >
          <div className="loader"></div>
          <p>You will have to accept two transactions. <br /> After the transactions will be successfully confirmed this dialog will dissapear.</p>
          <br />
        </Modal>
        <div className="container">
          <div className="col-12">
            <span>Your TXI balance: {this.props.tokenBalance}</span>
            <button onClick={this.handleTokenRequest} className="btn btn-primary btn-small">Get TXI</button>
          </div>
        </div>
      </div>
    );
  }
}

export default TokenStatusBar
