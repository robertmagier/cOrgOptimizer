var assert = require('assert');
var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
expect = chai.expect

const CorgTestDeployer = require('../lib/corgTestDeployer')
const UniswapTestDeployer = require('../lib/uniswapTestDeployer')
const DaiTestDeployer = require('../lib/daiTestDeployer.js')
const UniswapPair = require('../lib/UniswapPair.js')

const FairBroker = require('../lib/fairBroker.js')

const Web3 = require('web3')
const promisify = require('../lib/promisify')

const provider_wss = 'wss://mainnet.infura.io/ws/v3/1083bd1be8444957a770056562d20ded'
const provider_http = 'http://localhost:8545'


var web3 = new Web3(new Web3.providers.WebsocketProvider(provider_wss))
var web3_local = new Web3(new Web3.providers.HttpProvider(provider_http))

var corg = new CorgTestDeployer(web3_local)
var uniswap = new UniswapTestDeployer(web3_local)
var dai = new DaiTestDeployer(web3_local)


var fairBuyer, corgOwner, uniswapOwner,daiOwner, daiBuyer,uniswapDaiBuyer, uniswapFairBuyer
var daiExchange, fairExchange,uniswapPair,fairBroker


async function getAccounts(web3) {
    let accounts = await promisify(cb=>web3.eth.getAccounts(cb))
    return accounts
}

