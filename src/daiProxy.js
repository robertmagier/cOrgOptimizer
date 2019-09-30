const BN = require('bignumber.js')

const promisify = require('./promisify')
const abi = require('c-org-abi/abi.json')


class DAIProxy {
    constructor(web3,daiAddress) {
        this.web3 = web3
        this.daiAddress = daiAddress
    }

    
    async initialize() {
        this.dai =  await new this.web3.eth.Contract(abi.erc20,this.daiAddress)
    }


    async allowance(from,spender) {
        let amount = await promisify(cb => this.dai.methods.allowance(from,spender).call(cb))
        return amount
    }

    async balanceOf(account) {
        let balance = await promisify(cb=>this.dai.methods.balanceOf(account).call(cb))
        return new BN(balance.toString())
    }

    async approve(fromAccount,spender,amount) {
        amount = await this.dai.methods.approve(spender,amount).send({from:fromAccount})
        return amount
    }

    approveTxData(fromAccount,spender,amount) {
        let data = this.dai.methods.approve(spender,amount).encodeABI()
        return data
    }

    

}

module.exports = DAIProxy
