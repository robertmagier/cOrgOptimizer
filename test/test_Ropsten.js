var assert = require('assert');
var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
expect = chai.expect

const BN = require('bignumber.js')

const FairBroker = require('../src/FairProxy.js')
const UniswapPair = require('../src/UniswapPair.js')
const TXSender = require('../src/helpers/txSender')

const Web3 = require('web3')

const provider_wss = 'wss://ropsten.infura.io/ws/v3/1083bd1be8444957a770056562d20ded'
const Optimizer = require('../src/CorgOptimizer')

const DAIUniswap = "0x77590a1eeeda1fac2b5e991a39365ff502471813"
const FAIRUniswap = "0x0315935a8669937193d4d83d714a9b15682fea5e"
const DAT = "0xF136D7F39BA8C9A0Fe02CB2E414ecBE3302B7AC5"
const ropstenAccount = '0x1C4d3187CA1effB42C10F33DE20C10D6804f6C14'
const privateKey = '5c633a15635b1f2c297f949992d94ac31aeedb5f8cecd852f5e5eba2806c1d25'

var web3 = new Web3(new Web3.providers.WebsocketProvider(provider_wss))

var fairBroker,testDeployer,uniswapPair,optimizer
var targetToken,simulatedPrices
var targetPrice

describe('C-Org Test Deployer', async function() {
    this.timeout(5000000)
    before(async function (){

        optimizer = new Optimizer(web3)
        await optimizer.init(DAIUniswap,FAIRUniswap,DAT)
        // txSender = new TXSender(web3,ropstenAccount,privateKey)
    })


        it('Get Uniswap Information', async function() {
            let info = await optimizer.getUniswapInformation()
            // console.log(info)
        });

        // it('Aprove FAIR Uniswap', async function() {
        //     await optimizer.approveFairUniswap('0',ropstenAccount,privateKey)
        //     await optimizer.addFAIRLiquidity('0',ropstenAccount,'2445293',privateKey)
        // });

        it('Aprove DAI Uniswap', async function() {
            // await optimizer.approveDAIUniswap('100000000000',ropstenAccount,privateKey)
            // await optimizer.addDAILiquidity('100000000000','100000000000',ropstenAccount,privateKey)
            let exchange1Price = await optimizer.uniswapPair.getExchange1Price()
            let exchange2Price = await optimizer.uniswapPair.getExchange2Price()
            let totalPrice = await optimizer.uniswapPair.getTotalPrice()
            console.log('Exchange 1 Price: ', exchange1Price.toString())
            console.log('WEI: ', optimizer.uniswapPair.exchange1WeiBalance,' Token Balance: ', optimizer.uniswapPair.token1Balance)
            console.log('Exchange 2 Price: ', exchange2Price.toString())
            console.log('WEI: ', optimizer.uniswapPair.exchange2WeiBalance,' Token Balance: ', optimizer.uniswapPair.token2Balance)
            console.log('Total  Price:     ', totalPrice.toString())


            let result = await optimizer.optimizeBuyTransaction(1)
            console.log('Uniswap: ',result.uniswap.toString())
            console.log('DAT:     ',result.dat.toString())

            result = await optimizer.optimizeSellTransaction('1000000000000000000000')
            console.log('Uniswap: ',result.uniswap.toString())
            console.log('DAT:     ',result.dat.toString())

        });

 

});