describe('C-Org Test Deployer', async function(done) {
    this.timeout(5000)
    before(async function (){
        let accounts = await getAccounts(web3_local)
        corgOwner = accounts[0]
        fairBuyer = accounts[1]
        uniswapOwner = accounts[2]
        daiOwner = accounts[3]
        daiBuyer = accounts[4]
        uniswapDaiBuyer = accounts[5]
        uniswapFairBuyer = accounts[6]

        await corg.deploy(corgOwner)
        await uniswap.deploy(uniswapOwner)
        await dai.deploy(daiOwner)
        fairExchange  = await uniswap.createExchange(uniswapOwner,corg.tokenAddress)
        daiExchange  = await uniswap.createExchange(uniswapOwner,dai.tokenAddress)
        
    })
        it('Balance should be zero.', async function() {
            let balance = await corg.balanceOf(fairBuyer) 
            expect(balance.toString()).to.be.equal('0');
    });

        it('Should be possible to buy tokens for 1 000 000 wei', async function() {
            await expect(corg.approveBuyer(fairBuyer)).to.be.eventually.fulfilled
            await expect(corg.buy(fairBuyer,10000000000),"Could not buy tokens").to.be.eventually.fulfilled 
            let balance = await corg.balanceOf(fairBuyer)
            expect(balance.toString()).to.be.equal('23800000000')
                                                    
    });

        it('Should be possible to mint 1 000 000 dai tokens', async function() {
            let balance = await dai.balanceOf(daiBuyer)
            expect(balance.toString()).to.be.equal('0')
            await expect(dai.mint(daiBuyer,10000000000)).to.be.eventually.fulfilled
            balance = await dai.balanceOf(daiBuyer)
            expect(balance.toString()).to.be.equal('10000000000')
                                                    
    });

        it('It should be possible to approve uniswap exchange to trade Fair Tokens.', async function() {
            let balance = await corg.allowance(fairBuyer,fairExchange.address) 
            expect(balance).to.be.equal('0')
            await expect(corg.approve(fairBuyer,fairExchange.address,10000000000)).to.be.eventually.fulfilled
            balance = await corg.allowance(fairBuyer,fairExchange.address) 
            expect(balance).to.be.equal('10000000000')
        });

        it('It should be possible to approve uniswap exchange to trade DAI Tokens.', async function() {
            let allowance = await dai.allowance(daiBuyer,daiExchange.address) 
            expect(allowance).to.be.equal('0')
            await expect(dai.approve(daiBuyer,daiExchange.address,10000000000)).to.be.eventually.fulfilled
            allowance = await dai.allowance(daiBuyer,daiExchange.address) 
            expect(allowance).to.be.equal('10000000000')
        });

        it('It should be possible to add liquidity to fairExchange', async function() {
            let balance = await corg.balanceOf(fairExchange.address) 
            expect(balance.toString()).to.be.equal('0')
            let current_block = await web3_local.eth.getBlock(await web3_local.eth.getBlockNumber());

            await expect(fairExchange.addLiquidity(10000000000,10000000000,current_block.timestamp + 300,{from:fairBuyer,value:10000000000})).to.be.eventually.rejected
            await expect(corg.approveBuyer(fairExchange.address))
            await expect(fairExchange.addLiquidity(10000000000,10000000000,current_block.timestamp + 300,{from:fairBuyer,value:10000000000})).to.be.eventually.fulfilled

            balance = await corg.balanceOf(fairExchange.address) 
            expect(balance.toString()).to.be.equal('10000000000')

        });

        it('It should be possible to add liquidity to daiExchange', async function() {
            let balance = await dai.balanceOf(daiExchange.address)

            let current_block = await web3_local.eth.getBlock(await web3_local.eth.getBlockNumber());
            await expect(daiExchange.addLiquidity(10000000000,10000000000,current_block.timestamp + 300,{from:daiBuyer,value:10000000000})).to.be.eventually.fulfilled

            balance = await dai.balanceOf(daiExchange.address)
            expect(balance.toString()).to.be.equal('10000000000')
        });

        it('It should be possible to create UniswapTokenPair and check price.', async function() {
            uniswapPair = new UniswapPair(web3_local,daiExchange.address,fairExchange.address)
            await uniswapPair.initialize()
            let prices = await uniswapPair.getPrices()
            console.log(prices[0].toString())
            console.log(prices[1].toString())
            console.log(prices[2].toString())
        })

        it('Should be possible to calculate Fair Price', async function(){
            fairBroker = new FairBroker(web3_local,corg.datAddress)
            await fairBroker.initialize()
            let price = await fairBroker.calculateFairBuyPrice()
            console.log('Fair Price:', price.toString())
            let uniswapPrices = await uniswapPair.getPrices()
            console.log('Uniswap Total Price: ',uniswapPrices[2].toString())

            let targetToken = await uniswapPair.getUniswapTargetToken(price.toString())
            console.log('Target Token:', targetToken.toString())
        })


        it('Should be possible to buy tokens from DAI exchange', async function(){
            let current_block = await web3_local.eth.getBlock(await web3_local.eth.getBlockNumber());
            await daiExchange.ethToTokenSwapOutput(100,current_block.timestamp + 300,{value:1000,from:uniswapDaiBuyer})
            let balance = await dai.balanceOf(uniswapDaiBuyer)
            expect(balance.toString()).to.be.equal('100')
        })


        it('Should be possible to buy tokens from FAIR exchange', async function(){
            await corg.approveBuyer(uniswapFairBuyer)
            let current_block = await web3_local.eth.getBlock(await web3_local.eth.getBlockNumber());
            await fairExchange.ethToTokenSwapOutput(100,current_block.timestamp + 300,{value:10000,from:uniswapFairBuyer})
            let balance = await corg.balanceOf(uniswapFairBuyer)
            expect(balance.toString()).to.be.equal('100')
        })
        
        it('Should be possible to buy tokens from FAIR exchange paying in DAI', async function(){
            await corg.approveBuyer(uniswapDaiBuyer)
            let current_block = await web3_local.eth.getBlock(await web3_local.eth.getBlockNumber());
            await expect(dai.approve(uniswapDaiBuyer,daiExchange.address,100)).to.be.eventually.fulfilled

            await daiExchange.tokenToTokenSwapInput(100,1,1,current_block.timestamp + 300,corg.tokenAddress,{from:uniswapDaiBuyer})
            let balance = await corg.balanceOf(uniswapDaiBuyer)
            expect(balance.toString()).to.be.equal('98')
        })
        
        it('Should be possible to calculate Fair Price', async function(){
            let price = await fairBroker.calculateFairBuyPrice()
            console.log('Fair Price:', price.toString())

            let uniswapPrices = await uniswapPair.getPrices()
            console.log('Uniswap Total Price: ',uniswapPrices[2].toString())

            let targetToken = await uniswapPair.getUniswapTargetToken(price.toString())
            console.log('Target Token:', targetToken.toString())
        })

        it('Should be possible to mint extra tokens to uniswapDaiBuyer to he can buy Fair Tokens', async function (){
            await dai.mint(uniswapDaiBuyer,2715167371)
            let balance = await dai.balanceOf(uniswapDaiBuyer)
            console.log('New UniswapDaiBuyer Balance: ',balance.toString())
        })

        it('Should be possible to buy tokens from FAIR exchange paying in DAI', async function(){
            await corg.approveBuyer(uniswapDaiBuyer)
            let current_block = await web3_local.eth.getBlock(await web3_local.eth.getBlockNumber());
            await expect(dai.approve(uniswapDaiBuyer,daiExchange.address,2715167371)).to.be.eventually.fulfilled

            await daiExchange.tokenToTokenSwapInput(2715167371,1,1,current_block.timestamp + 300,corg.tokenAddress,{from:uniswapDaiBuyer})
            let balance = await corg.balanceOf(uniswapDaiBuyer)
            expect(balance.toString()).to.be.equal('1751859277')
        })

        it('Should be possible to calculate Fair Price', async function(){
            let price = await fairBroker.calculateFairBuyPrice()
            console.log('Fair Price:', price.toString())

            let uniswapPrices = await uniswapPair.getPrices()
            console.log('Uniswap Total Price: ',uniswapPrices[2].toString())

            let targetToken = await uniswapPair.getUniswapTargetToken(price.toString())
            console.log('Target Token:', targetToken.toString())
        })

        it('Should be possible to mint extra tokens to uniswapDaiBuyer to he can buy Fair Tokens', async function (){
            await dai.mint(uniswapDaiBuyer,7711391)
            let balance = await dai.balanceOf(uniswapDaiBuyer)
            console.log('New UniswapDaiBuyer Balance: ',balance.toString())
        })

        it('Should be possible to buy tokens from FAIR exchange paying in DAI', async function(){
            await corg.approveBuyer(uniswapDaiBuyer)
            let current_block = await web3_local.eth.getBlock(await web3_local.eth.getBlockNumber());
            await expect(dai.approve(uniswapDaiBuyer,daiExchange.address,7711391)).to.be.eventually.fulfilled

            await daiExchange.tokenToTokenSwapInput(7711391,1,1,current_block.timestamp + 300,corg.tokenAddress,{from:uniswapDaiBuyer})
            let balance = await corg.balanceOf(uniswapDaiBuyer)
            
        })

        it('Should be possible to calculate Fair Price', async function(){
            let price = await fairBroker.calculateFairBuyPrice()
            console.log('Fair Price:', price.toString())

            let uniswapPrices = await uniswapPair.getPrices()
            console.log('Uniswap Total Price: ',uniswapPrices[2].toString())

            let targetToken = await uniswapPair.getUniswapTargetToken(price.toString())
            console.log('Target Token:', targetToken.toString())
        })

        it('Should be possible to mint extra tokens to uniswapDaiBuyer to he can buy Fair Tokens', async function (){
            await dai.mint(uniswapDaiBuyer,20654)
            let balance = await dai.balanceOf(uniswapDaiBuyer)
            console.log('New UniswapDaiBuyer Balance: ',balance.toString())
        })

        it('Should be possible to buy tokens from FAIR exchange paying in DAI', async function(){
            await corg.approveBuyer(uniswapDaiBuyer)
            let current_block = await web3_local.eth.getBlock(await web3_local.eth.getBlockNumber());
            await expect(dai.approve(uniswapDaiBuyer,daiExchange.address,20654)).to.be.eventually.fulfilled

            await daiExchange.tokenToTokenSwapInput(20654,1,1,current_block.timestamp + 300,corg.tokenAddress,{from:uniswapDaiBuyer})
            let balance = await corg.balanceOf(uniswapDaiBuyer)
            
        })

        it('Should be possible to calculate Fair Price', async function(){
            let price = await fairBroker.calculateFairBuyPrice()
            console.log('Fair Price:', price.toString())

            let uniswapPrices = await uniswapPair.getPrices()
            console.log('Uniswap Total Price: ',uniswapPrices[2].toString())

            let targetToken = await uniswapPair.getUniswapTargetToken(price.toString())
            console.log('Target Token:', targetToken.toString())
        })

});
