
var uniswap_exchange = require('../abi/uniswap_exchange.json')
const BN = require('bignumber.js')
const promisify = require('./promisify')
const TokenBroker = require('./tokenBroker')
const { tokens, protocols } = require("hardlydifficult-test-helpers");




class UniswapProxy {
    constructor(web3, _exchangeAddress) {
        this.web3 = web3
        this.exchangeAddress = _exchangeAddress
        this.tokenBroker = new TokenBroker(this.web3)
    }



    _getExchangeContract()  {
        this.exchange = new this.web3.eth.Contract(uniswap_exchange.abi,this.exchangeAddress)
    }

    async tokenAddress() {
        this._tokenAddress =   await promisify(cb=>this.exchange.methods.tokenAddress().call(cb))
        return this._tokenAddress
    }

    async initialize(){
        this._getExchangeContract()
        await this.tokenAddress()
    }

    async tokenBalance() {
        this._tokenBalance = await this.tokenBroker.readTokenBalance(this._tokenAddress,this.exchangeAddress)
        console.log('Fuck: ', this._tokenBalance)
        return this._tokenBalance.toString()
    }

    async exchangeWeiBalance(exchange) {
        this._exchangeWeiBalance = await promisify(cb=>this.web3.eth.getBalance(this.exchangeAddress,cb).toString())
    }

    async _syncData() {
        await this.tokenBalance()
        await this.exchangeWeiBalance()
    }
    async getPrice() {

        await this._syncData()
        let y1 = new BN(this._tokenBalance)
        let x1 = new BN(this._exchangeWeiBalance)

        let exchangePrice = y1.div(x1).toString()
        return exchangePrice
    }

    async _deployUniswap(ownerAccount)
    {
        let uniswap = await protocols.uniswap.deploy(this.web3, ownerAccount);
        return uniswap 

    }

    async factoryAddress() {
        let factoryAddress = await promisify(cb=>this.exchange.methods.factoryAddress().call(cb))
        return factoryAddress
    }

    async addLiquidity(weiAmount, tokenAmount, fromAccount) {

            const balanceETH = this.web3.utils.toBN(await this.web3.eth.getBalance(fromAccount)).toString();
            console.log('Balance:', balanceETH)
            const current_block = await this.web3.eth.getBlock(await this.web3.eth.getBlockNumber());
            console.log('Wei amount:', weiAmount)
            console.log('token amount:', tokenAmount)
            // console.log(current_block)
            await this.exchange.methods.addLiquidity("10000000000","10000000000",
            current_block.timestamp + 300).send(
            {
              from: fromAccount,
              value: 10000000000
            }
          ) 
    }

}

module.exports = UniswapProxy