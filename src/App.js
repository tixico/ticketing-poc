import React, { Component } from 'react'
import { BrowserRouter as Router, Route, NavLink } from 'react-router-dom'
import TixicoTokenContract from '../build/contracts/TixicoToken.json'
import EventView from './EventView.js'
import SecondaryMarketView from './SecondaryMarketView.js'
import TicketsView from './TicketsView.js'
import TokenStatusBar from './TokenStatusBar.js'
import Event from '../public/event.json'
import getWeb3 from './utils/getWeb3'

import './css/pure-min.css'
import './css/main.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      evvent: Event,
      web3: null,
      tokenBalance: 0
    }

    this.updateTokenBalance = this.updateTokenBalance.bind(this)
  }

  componentWillMount() {
    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })
      this.getTokenBalance()
    })
    .catch(() => {
      window.alert('Error binding web3!')
    })
  }

  getTokenBalance() {
    const contract = require('truffle-contract')
    const token = contract(TixicoTokenContract)
    token.setProvider(this.state.web3.currentProvider)
    var tixicoTokenInstance = null
    var account = null

    this.state.web3.eth.getAccounts((error, accounts) => {
      account = accounts[0]
      if (!account) { window.alert('Account not connected. Check your metamask!') }
      token.deployed().then(tokenInstance => {
        tixicoTokenInstance = tokenInstance
        return tixicoTokenInstance.balanceOf(account)
      }).then(balance => {
        this.setState({
          tokenBalance: balance.toNumber()
        })
      }).catch(err => {
        console.log(err.message)
      })
    })
  }

  updateTokenBalance(number) {
    this.setState({
      tokenBalance: this.state.tokenBalance + number
    })
  }

  render() {
    return (
      <Router>
        <div>
          <nav className="navbar navbar-default navbar-fixed-top">
            <div className="container">
              <div className="navbar-header">
                <img src="/logo.png" alt="logo" className="logo" />
              </div>
              <ul className="nav navbar-nav">
                <li><NavLink exact={true} activeClassName="active" to="/">Events</NavLink></li>
                <li><NavLink activeClassName="active" to="/tickets">Your Tickets</NavLink></li>
                <li><NavLink activeClassName="active" to="/secondary">Secondary market</NavLink></li>
              </ul>
            </div>
          </nav>
          <TokenStatusBar web3={this.state.web3} tokenBalance={this.state.tokenBalance} updateTokenBalance={this.updateTokenBalance} />
          <Route exact path="/" component={() => <EventView evvent={this.state.evvent} web3={this.state.web3} updateTokenBalance={this.updateTokenBalance} /> }/>
          <Route exact path="/secondary" component={() => <SecondaryMarketView web3={this.state.web3} updateTokenBalance={this.updateTokenBalance} /> }/>
          <Route exact path="/tickets" component={() => <TicketsView web3={this.state.web3} /> }/>
        </div>
      </Router>
    )
  }
}

export default App
