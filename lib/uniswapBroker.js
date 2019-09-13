
const cOrgAbi = require("c-org-abi/abi.json");
const exchangeABI = require('../abi/uniswapABI')
const BN = require('bignumber.js')
const promisify = require('./promisify')


class UniswapBroker {
    constructor(web3, _uniswapAddress) {
        this.web3 = web3
        this.uniswapAddress = _uniswapAddress
        this.synced = false
    }


    _getContract()  {
        this.exchange2 = new this.web3.eth.Contract(exchangeABI,this.uniswapAddress)
    }

    async _readTokenAddress() {
        this.token1Address =   await promisify(cb=>this.exchange1.methods.tokenAddress().call(cb))
        this.token2Address =   await promisify(cb=>this.exchange2.methods.tokenAddress().call(cb))
        return [this.token1Address,this.token2Address]
    }

    async initialize(){
        this._getExchangeContracts()
        await this._readTokenAddress()
    }

    async _syncData() {
        this.synced = true
        await this._readTokenBalances()
        await this._readExchangeWeiBalances()
    }

    async _readTokenBalances() {
        this.token1Balance = await this.tokenBroker.readTokenBalance(this.token1Address,this.exchange1Address)
        this.token2Balance = await this.tokenBroker.readTokenBalance(this.token2Address,this.exchange2Address)
    }

    async _readExchangeWeiBalances(exchange) {
        this.exchange1WeiBalance = await promisify(cb=>this.web3.eth.getBalance(this.exchange1Address,cb).toString())
        this.exchange2WeiBalance = await promisify(cb=>this.web3.eth.getBalance(this.exchange2Address,cb).toString())
        // console.log(this.exchange1WeiBalance)
        // console.log(this.exchange2WeiBalance)
    }

    async getPrices() {

        await this._syncData()
        let y1 = new BN(this.token1Balance)
        let y2 = new BN(this.token2Balance)
        let x1 = new BN(this.exchange1WeiBalance)
        let x2 = new BN(this.exchange2WeiBalance)

        let exchange1Price = y1.div(x1)
        let exchange2Price = y2.div(x2)
        let totalPrice = exchange2Price.div(exchange1Price)
        return [exchange1Price, exchange2Price, totalPrice]
    }

    simulatePrices(token1Amount,targetPrice) {
        console.log(this.synced)
        if(this.synced === false)
        {
            throw('You need to syncrhonize prices to get correct simulation value. Use _syncData()')
        }


        let fee = 997
        let inputAmount = new BN(token1Amount)
        let outputReserve_Token1 = new BN(this.exchange1WeiBalance)
        let inputReserve_Token1 = new BN(this.token1Balance)
        
        let outputAmount_Token1 = inputAmount.times(outputReserve_Token1).times(fee).div(inputReserve_Token1.times(1000).plus(inputAmount.times(fee)))
        let token1Balance_end = inputReserve_Token1.plus(inputAmount)
        let wei1Balance_end = outputReserve_Token1.minus(outputAmount_Token1)
        
        let outputReserve_Token2 = new BN(this.token2Balance)
        let inputReserve_Token2 = new BN(this.exchange2WeiBalance) 
        let inputAmount_Token2 = outputAmount_Token1

        let outputAmount_Token2 = inputAmount.times(outputReserve_Token2).times(fee).div(inputReserve_Token2.times(1000).plus(inputAmount_Token2.times(fee)))
        let token2Balance_end = outputReserve_Token2.minus(outputAmount_Token2)
        let wei2Balance_end = inputReserve_Token2.plus(inputAmount_Token2)

        let exchange1_endPrice = token1Balance_end.div(wei1Balance_end)
        let exchange2_endPrice = token2Balance_end.div(wei2Balance_end)

        let total_endPrice = exchange2_endPrice.div(exchange1_endPrice) 

        return[exchange1_endPrice, exchange2_endPrice, total_endPrice]



    }

    async getUniswapTargetToken(targetPrice) {

        await this._syncData()
        let pm = new BN(targetPrice)
        let y1 = new BN(this.token1Balance)
        let y2 = new BN(this.token2Balance)
        let x1 = new BN(this.exchange1WeiBalance)
        let x2 = new BN(this.exchange2WeiBalance)
        let targetToken = new BN(0)
       
       // target Wei = (sqrt((x1*y1* x2 *y2)/pm) + (x1 * y1))/(x1+x2)
       
       let mul_x1y1_x2_y2 = x1.times(y1).times(x2.times(y2))
       targetToken = mul_x1y1_x2_y2.div(pm).sqrt().plus(x1.times(y1)).div(x1.plus(x2))
       console.log('Target Token y1_end:  ', targetToken.toString(), "Target Price TOKEN2/TOKEN1: ",pm.toString())
       console.log('You can spend ',targetToken.minus(y1).toString(),' tokens.')
       console.log('y1: ', y1.toString())
       console.log('y2: ', y2.toString())
       console.log('x1: ', x1.toString())
       console.log('x2: ', x2.toString())
       return targetToken.minus(y1)
       }
}

module.exports = UniswapBroker