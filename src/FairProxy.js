const BN = require('bignumber.js')

const promisify = require('./promisify')
const abi = require('c-org-abi/abi.json')


class DATProxy {
    constructor(web3,datAddress) {
        this.web3 = web3
        this.datAddress = datAddress
    }

    
    async initialize() {
        this.dat =  await new this.web3.eth.Contract(abi.dat,this.datAddress)
    }


    async getFairTotalSoldTokens() {
        let totalSupply = await promisify(cb=>this.dat.methods.totalSupply().call(cb))
        let burnedSupply = await promisify(cb=>this.dat.methods.burnedSupply().call(cb))
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
        let amount = await promisify(cb => this.dat.methods.allowance(from,spender).call(cb))
        return amount
    }

    async balanceOf(account) {
        let balance = await promisify(cb=>this.dat.methods.balanceOf(account).call(cb))
        return new BN(balance.toString())
    }

    async approve(fromAccount,spender,amount) {
        amount = await this.dat.methods.approve(spender,amount).send({from:fromAccount})
        return amount
    }

    approveTxData(fromAccount,spender,amount) {
        let data = this.dat.methods.approve(spender,amount).encodeABI()
        return data
    }

    

}

module.exports = DATProxy
