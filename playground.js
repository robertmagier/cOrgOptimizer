var exchangeABI = require('./uniswapABI')
const tokenABI = require('./tokenABI')
const { tokens, protocols } = require("hardlydifficult-test-helpers");
const UniswapBroker = require('./lib/UniswapTokenPair.js/index.js.js')
const promisify = require('./lib/promisify')
const FairBroker = require('./lib/fairBroker')
const DaiTestExchange = require('./lib/daiTestExchange')

const BN = require('bignumber.js')

const Web3 = require('web3')

const provider_wss = 'wss://mainnet.infura.io/ws/v3/1083bd1be8444957a770056562d20ded'
const provider_http = 'http://localhost:8545'

const exchange1Address='0x701564Aa6E26816147D4fa211a0779F1B774Bb9B'
const exchange2Address= '0xF506828B166de88cA2EDb2A98D960aBba0D2402A'

var web3 = new Web3(new Web3.providers.WebsocketProvider(provider_wss))
var web3_local = new Web3(new Web3.providers.HttpProvider(provider_http))



// console.log(web3)
var tokenContract

async function main() {

    console.log('Preparing Testing Environment')
    let daiTestExchange = new DaiTestExchange(web3_local)
    await daiTestExchange.prepare(1000,1000)
    return
    let uniswapBroker = await new UniswapBroker(web3,exchange1Address, exchange2Address)
    // console.log(uniswapBroker)
    await uniswapBroker.initialize()
    let prices = await uniswapBroker.getPrices()
    console.log(prices)
    let currentPrice = prices[2]
    let targetPrice = currentPrice.minus(30000)
    targetPrice = new BN(300)
    console.log('Current Price:', currentPrice)
    let tokenAmountSpent = await uniswapBroker.getUniswapTargetToken(targetPrice)
    console.log(tokenAmountSpent)
    let simulatedPrices = uniswapBroker.simulatePrices(tokenAmountSpent,targetPrice)
    
    console.log('Token1 Price [TOKEN/WEI]: ',prices[0].toFormat(20))
    console.log('Token2 Price [TOKEN/WEI]: ',prices[1].toString())
    console.log('Token1/Token2 Price [TOKEN1/TOKEN2]: ',new BN(1).div(prices[2]).toFormat())
    
    console.log('Simulated Token1 Price [TOKEN/WEI]: ',simulatedPrices[0].toFormat(20))
    console.log('Simulated Token2 Price [TOKEN/WEI]: ',simulatedPrices[1].toString())
    console.log('Current Token2/Token1 Price [TOKEN2/TOKEN1]:   ',prices[2].toFormat())
    console.log('******************************** Target price: ',targetPrice.toFormat())
    console.log('Simulated Token2/Token1 Price [TOKEN2/TOKEN1]: ',simulatedPrices[2].toFormat())
    console.log('Missed by: ',simulatedPrices[2].div(targetPrice).times(100).minus(100).toFormat(), '%')
    console.log('Simulated Token1/Token2 Price [TOKEN1/TOKEN2]: ',new BN(1).div(simulatedPrices[2]).toFormat())
    
    console.log('****** In Main ****')
    accounts = await getAccounts(web3_local)
    // console.log('Accounts:',accounts)
    let contracts = await deployFairMint(web3_local,protocols, accounts[0], accounts[1])
    let datAddress = contracts.dat.address
    console.log('adres:', await contracts.dat.fairAddress())
    let fairBroker = new FairBroker(web3_local,datAddress)
    await fairBroker.initialize()
    await fairBroker.calculateFairBuyPrice()
    // await buyFairTokens(contracts,accounts[2],accounts[0])
    return
await buyFairTokens(contracts,accounts[2],accounts[0])
await buyFairTokens(contracts,accounts[2],accounts[0])
await buyFairTokens(contracts,accounts[2],accounts[0])
let uniswapContracts = await deployUniswap(web3,tokens,protocols,accounts[0],accounts[2])
let balance = await getTokenBalance(uniswapContracts.token.address, accounts[0])
console.log('DAI Balance: ', balance.toString())
let buySlope = await getFairBuySlope(contracts.dat)
console.log(buySlope)
let totalTokens = await getFairTotalSoldTokens(contracts.fair)
console.log(totalTokens)
let price = await calculateFairBuyPrice(buySlope.num,buySlope.den, totalTokens.available,totalTokens.burned)
console.log(price.toString())

return

exchange1Data = await getExchangeData(exchange1Address)
exchange2Data = await getExchangeData(exchange2Address)

console.log('Exchange 1 Data:', exchange1Data)
console.log('Exchange 2 Data:', exchange2Data)
calculateUniswapTargetToken(2,1000,100,200,1000)




}



