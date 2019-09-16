
var exchangeABI = require('../abi/uniswapABI')
const BN = require('bignumber.js')
const promisify = require('./promisify')
const TokenBroker = require('./TokenBroker')




class UniswapPair {
    constructor(web3, _exchange1Address, _exchange2Address) {
        this.web3 = web3
        this.exchange1Address = _exchange1Address
        this.exchange2Address = _exchange2Address
        this.synced = false
        this.tokenBroker = new TokenBroker(this.web3)
    }

    async isConnected(web3)
    {
        var connected
        await web3.eth.net.isListening().then(res=>{
            connected = true
        }).catch(err=>{
            connected = false
        })
        return connected
    }

    _getExchangeContracts()  {
        this.exchange1 = new this.web3.eth.Contract(exchangeABI,this.exchange1Address)
        this.exchange2 = new this.web3.eth.Contract(exchangeABI,this.exchange2Address)
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
    }

    async getPrices() {

        await this._syncData()
        let y1 = new BN(this.token1Balance)
        let y2 = new BN(this.token2Balance)
        let x1 = new BN(this.exchange1WeiBalance)
        let x2 = new BN(this.exchange2WeiBalance)

        let exchange1Price = y1.div(x1)
        let exchange2Price = y2.div(x2)
        let totalPrice = exchange1Price.div(exchange2Price)
        return [exchange1Price, exchange2Price, totalPrice]


    }

    async simulatePrices(token1Amount) {
        await this._syncData()

        let fee = 997
        let inputAmount = new BN(token1Amount)
        let input_amount_with_fee = inputAmount.times(fee)
        // console.log('Token#1 Input Amount with Fee:', input_amount_with_fee.toString())
        
        let outputReserve_Token1 = new BN(this.exchange1WeiBalance)
        let numerator = input_amount_with_fee.times(outputReserve_Token1)
        // console.log('Numerator Token#1:', numerator.toString())

        let inputReserve_Token1 = new BN(this.token1Balance)
        let denominator = inputReserve_Token1.times(1000).plus(input_amount_with_fee)
        // console.log('Denominator: ', denominator.toString())
        let outputAmount_Token1 = new BN(numerator.div(denominator).toFixed(0))
        // console.log('Output Amount Token #1:', outputAmount_Token1.toString())

        let token1Balance_end = inputReserve_Token1.plus(inputAmount)
        let wei1Balance_end = outputReserve_Token1.minus(outputAmount_Token1)


        let outputReserve_Token2 = new BN(this.token2Balance)
        let inputReserve_Token2 = new BN(this.exchange2WeiBalance) 
        let inputAmount_Token2 = outputAmount_Token1

        input_amount_with_fee = inputAmount_Token2.times(fee)
        // console.log('Token#2 Input Amount with Fee:', input_amount_with_fee.toString())

        numerator = input_amount_with_fee.times(outputReserve_Token2)
        // console.log('Numerator Token#2:', numerator.toString())
        denominator = inputReserve_Token2.times(1000).plus(input_amount_with_fee)
        // console.log('Denominator Token#2:', denominator.toString())


        let outputAmount_Token2 = new BN(numerator.div(denominator).toFixed(0))
        // console.log('Output Amount Token#2:', outputAmount_Token2.toFormat())

        let token2Balance_end = outputReserve_Token2.minus(outputAmount_Token2)
        let wei2Balance_end = inputReserve_Token2.plus(inputAmount_Token2)

        let exchange1_endPrice = token1Balance_end.div(wei1Balance_end)
        let exchange2_endPrice = token2Balance_end.div(wei2Balance_end)

        let total_endPrice = exchange1_endPrice.div(exchange2_endPrice) 

        return[exchange1_endPrice, exchange2_endPrice, total_endPrice,outputAmount_Token2]



    }

    async getUniswapTargetToken(targetPrice,debug) {

        await this._syncData()
        let pm = new BN(targetPrice) //Expect price in ters of FAIR/DAI. C-org calculates price as DAI/FAIR
        let y1 = new BN(this.token1Balance)
        let y2 = new BN(this.token2Balance)
        let x1 = new BN(this.exchange1WeiBalance)
        let x2 = new BN(this.exchange2WeiBalance)
        let targetToken = new BN(0)
       
       // target Wei = (sqrt((x1*y1* x2 *y2)/pm) + (x1 * y1))/(x1+x2)
       
       let mul_x1y1_x2_y2 = new BN(x1.times(y1).times(x2.times(y2)).toFixed(0))
       targetToken = new BN(mul_x1y1_x2_y2.div(pm).toFixed(0))
       targetToken = new BN(targetToken.sqrt().toFixed(0))
       targetToken = new BN(targetToken.plus(x1.times(y1)).div(x1.plus(x2)).toFixed(0))
       
       if(debug) {
           console.log('Target Token y1_end:  ', targetToken.toString(), "Target Price TOKEN2/TOKEN1: ",pm.toString())
           console.log('You can spend ',targetToken.minus(y1).toString(),' tokens.')
           console.log('y1: ', y1.toString())
           console.log('y2: ', y2.toString())
           console.log('x1: ', x1.toString())
           console.log('x2: ', x2.toString())
       }

       return targetToken.minus(y1)
       }

}

module.exports = UniswapPair