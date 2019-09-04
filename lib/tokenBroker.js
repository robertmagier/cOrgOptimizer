const tokenABI = require('./tokenABI')
const promisify = require('./promisify')

class TokenBroker {
    constructor(web3) {
        this.web3 = web3
    }

    async readTokenBalance(tokenAddress,ownerAddress) {
        let tokenContract = new this.web3.eth.Contract(tokenABI,tokenAddress)
        let balance = await promisify(cb=>tokenContract.methods.balanceOf(ownerAddress).call(cb).toString())
        return balance
    }
}

module.exports = TokenBroker
