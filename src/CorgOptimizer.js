
const UniswapPair = require('./UniswapPair')
const FairProxy = require('./FairProxy')
const TestDeployer = require('./helpers/testDeployer.js')
const BN = require('bignumber.js')

class CorgOptimizer {

    constructor(web3) {
        this.web3 = web3
        this.ready = false
    }

    async init(DAIExchangeAddress, FAIRExchangeAddress, DATAddress) {


        this._init(DAIExchangeAddress, FAIRExchangeAddress, DATAddress)

    }

    async prepareTest(daiInitialSupply, fairInitialWei, uniswapDaiTokenAmount, uniswapDaiWeiAmount, uniswapFairTokenAmount, uniswapFairWeiAmount ) {
        this.testDeployer = new TestDeployer(this.web3)
        await this.testDeployer.prepareTest(daiInitialSupply, fairInitialWei, uniswapDaiTokenAmount, uniswapDaiWeiAmount, uniswapFairTokenAmount, uniswapFairWeiAmount )
        await this._init(this.testDeployer.daiExchange.address, this.testDeployer.fairExchange.address, this.testDeployer.corg.datAddress)
    }

    async _init(DAIExchangeAddress, FAIRExchangeAddress, DATAddress) {
                
        this.DAIExchangeAddress = DAIExchangeAddress
        this.FAIRExchangeAddress = FAIRExchangeAddress
        this.DATAddress = DATAddress

        console.log('Uniswap Dai Exchange Address :  ',this.DAIExchangeAddress)
        console.log('Uniswap Fair Exchange Address:  ',this.FAIRExchangeAddress)
        console.log('DAT Address:                    ',this.DATAddress)


        this.uniswapPair = new UniswapPair(this.web3,DAIExchangeAddress,FAIRExchangeAddress)
        this.fairProxy = new FairProxy(this.web3,DATAddress)
        await this.uniswapPair.initialize()
        await this.fairProxy.initialize()
        this.ready = true
    }

    async optimizeBuyTransaction(daiAmount) {3

        if(this.ready == false) {
            throw('Call init(exchange1Address, exchange2Address, datAddress) function first or prepareTest to initialize this object.')
        }
        let fairPrice = await this.fairProxy.calculateFairBuyPrice() //returns price in DAI/FAIR
        let uniswapPrice = await this.uniswapPair.getPrices() 
        let uniswapAmount = 0
        let datAmount = 0
        
        fairPrice = new BN(fairPrice)
        if(fairPrice.lt(uniswapPrice[2])) {
            uniswapAmount = 0
            datAmount = daiAmount
        } else {
            let targetToken = await this.uniswapPair.getUniswapTargetToken(true,fairPrice)
            if(targetToken.gte(daiAmount)) {
                uniswapAmount = daiAmount 
                datAmount = 0

            } else 
            {
                uniswapAmount = targetToken
                datAmount = new BN(daiAmount).minus(targetToken)
            }
        }
        
        uniswapAmount = new BN(uniswapAmount)
        datAmount = new BN(datAmount)

        return new Object({uniswap:uniswapAmount,dat:datAmount})

    }

    async optimizeSellTransaction(fairAmount) {

        if(this.ready == false) {
            throw('Call init(exchange1Address, exchange2Address, datAddress) function first or prepareTest to initialize this object.')
        }

        let fairPrice = await this.fairProxy.calculateFairSellPrice() //returns price in DAI/FAIR
        let uniswapPrice = await this.uniswapPair.getPrices() 
        let targetPrice = new BN(1).div(fairPrice) //Price should be in FAIR/DAI as expected in formula. 
        let uniswapAmount = 0
        let datAmount = 0

        if(fairPrice.gt(uniswapPrice[2])) {
            datAmount = fairAmount
            uniswapAmount = 0
        }
        else {
            let targetDai = await this.uniswapPair.getUniswapTargetToken(false,fairPrice)
            let targetToken = targetDai

            if(targetToken.lt(fairAmount)){
                uniswapAmount = targetToken
                datAmount = new BN(fairAmount).minus(targetToken)
            }
            else {
                uniswapAmount = fairAmount
                datAmount = 0
            }
        
        }

        return new Object({uniswap:uniswapAmount,dat:datAmount})


    }

}

module.exports = CorgOptimizer