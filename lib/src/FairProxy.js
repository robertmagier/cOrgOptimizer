const BN = require('bignumber.js')
const datABI = require('../abi/datABI.js')
const fairABI = require('../abi/fairABI.js')
const promisify = require('../lib/promisify')




class FairProxy {
    constructor(web3,datAddress) {
        this.web3 = web3
        this.datAddress = datAddress
    }

    _getDatContract() {
        
        this.dat =  new this.web3.eth.Contract(datABI,this.datAddress)
    }

    async initialize() {
        await this._getDatContract()
        await this._getFairContract()


    }
    async _getFairContract() {
       this.fairAddress =  await promisify(cb=>this.dat.methods.fairAddress().call(cb))
       this.fair = new this.web3.eth.Contract(fairABI,this.fairAddress)
    }

    async getFairTotalSoldTokens() {
        let totalSupply = await promisify(cb=>this.fair.methods.totalSupply().call(cb))
        let burnedSupply = await promisify(cb=>this.fair.methods.burnedSupply().call(cb))
        return {available:totalSupply, burned: burnedSupply}
    }
    
    async calculateFairBuyPrice()
    {
        let tokens = await this.getFairTotalSoldTokens()
        let buySlope = await this.getBuySlope()
        let fairBuyPrice = new BN(tokens.available)
        fairBuyPrice = fairBuyPrice.plus(tokens.burned).times(buySlope.num).div(buySlope.den)
        return fairBuyPrice
    }
    async calculateFairSellPrice()
    {
        let sellSlope = await this.getSellSlope()
        return sellSlope
    }

    async getBuySlope() {
        let den = await promisify(cb=>this.dat.methods.buySlopeDen().call(cb))
        let num = await promisify(cb=>this.dat.methods.buySlopeNum().call(cb))
        return {num:num,den:den}
    }

    async getSellSlope() {
        let sellPrice = await promisify(cb=>this.dat.methods.estimateSellValue(10).call(cb))
        return new BN(sellPrice).div(10)
    }

    async allowance(from,spender) {
        let amount = await this.fair.methods.allowance(from,spender).call(cb)
        return amount
    }

    async approve(fromAccount,spender,amount) {
        let amount = await this.fair.methods.approve(spender,amount).send({from:fromAccount})
        return amount
    }

    

}

module.exports = FairProxy