main()

async function calculateFairBuyPrice(numBuySlope, denBuySlope, total,burned)
{
    let result = new BN(total)
    result = result.plus(burned)
    return result.times(numBuySlope).div(denBuySlope)
}

async function getFairTotalSoldTokens(fair) {
    let totalSupply = await promisify(cb=>fair.totalSupply(cb))
    let burnedSupply = await promisify(cb=>fair.burnedSupply(cb))
    return {available:totalSupply, burned: burnedSupply}
}

async function getFairBuySlope(dat) {
    let den = await promisify(cb=>dat.buySlopeDen(cb))
    let num = await promisify(cb=>dat.buySlopeNum(cb))

    return {num:num,den:den}
}

function getExchangeContract(exchangeAddress) {
    let exchange = new web3.eth.Contract(exchangeABI,exchangeAddress)
    return exchange
}

async function getExchangeData(exchangeAddress) {
    let exchange = getExchangeContract(exchangeAddress)
    let tokenAddress = await getTokenAddress(exchange)
    let tokenBalance = await getTokenBalance(exchange)
    let weiBalance = await getExchangeWeiBalance(exchange)
    let tokenSymbol = await getTokenSymbol(tokenAddress)
    let data = new Object()
    data.tokenBalance = tokenBalance
    data.weiBalance = weiBalance
    data.tokenSymbol = tokenSymbol
    return data
}

async function getTokenAddress(exchange) {
    let adr =   await promisify(cb=>exchange.methods.tokenAddress().call(cb))
    return adr

}



async function getExchangeTotalSupply(exchange) {
    let supply =   await promisify(cb=>exchange.methods.totalSupply().call(cb))
    return supply
}

async function getExchangeWeiBalance(exchange) {
    let balance = await promisify(cb=>web3.eth.getBalance(exchange._address,cb).toString())
    balance = new BN(balance)
    return  balance
}




async function getTokenSymbol(tokenAddress) {
    console.log(tokenAddress)
    let tokenContract = new web3.eth.Contract(tokenABI,tokenAddress)
    let symbol = await promisify(cb=>tokenContract.methods.symbol().call(cb).toString())
    try {
        return symbol
    } catch(error) {
        console.log(error)
    }
}





async function deployFairMint(web3,protocols,ownerAccount, buyerAccount)
{
    console.log('Owner Account: ', ownerAccount)
    var contracts = await protocols.cOrg.deploy(web3, {
        control: ownerAccount
      });
      return contracts
}















async function buyFairTokens(contracts,buyerAccount,ownerAccount) {
    await contracts.erc1404.approve(buyerAccount, true, { from: ownerAccount })
    // let balance = await getTokenBalance(contracts.fair.address,buyerAccount)
    // console.log('Token balance before buying tokens: ', balance.toString())
    console.log(contracts.dat.abi)
    return
    await contracts.dat.buy(buyerAccount, "10000000000000", 1, {
      from: buyerAccount,
      value: "10000000000000"
    });

    balance = await getTokenBalance(contracts.fair.address,buyerAccount)
    console.log('Token balance after buying tokens: ', balance.toString())

}

async function getAccounts(web3) {
    let accounts = await promisify(cb=>web3.eth.getAccounts(cb))
    return accounts
}

async function isConnected(web3)
{
    var connected
    await web3.eth.net.isListening().then(res=>{
        connected = true
    }).catch(err=>{
        connected = false
    })
    return connected
}









