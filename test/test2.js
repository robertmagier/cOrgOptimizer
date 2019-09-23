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

var fairBroker,testDeployer,uniswapPair
var targetToken,simulatedPrices
var targetPrice

describe('C-Org Test Deployer', async function(done) {
    this.timeout(5000)
    before(async function (){

        optimizer = new Optimizer(web3_local)
        await optimizer.prepareTest("2000000000000","1000000000000000000000","1000000000000","1000000000000","10000000000","10000000000")

    })

        it('Verify if environment is correctly prepared.', async function() {
            await optimizer.testDeployer.verify()
        });

        it('Calculate Fair Price', async function() {

            fairBroker = new FairBroker(web3_local,optimizer.DATAddress)
            await fairBroker.initialize()
            let price = await fairBroker.calculateFairBuyPrice()
            targetPrice = price
        });

        it('Calculate Uniswap Price', async function() {

            uniswapPair = new UniswapPair(web3_local,optimizer.DAIExchangeAddress,optimizer.FAIRExchangeAddress)
            await uniswapPair.initialize()
            let prices = await uniswapPair.getPrices()
        });

        it('Calculate number of tokens to to buy from exchange to get to current FAIR Price.',async function () {
            let ifBuy = true
            targetToken = await uniswapPair.getUniswapTargetToken(ifBuy,targetPrice)
        })

        it('Execute Swap and check differnce.', async function(){
            let target = targetToken.integerValue().toString()
            let simulatedPrices = await uniswapPair.simulatePrices(target)
            await optimizer.testDeployer.buyFairTokens(target)
            let prices = await uniswapPair.getPrices()
        })


   
});
