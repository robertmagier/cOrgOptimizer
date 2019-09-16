const Optimizer = require('corgoptimizer')
const Web3 = require('web3')
const provider_http = 'http://localhost:8545'

var web3 = new Web3(new Web3.providers.HttpProvider(provider_http))

const daiExchange = '0x9B53246dd09549E120575fed900E3C41D595496c'
const fairExchange = '0x336FcAb263982922b4e5C736Ed888D577eE817cf'
const DAT = '0x93264ff8642d0F2C21BCC78aE367B9eC6137addA'


async function main()
{
    optimizer = new Optimizer(web3,daiExchange,fairExchange,DAT)
    let result = await optimizer.optimizeBuyTransaction('11083071190')
    console.log('Result of Buy Optimization. ')
    console.log('Amount to buy on Uniswap:   ', result.uniswap.toString())
    console.log('Amount to buy on DAT:       ', result.dat.toString())

    result = await optimizer.optimizeSellTransaction('11083071190')
    console.log()
    console.log('Result of Sell Optimization.') 
    console.log('Amount to sell on Uniswap:  ', result.uniswap.toString())
    console.log('Amount to sel on DAT:       ', result.dat.toString())
}

main()


