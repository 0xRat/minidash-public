import * as React from "react"
import { Link } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"

import Layout from "../components/layout"
import Seo from "../components/seo"
import { getTokenBalances } from "../utils/TokenBalances.js" 
import sushiData from '@sushiswap/sushi-data'
import mergeDeep from "../utils/mergeDeep.js"

import { 
  Box, 
  Card, 
  CardHeader, 
  CardBody, 
  CardFooter,
  DataChart,
  Grid, 
  Sidebar, 
  TextInput, 
  Button,
  Spinner,
  Text 
} from 'grommet'
import { Add } from 'grommet-icons'
import { FaGasPump } from "react-icons/fa"
import { GiStoneBlock } from "react-icons/gi"
import { ethers, utils } from "ethers"
import { DateTime, Interval, Duration } from "luxon"
import 'isomorphic-fetch'

const IndexPage = () => {
  const [enteredAddress, setEnteredAddress] = React.useState('')
  const [addresses, setAddresses] = React.useState({})
  const [interval, setIntervalId] = React.useState(null)
  const [lastBlock, setLastBlock] = React.useState(null)
  const [gasPrice, setGasPrice] = React.useState(0)
  const [active, setActive] = React.useState(null)
  const [activeToken, setActiveToken] = React.useState(null)
  const [activeData, setActiveData] = React.useState(null)
 
  const providerOpts = {projectId: process.env.INFURA_PROJECT_ID, projectSecret: process.env.INFURA_PROJECT_SECRET} 
  const [provider, setProvider] = React.useState(null)

  const [addressLength, setAddressLength] = React.useState(null)

  const [loading, setLoading] = React.useState(false)

  const addAddress = (newAddress) => {
    // TODO: use deep merge here
    let newAddrObj = {}
    newAddrObj[newAddress] = { addr: newAddress, wallet: {} }
    let newAddresses = mergeDeep(addresses, newAddrObj)
    setAddresses(newAddresses)
  }

  const setAndClearAddress = () => {
    addAddress(enteredAddress) 
    setEnteredAddress('')
  }

  const clearAddresses = () => {
    setAddresses([])
    setEnteredAddress('')
  }

  async function updateAddresses() {
    // TODO: use deep merge here
    let newAddresses = {}
    setLoading(true)
    if (provider && Object.keys(addresses).length ) {
      for (let addr of Object.keys(addresses)) {
        newAddresses[addr] = addresses[addr]
        newAddresses[addr].wallet = await getTokenBalances(addresses[addr], setAddresses, lastBlock, provider)
        newAddresses[addr].netWorth = Object.entries(newAddresses[addr].wallet).reduce(
          (acc, e) => acc + (parseFloat(e[1].priceUSD) * parseFloat(e[1].balance)), 0.0
        )
      }
      localStorage.setItem('addresses', JSON.stringify(newAddresses))
      setAddresses(newAddresses)
    }
    setLoading(false)
  }

  function updateActive(id, symbol) {
    if (active && active[0] == id && active[1] == symbol) {
      setActive(null)
    } else {
      setActive([id, symbol])
    }
  }

  React.useEffect(() => {
    async function getSeries() {
      if (active && active[0] && active[1]) {
        let now = DateTime.now()
        let interval = Interval.before(now, Duration.fromObject({ days: 7 }))
        let timestamps = interval.splitBy(Duration.fromObject({ days: 1 }))
        let newData;
        try {
          if (active[1] == 'ETH') {
            newData = await sushiData.timeseries(
              {timestamps: timestamps.map(t => t.e.ts), target: sushiData.exchange.ethPrice}, 
              {}
            )
            newData = newData.map(entry => {
              return {
                date: DateTime.fromMillis(entry.timestamp).toFormat('LLL dd'),
                price: entry.data
              }
            })
          } else {
            newData = await sushiData.timeseries(
              {timestamps: timestamps.map(t => t.e.ts), target: sushiData.exchange.token24h}, 
              {token_address: addresses[active[0]].wallet[active[1]].id}
            )
            newData = newData.map(entry => {
              return {
                date: DateTime.fromMillis(entry.timestamp).toFormat('LLL dd'),
                price: entry.data.priceUSD
              }
            })
          }
          setActiveData(newData)
        } catch (e) {
          setActiveData(null)
        }
      }
    }

    getSeries()
  }, [active])

  /*
  React.useEffect(() => {
    console.log(activeData)
  }, [activeData])
  */

  React.useEffect(() => {
    if (typeof window !== `undefined`) {
      if (!provider) {
        setProvider(ethers.providers.InfuraProvider.getWebSocketProvider(process.env.ETHERS_NETWORK, process.env.INFURA_PROJECT_ID))
      }
      const storedAddresses = JSON.parse(localStorage.getItem('addresses'))
      if (storedAddresses && Object.keys(storedAddresses).length) {
        setAddresses(storedAddresses)
      }
    }
  }, [provider])

  React.useEffect(() => {
    if (Object.keys(addresses).length != addressLength) {
      updateAddresses()
      setAddressLength(Object.keys(addresses).length)
    }
  }, [Object.keys(addresses).length]) 

  React.useEffect(() => {
    async function updateUtilVals() { 
      try {
        if (typeof window !== `undefined` && provider) {
          const newBlock = await provider.getBlockNumber()
          setLastBlock(newBlock)
          const newGas = await provider.getGasPrice()
          setGasPrice(newGas)
        }
      } catch (e) {
        console.log(e)
      }
    }
    updateUtilVals()
    setIntervalId(setInterval(() => {
      updateUtilVals()
    }, 30000))
    return clearInterval(interval) 
  }, [provider])

  if (!provider) return (<></>)

  return (
    <Layout>
      <Seo title="Home" />
      <Grid
        width='large' 
        rows={['xsmall', 'xsmall']}
        columns={['1/4', '3/4']}
        areas={[
          { name: 'sidebar', start: [0,0], end: [0,0] },
          { name: 'main', start: [1,0], end: [1,1] }            
        ]}
      >
        <Sidebar 
          width="fit-content"
          gridArea="sidebar" 
          align="center" 
          pad={{ bottom: 'small' }}
        >
          <Box
            background={`accent-${(Math.floor(Math.random() * 100)) % 4 + 1}`} 
            round='small' 
            elevation='medium'
          >
            <Box direction="row" size='xsmall' justify='between' pad='xsmall'><FaGasPump /> { utils.formatUnits(gasPrice, "gwei").substring(0, 5) }</Box>
            <Box direction="row" size='xsmall' justify='between' pad='xsmall'><GiStoneBlock /> { lastBlock }</Box>
          </Box>
        </Sidebar>
        <Box gridArea="main" width="full" pad={{ top: 'xsmall' }}>
          <Box direction="row" height='xsmall'>
            <Box width='full'>
              <TextInput
                placeholder="enter address..."
                value={enteredAddress}
                onChange={event => setEnteredAddress(event.target.value)}
              />
            </Box>
            <Box>
              { 
                !loading ? (
                  <Button 
                    primary
                    textAddition
                    icon={<Add size="small" />}
                    color='brand'
                    onClick={(e) => setAndClearAddress()}
                    disabled={loading}
                    margin={{ left: '-5px' }}
                  />
                ) : <Spinner margin={{ left: '5px', top: '5px' }}/>
              }
            </Box>
          </Box>
          <Grid
            rows={['auto']}
            margin={{ top: '40px' }}
          >
            {
              Object.entries(addresses).map(([key, account]) => {
                const netWorth = account?.netWorth?.toString()
                return (
                  <Box 
                    gap='small' 
                    pad={{ top: 'small' }} 
                    width="full" 
                    border={[{ color: '#aaaaaa', size: 'xsmall', style: 'solid', side: 'top' }]}
                    margin={{ top: '20px' }}
                  >
                    <Box 
                      direction='row' 
                      size='xxsmall'
                      width='full' 
                      gap='small'
                      alignContent='end'
                      margin={{ vertical: '20px' }}
                    >
                      <Text 
                        size='small' 
                        textAlign='end'
                      >
                        {
                          netWorth ? 
                            (<>{key}(${netWorth.substring(0,netWorth.indexOf('.') + 3)})</>) : 
                            (<Spinner size='small' />)
                        }
                      </Text>
                    </Box>
                    {
                      active && active[0] == key ?
                      activeData ?  
                        (<Box width='full'>
                          <DataChart 
                            gap='none'
                            size='fill'
                            series={[
                              {
                                label: "string",
                                prefix: "",
                                property: "date",
                                render: (value, datam, dataIndex) => (<Text size="xsmall">{value}</Text>),
                              },
                              {
                                label: "string",
                                prefix: "$",
                                property: "price",
                                render: (value, datam, dataIndex) => (<Text size="xsmall">{value}</Text>),
                              }
                            ]}
                            guide={{ x: { granularity: 'fine' } }}
                            data={activeData ? activeData : []} 
                            series={['date',{property: 'price', prefix: '$'}]}
                            axis={{ x: {granularity: 'medium'}, y: {granularity: 'medium'} }}
                            chart={[
                              { property: 'price', type: 'line', opacity: 'medium', thickness: 'xsmall' }
                            ]}
                          />
                        </Box>) : 
                        (<Box>
                          <Spinner size='small' />
                        </Box>) :
                        (<></>)
                    }
                    <Grid 
                      size="small"
                      gap="xsmall"
                      pad={{ top: 'xsmall' }}
                      fill={false}
                      rows='auto'
                      columns={['small', 'small', 'small']}
                    >
                      {
                        Object.entries(account.wallet).map(([symbol, info]) => {
                          if (info.balance) {
                            const worth = parseFloat(info.priceUSD) * parseFloat(info.balance)
                            const balance = info.balance.substring(0, info.balance.indexOf(".") +4)
                            const colorNum = (Math.floor(Math.random() * 100)) % 4 + 1
                            return (
                                <Card key={symbol} height="xsmall" width="medium">
                                  <CardHeader 
                                     pad='small' 
                                     background={'accent-' + colorNum}
                                     hoverIndicator={'neutral-' + colorNum}
                                     style={{ cursor: 'pointer' }}
                                     data-id={key} 
                                     onClick={(e) => {
                                       let splitText = e.target.innerText.split(' ')
                                       let id = e.target.getAttribute('data-id')
                                       updateActive(id, splitText[0])
                                     }}
                                  >
                                    <Text data-id={key} size='xsmall'>{`${symbol} (${info.name})`}</Text>
                                  </CardHeader>
                                  <CardBody pad='small'>
                                    <Text size='xsmall'>{`${balance} ($${Math.round(worth * 100) / 100})`}</Text>
                                  </CardBody>
                                </Card> 
                            )
                          } else {
                            return (
                              <React.Fragment key={symbol}></React.Fragment>
                            )
                          }
                        })
                      }
                    </Grid>
                  </Box>
                )
              })
            }
          </Grid>
        </Box>
      </Grid>      
    </Layout>
  )
}

export default IndexPage
