import * as React from 'react'
import 'isomorphic-fetch'
import sushiData from '@sushiswap/sushi-data'
import feedRegistryInterfaceABI from './feedRegistryInterfaceABI.js'
import mergeDeep from './mergeDeep.js'
import { ethers, utils } from "ethers"


const getTokens = () => {
  const tokenSource = 'https://tokens.coingecko.com/uniswap/all.json';
  return fetch(tokenSource, {
    methods: 'GET',
    headers: { 'Content-Type': 'application/json', },
  }).then(data => data.json())
}

const getTokenBalance = async (addr, token, provider) => {
  //const USD = '0x0000000000000000000000000000000000000348'
  //console.log(USD)
  const abi = [
      // Read-Only Functions
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function symbol() view returns (string)",

      // Authenticated Functions
      "function transfer(address to, uint amount) returns (bool)",

      // Events
      "event Transfer(address indexed from, address indexed to, uint amount)"
  ]
  const tokenContract = new ethers.Contract(token.id, abi, provider)
  let balance;
  let balanceResp;
  try {
    balanceResp = await tokenContract.balanceOf(addr)
    balance = ethers.BigNumber.from(balanceResp._hex)
  } catch (e) {
    balance = 0
    console.log(e)
  }
   
  return { ...token, balance: utils.formatUnits(balance, token.decimals) }
}

const updateToken = (token, address, setAddresses) => {
  let update = {}
  update[address.addr] = { wallet: {} }
  update[address.addr].wallet[token.symbol] = token
  setAddresses(prev => { 
    let updatedObj = mergeDeep(prev, update)
    return updatedObj
  })
}

export const getTokenBalances = async (address, setAddresses, blockNum, provider) => {
  let ret = {}
  let addr = address.addr
  let wallet = address.wallet
  //const tokens = await getTokens()

  //console.log(addr, token)
  //const oracleAddr = process.env.CHAINLINK_ORACLE_MAINNET
  /*
  const oracleAddr = '0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf'
  const abi = feedRegistryInterfaceABI()
  console.log(abi, oracleAddr)
  const ethersContract = new ethers.Contract(oracleAddr, abi, provider)
  console.log(ethersContract)
  
  for (let token of tokens.tokens) {
    const tokenPrice = await getTokenBalance(addr, token.address, contract)
    ret[token.address] = { symbol: token.symbol, name: token.name, price: tokenPrice, decimals: token.decimals }
  }
  */
  try {
    const ethBalance = await provider.getBalance(addr)
    const ethPrice = await sushiData.exchange.ethPrice()
    ret['ETH'] = { balance: utils.formatUnits(ethBalance, 18), priceUSD: ethPrice, name: 'Ethereum' } 
    const tokens = await sushiData.exchange.tokens24h()
    for (let token of tokens) {
      if (wallet[token.id]?.balance) {
        ret[token.symbol] = wallet[token.id];
      } else {
        let walletEntry = await getTokenBalance(addr, token, provider)
        if (parseFloat(walletEntry.balance) > 0.0) {
          let observer = await sushiData.exchange.observeToken({ token_address: token.id })
          observer.subscribe({ next: (token) => updateToken(token, address, setAddresses), error: (e) => console.log(e) })
          ret[token.symbol] = walletEntry
        }
      }
    }
  } catch (e) {
    console.log(e)
  }
   
  return ret
}
