
const UniswapPair = require('./UniswapPair')
const FairProxy = require('./FairProxy')
const BN = require('bignumber.js')

class CorgOptimizer {

    constructor(web3,exchange1Address, exchange2Address, datAddress) {
        this.web3 = web3
        this.uniswapPair = new UniswapPair(web3,exchange1Address,exchange2Address)
        this.fairProxy = new FairProxy(web3,datAddress)
        this.ready = false
    }

    async _init() {
        await this.uniswapPair.initialize()
        await this.fairProxy.initialize()
        this.ready = true
    }

    async optimizeBuyTransaction(daiAmount) {
        await this._init()

        let fairPrice = await this.fairProxy.calculateFairBuyPrice() //returns price in DAI/FAIR
        let uniswapPrice = await this.uniswapPair.getPrices() 
        let uniswapAmount = 0
        let datAmount = 0
        
        fairPrice = new BN(fairPrice)
        console.log('Buy Fair Price:', fairPrice.toString())
        if(fairPrice.lt(uniswapPrice[2])) {
            console.log('Buying only from DAT')
            uniswapAmount = 0
            datAmount = daiAmount
        } else {
            console.log('Buying from Uniswap First and rest from DAT')
            let targetToken = await this.uniswapPair.getUniswapTargetToken(true,fairPrice)
            // console.log('Target Token:', targetToken.toFormat(0))
            if(targetToken.gte(daiAmount)) {
                // console.log('Buying everything from Uniswap')
                uniswapAmount = daiAmount 
                datAmount = 0

            } else 
            {
                // console.log('Buying first from Uniswap and then rest from DAT')
                uniswapAmount = targetToken
                datAmount = new BN(daiAmount).minus(targetToken)
            }
        }
        
        uniswapAmount = new BN(uniswapAmount)
        datAmount = new BN(datAmount)

        return new Object({uniswap:uniswapAmount,dat:datAmount})

    }

    async optimizeSellTransaction(fairAmount) {

        await this._init()

        let fairPrice = await this.fairProxy.calculateFairSellPrice() //returns price in DAI/FAIR
        let uniswapPrice = await this.uniswapPair.getPrices() 
        let targetPrice = new BN(1).div(fairPrice) //Price should be in FAIR/DAI as expected in formula. 
        // console.log('***Sell Prices:',targetPrice.toString(),'FAIR/DAI',fairPrice.toString(), 'DAI/FAIR', uniswapPrice[2].toString(),'DAI/FAIR')
        let uniswapAmount = 0
        let datAmount = 0

        if(fairPrice.gt(uniswapPrice[2])) {
            // console.log('Sell everything to DAT')
            datAmount = fairAmount
            uniswapAmount = 0
        }
        else {
            // console.log('Sell to Uniswap First and rest to DAT')
            let targetDai = await this.uniswapPair.getUniswapTargetToken(false,fairPrice)
            // let simulatedPrices = await this.uniswapPair.simulatePrices(targetDai)
            // let targetToken = simulatedPrices[3].times('-1')
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