/* eslint-disable react/jsx-no-undef */
import React, { Component } from 'react';
import './App.css';
import { loadWeb3, loadAccount, loadToken, loadExchange } from '../Store/interactions'
import { connect } from 'react-redux';
import { contractsLoadedSelector } from '../Store/selectors';
import Navbar from './Navbar';
import Content from './Content';


class App extends Component {
  // react lifecycle method 
  componentWillMount() {
    this.loadBlockchainData(this.props.dispatch)
  }

  async loadBlockchainData(dispatch) {
    const web3 = loadWeb3(dispatch)
    await web3.eth.net.getNetworkType()
    const networkId = await web3.eth.net.getId()
    await loadAccount(web3, dispatch)
    const token = await loadToken(web3, networkId, dispatch)
    if (!token) {
      window.alert('Token smart contract not detected on the current network, please select another network on metamask')
    }
    const exchange = await loadExchange(web3, networkId, dispatch)
    if (!exchange) {
      window.alert('Token smart contract not detected on the current network, please select another network on metamask')
    }
  }


  render() {
    return (
      <div>
        <Navbar />
        {this.props.contractsLoaded ? <Content /> : <div className="content"></div>}

      </div>
    );
  }
}


// this is a helper function to have a simpler way to access your state properties
function mapStateToProps(state) {
  console.log("contractsLoaded", contractsLoadedSelector(state))

  return {
    contractsLoaded: contractsLoadedSelector(state)
  }
}

// connect is used for connecting our app commponents to redux store
export default connect(mapStateToProps)(App);
