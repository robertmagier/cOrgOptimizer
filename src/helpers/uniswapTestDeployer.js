const { tokens, protocols } = require("hardlydifficult-ethereum-contracts");
const promisify = require('../../src/promisify')
const CorgTestDeployer = require('./corgTestDeployer')
const DaiTestDeployer = require('./daiTestDeployer')


class UniswapTestDeployer {
    constructor(web3)
    {
        this.web3 = web3
        this.corgDeployer = new CorgTestDeployer(this.web3)
        this.daiDeployer = new DaiTestDeployer(this.web3)
    }

    async deploy(ownerAccount) {
        let uniswap = await protocols.uniswap.deploy(this.web3, ownerAccount);
        this.uniswap = uniswap
        return uniswap 
    }

    get factoryAddress() {
        return this.uniswap.address
    }


    async createExchange(ownerAccount,tokenAddress)
    {
        let tx = await this.uniswap.createExchange(tokenAddress, { from: ownerAccount });
        const exchange = await protocols.uniswap.getExchange(
            this.web3,
            tx.logs[0].args.exchange
        );
        
        return exchange   
    }



    async addLiquidity(weiAmount, tokenAmount, fromAccount) {

        const balanceETH = this.web3.utils.toBN(await this.web3.eth.getBalance(fromAccount)).toString();
        const current_block = await this.web3.eth.getBlock(await this.web3.eth.getBlockNumber());
        await this.exchange.methods.addLiquidity(weiAmount,tokenAmount,
        current_block.timestamp + 300).send(
        {
          from: fromAccount,
          value: weiAmount
        }
      ) 
}

    async _getAccounts() {
        let accounts = await promisify(cb=>this.web3.eth.getAccounts(cb))
        return accounts
    }

}

module.exports = UniswapTestDeployer
