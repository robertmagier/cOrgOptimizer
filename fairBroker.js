const BN = require('bignumber.js')
const datABI = require('./datABI.js')
const fairABI = require('./fairABI.js')
const promisify = require('./promisify')




class FairBroker {
    constructor(web3,datAddress) {
        this.web3 = web3
        this.datAddress = datAddress
    }

    _getDatContract() {
        
        this.dat =  new this.web3.eth.Contract(datABI,this.datAddress)
        // console.log('DAT:',this.dat)
    }

    async initialize() {
        this._getDatContract()
        await this._getFairContract()


    }
    async _getFairContract() {
       this.fairAddress =  await promisify(cb=>this.dat.methods.fairAddress().call(cb))
       this.fair = new this.web3.eth.Contract(fairABI,this.fairAddress)
    }

    // async getTokenBalance(owner){
    //     let balance = await promisify(cb=>this.fair.methods.balanceOf(owner).call(cb))
    //     return balance
    // }

    async getFairTotalSoldTokens() {
        let totalSupply = await promisify(cb=>this.fair.methods.totalSupply().call(cb))
        let burnedSupply = await promisify(cb=>this.fair.methods.burnedSupply().call(cb))
        console.log(totalSupply, burnedSupply)
        return {available:totalSupply, burned: burnedSupply}
    }
    
    async calculateFairBuyPrice()
    {
        let tokens = await this.getFairTotalSoldTokens()
        let buySlope = await this.getBuySlope()
        let fairPrice = new BN(tokens.available)
        fairPrice = fairPrice.plus(tokens.burned).times(buySlope.num).div(buySlope.den)
        console.log('Fair Price:', fairPrice.toString())
        return fairPrice
    }

    async getBuySlope() {
        let den = await promisify(cb=>this.dat.methods.buySlopeDen().call(cb))
        let num = await promisify(cb=>this.dat.methods.buySlopeNum().call(cb))
        console.log(num,den)
        return {num:num,den:den}
    }

}

module.exports = FairBroker
