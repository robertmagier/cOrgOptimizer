
var exchangeABI = require('../abi/uniswap_exchange.json').abi
const BN = require('bignumber.js')
const promisify = require('./promisify')
const TokenBroker = require('./TokenBroker')
const signAndSend = require('./helpers/txSender')



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

    async getFactoryAddress() {
         let exchange1Factory = await promisify(cb=>this.exchange1.methods.factoryAddress().call(cb))
         let exchange2Factory = await promisify(cb=>this.exchange2.methods.factoryAddress().call(cb))
         return new Array([exchange1Factory,exchange2Factory])


    }

    // def addLiquidity(min_liquidity: uint256, max_tokens: uint256, deadline: timestamp) -> uint256:
    addLiquidityTxData(min_liquidity,max_tokens,deadline) {
        let txData = this.exchange1.methods.addLiquidity(min_liquidity,max_tokens,deadline).encodeABI()
        return txData
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

    async getExchange1Price() {
        let prices = await this.getPrices()
        return prices[0]
    }
    async getExchange2Price() {
        let prices = await this.getPrices()
        return prices[1]

    }
    async getTotalPrice() {
        let prices = await this.getPrices()
        return prices[2]
    }


    async simulatePrices(token1Amount) {
        await this._syncData()

        let fee = 997
        let inputAmount = new BN(token1Amount)
        let input_amount_with_fee = inputAmount.times(fee)
        
        let outputReserve_Token1 = new BN(this.exchange1WeiBalance)
        let numerator = input_amount_with_fee.times(outputReserve_Token1)

        let inputReserve_Token1 = new BN(this.token1Balance)
        let denominator = inputReserve_Token1.times(1000).plus(input_amount_with_fee)
        let outputAmount_Token1 = new BN(numerator.div(denominator).toFixed(0))

        let token1Balance_end = inputReserve_Token1.plus(inputAmount)
        let wei1Balance_end = outputReserve_Token1.minus(outputAmount_Token1)


        let outputReserve_Token2 = new BN(this.token2Balance)
        let inputReserve_Token2 = new BN(this.exchange2WeiBalance) 
        let inputAmount_Token2 = outputAmount_Token1

        input_amount_with_fee = inputAmount_Token2.times(fee)

        numerator = input_amount_with_fee.times(outputReserve_Token2)
        denominator = inputReserve_Token2.times(1000).plus(input_amount_with_fee)


        let outputAmount_Token2 = new BN(numerator.div(denominator).toFixed(0))

        let token2Balance_end = outputReserve_Token2.minus(outputAmount_Token2)
        let wei2Balance_end = inputReserve_Token2.plus(inputAmount_Token2)

        let exchange1_endPrice = token1Balance_end.div(wei1Balance_end)
        let exchange2_endPrice = token2Balance_end.div(wei2Balance_end)

        let total_endPrice = exchange1_endPrice.div(exchange2_endPrice) 

        return[exchange1_endPrice, exchange2_endPrice, total_endPrice,outputAmount_Token2]



    }

    async getUniswapTargetToken(ifBuy,targetPrice) {

        await this._syncData()
        let pm = new BN(targetPrice) //Sell is using inverted price comparing to buy.
        if(ifBuy) {
            pm = new BN(1).div(targetPrice) //Expect price in ters of FAIR/DAI. C-org calculates price as DAI/FAIR
        }

        let params = this._getFormulaInputs(ifBuy)
        let targetToken = new BN(0)
       // target Wei = (sqrt((x1*y1* x2 *y2)/pm) + (x1 * y1))/(x1+x2)
       
       let mul_x1y1_x2_y2 = new BN(params.x1.times(params.y1).times(params.x2.times(params.y2)).toFixed(0))
       targetToken = new BN(mul_x1y1_x2_y2.div(pm).toFixed(0))
       targetToken = new BN(targetToken.sqrt().toFixed(0))
       targetToken = new BN(targetToken.plus(params.x1.times(params.y1)).div(params.x1.plus(params.x2)).toFixed(0))
           
       return targetToken.minus(params.y1)

    }

    _getFormulaInputs(buy) {
        //Buy is using parameters coming from another direction than sell. So whatever is y1 will be y2 in sell and so on. 
        // Sell formula is also using inverted target Price. price = 1/price
            let y1 = new BN(this.token1Balance)
            let y2 = new BN(this.token2Balance)
            let x1 = new BN(this.exchange1WeiBalance)
            let x2 = new BN(this.exchange2WeiBalance)
        if(buy) {
            return new Object({x1:x1,x2:x2,y1:y1,y2:y2})
        }
        else {
            return new Object({x1:x2,x2:x1,y1:y2,y2:y1})
        }

    }   

}

module.exports = UniswapPair