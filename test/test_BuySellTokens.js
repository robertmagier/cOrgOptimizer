var assert = require('assert');
var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
expect = chai.expect

const BN = require('bignumber.js')

const TestDeployer = require('./helpers/testDeployer.js')
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

        testDeployer = new TestDeployer(web3_local)
        await testDeployer.prepareTest("2000000000000","1000000000000000000000","1000000000000","1000000000000","10000000000","10000000000")
    })

        it('Verify if environment is correctly prepared.', async function() {
            await testDeployer.verify()
        });

        it('Calculate Fair Price', async function() {

            console.log('Dai Exchange:  ',testDeployer.daiExchange.address)
            console.log('Fair Exchange: ',testDeployer.fairExchange.address)
            console.log('DAT:           ',testDeployer.corg.datAddress)
            

            optimizer = new Optimizer(web3_local,testDeployer.daiExchange.address,testDeployer.fairExchange.address,testDeployer.corg.datAddress)
            let result = await optimizer.optimizeBuyTransaction('11083071190')
            console.log('Result of Optimization: ', result)
            targetToken = result.uniswap
            let fairSellPrice = await optimizer.fairProxy.calculateFairSellPrice()
            let fairBuyPrice = await optimizer.fairProxy.calculateFairBuyPrice()
            console.log('Fair Sell Price: ', fairSellPrice.toString(), ' DAI/FAIR')
            console.log('Fair Buy Price: ', fairBuyPrice.toString(), ' DAI/FAIR')
    
        });

        it('Buy FAIR Tokens using DAI.', async function () {
            let target = targetToken.integerValue().toString()
            console.log('Target Token: ', new BN(target).toFormat())
            uniswapPair = new UniswapPair(web3_local,testDeployer.daiExchange.address,testDeployer.fairExchange.address)
            await uniswapPair.initialize()
            let simulatedPrices = await uniswapPair.simulatePrices(target)
            console.log('Simulated Total Price: ', simulatedPrices[2].toString())

            await testDeployer.buyFairTokens(target)
            let prices = await optimizer.uniswapPair.getPrices()
            console.log('Uniswap  Price: ', prices[2].toString())

        })

        it('Sell Tokens', async function () {
            let result = await optimizer.optimizeSellTransaction('14102237051')
            console.log('Target Fair:', result.toString())

            let tokensToSell = result.uniswap.toString()
            console.log('Tokens to Sell: ', tokensToSell)
            
            await testDeployer.sellFairTokens(tokensToSell)
            let prices = await optimizer.uniswapPair.getPrices()
            console.log('Uniswap  Price: ', prices[2].toString())
        })

   
});
