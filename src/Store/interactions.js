/* eslint-disable no-undef */
import Web3 from "web3";
import {
    web3Loaded,
    web3AccountLoaded,
    tokenLoaded,
    exchangeLoaded,
    cancelledOrdersLoaded,
    filledOrdersLoaded,
    allOrdersLoaded
} from "./actions";
import Token from '../abis/DigitalAsset.json'
import Exchange from '../abis/Exchange.json'

// this file will handle all of our blockchain interactions

// Metamask has by default enabled privacy mode and we cant get access to it.
// this function is used to connect to web3 and metamask
// dispatch is a function which means we want to trigger a action and dispatch it with redux
// whenever dispatche is called it will be injected into one of our reducers we created and the reducers will handle that action and update the state.
export const loadWeb3 = (dispatch) => {
    const web3 = new Web3(window.web3.currentProvider);

    window.addEventListener("load", async () => {
        // modern dapp browser
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum)

            try {
                // Request account access if needed
                await window.ethereum.enable();

            } catch (error) {
                // usser denied account access
            }
        }

        // legacy dapp browser
        else if (window.web3) {
            window.web3 = new Web3(web3.currentProvider);
        }

        else {
            console.log("non-ethereum browser deted. you shoudl consider tryng metamask")
        }

    });

    dispatch(web3Loaded(web3))
    return web3
}

export const loadAccount = async (web3, dispatch) => {
    const accounts = await web3.eth.getAccounts()
    const account = accounts[0]
    dispatch(web3AccountLoaded(account))
    return account
}

export const loadToken = async (web3, networkId, dispatch) => {
    try {
        const token = web3.eth.Contract(Token.abi, Token.networks[networkId].address)
        dispatch(tokenLoaded(token))
        return token
    } catch (error) {
        console.log('Contract not deployed to the current network. Please select another network with Metamask.')
        return null
    }
}

export const loadExchange = async (web3, networkId, dispatch) => {
    try {
        const exchange = web3.eth.Contract(Exchange.abi, Exchange.networks[networkId].address)
        dispatch(exchangeLoaded(exchange))
        return exchange
    } catch (error) {
        console.log('Contract not deployed to the current network. Please select another network with Metamask.')
        return null
    }
}

export const loadAllOrders = async (exchange, dispatch) => {
    // Fetch cancelled orders with the "Cancel" event stream
    const cancelStream = await exchange.getPastEvents('Cancel', { fromBlock: 0, toBlock: 'latest' })
    // Format cancelled orders
    const cancelledOrders = cancelStream.map((event) => event.returnValues)
    // Add cancelled orders to the redux store
    dispatch(cancelledOrdersLoaded(cancelledOrders))
  
    // Fetch filled orders with the "Trade" event stream
    const tradeStream = await exchange.getPastEvents('Trade', { fromBlock: 0, toBlock: 'latest' })
    // Format filled orders
    const filledOrders = tradeStream.map((event) => event.returnValues)
    // Add cancelled orders to the redux store
    dispatch(filledOrdersLoaded(filledOrders))
  
    // Load order stream
    const orderStream = await exchange.getPastEvents('Order', { fromBlock: 0,  toBlock: 'latest' })
    // Format order stream
    const allOrders = orderStream.map((event) => event.returnValues)
    // Add open orders to the redux store
    dispatch(allOrdersLoaded(allOrders))
  }