
var uniswap_factory = require('../abi/uniswap_factory.json')
const promisify = require('./promisify')




class UniswapFactoryProxy {
    constructor(web3, _factoryAddress) {
        this.web3 = web3
        this.factoryAddress = _factoryAddress
    }


    _getFactoryContract()  {
        this.factory = new this.web3.eth.Contract(uniswap_factory.abi,this.factoryAddress)
    }

 
    async initialize(){
        this._getFactoryContract()
    }

    async getExchange(tokenAddress) {
        let exchangeAddress = await promisify(cb=>this.factory.methods.getExchange(tokenAddress).call(cb))
        return exchangeAddress

    }




}

module.exports = UniswapFactoryProxy