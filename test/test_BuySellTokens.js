var assert = require('assert');
var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
expect = chai.expect

const BN = require('bignumber.js')

const FairBroker = require('../src/FairProxy.js')
const UniswapPair = require('../src/UniswapPair.js')

const Web3 = require('web3')
const promisify = require('../src/promisify')

const provider_wss = 'wss://mainnet.infura.io/ws/v3/1083bd1be8444957a770056562d20ded'
const provider_http = 'http://localhost:8545'
const Optimizer = require('../src/CorgOptimizer')

var web3 = new Web3(new Web3.providers.WebsocketProvider(provider_wss))
var web3_local = new Web3(new Web3.providers.HttpProvider(provider_http))

var fairBroker,testDeployer,uniswapPair,optimizer
var targetToken,simulatedPrices
var targetPrice

describe('C-Org Test Deployer', async function(done) {
    this.timeout(5000)
    before(async function (){

        optimizer = new Optimizer(web3_local)
        let environment = await optimizer.prepareTest("2000000000000","1000000000000000000000","1000000000000","1000000000000","10000000000","10000000000")
        console.log()
        console.log('      Uniswap Fair Exchange Address:   ', environment.FAIRExchange)
        console.log('      Uniswap DAI Exchange Address:    ', environment.DAIExchange)
        console.log('      DAT Address:                     ', environment.DAT)
        console.log('      FAIR Token Address:              ', environment.FAIRToken)
        console.log('      DAI Token Address:               ', environment.DAIToken)
        console.log()
    })

        it('Verify if environment is correctly prepared.', async function() {
            await optimizer.testDeployer.verify()
        });

        it('Calculate Fair Price', async function() {

            let result = await optimizer.optimizeBuyTransaction('11083071190')
            targetToken = result.uniswap
            let fairSellPrice = await optimizer.fairProxy.calculateFairSellPrice()
            let fairBuyPrice = await optimizer.fairProxy.calculateFairBuyPrice()
            expect (fairSellPrice.toString()).to.be.equal('0.3')
            expect (fairBuyPrice.toString()).to.be.equal('4.491814778015')
            targetPrice = fairBuyPrice
        });

        it('Buy FAIR Tokens using DAI.', async function () {
            let target = targetToken.integerValue().toString()
            uniswapPair = new UniswapPair(web3_local,optimizer.DAIExchangeAddress,optimizer.FAIRExchangeAddress)
            await uniswapPair.initialize()
            let simulatedPrices = await uniswapPair.simulatePrices(target)

            await optimizer.testDeployer.buyFairTokens(target)
            let prices = await optimizer.uniswapPair.getPrices()
            let finalPrice = prices[2]

            let bias = targetPrice.div(finalPrice).times(100).minus(100)
            expect(bias.abs().lte('0.5'),'Target Price Must be less than 0.5% from reached price. It is ' + bias.toString() ).to.be.true
            
        })

        it('Sell Tokens', async function () {
            let fairSellPrice = await optimizer.fairProxy.calculateFairSellPrice()
            targetPrice = fairSellPrice

            let result = await optimizer.optimizeSellTransaction('14102237051')
            let tokensToSell = result.uniswap.toString()
            await optimizer.testDeployer.sellFairTokens(tokensToSell)
            let prices = await optimizer.uniswapPair.getPrices()

            let finalPrice = prices[2]
            let bias = targetPrice.div(finalPrice).times(100).minus(100)
            expect(bias.abs().lte('0.5'),'Target Price Must be less than 0.5% from reached price. It is ' + bias.toString() ).to.be.true


        })

   
});
