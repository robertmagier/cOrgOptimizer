const abi = require('c-org-abi/abi.json')
const promisify = require('./promisify')

class TokenBroker {
    constructor(web3) {
        this.web3 = web3
    }

    async readTokenBalance(tokenAddress,ownerAddress) {
        // console.log('token address: ', tokenAddress, 'ownerAddress:', ownerAddress)
        let tokenContract = new this.web3.eth.Contract(abi.erc20,tokenAddress)
        let balance = await promisify(cb=>tokenContract.methods.balanceOf(ownerAddress).call(cb))
        return balance
    }
}

module.exports = TokenBroker
