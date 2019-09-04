const { tokens, protocols } = require("hardlydifficult-test-helpers");
const promisify = require('./promisify')


class DaiTestExchange {
    constructor(web3)
    {
        this.web3 = web3
    }

    async prepare(weiAmount,tokenAmount) 
    {
        let accounts = await this._getAccounts()
        let ownerAccount = accounts[0]
        this.tokenInstance = await this._deployTestDaiToken(this.web3,tokens,ownerAccount)
        this.exchangeInstance = await this._createTestUniswapExchange(ownerAccount,this.tokenInstance)
        await this._addTestDaiLiquidity(weiAmount,tokenAmount,ownerAccount)
        console.log('New DAI exchange address: ', this.exchangeInstance.address)
        console.log('New DAI Token address: ', this.tokenInstance.address)

    }

    async _deployTestDaiToken(web3,tokens,ownerAccount) {
        let dai = await tokens.dai.deploy(web3, ownerAccount);
        return dai
    }

    async _createTestUniswapExchange(ownerAccount,tokenInstance)
    {
        let uniswap = await protocols.uniswap.deploy(this.web3, ownerAccount);
        let tx = await uniswap.createExchange(tokenInstance.address, { from: ownerAccount });
        console.log('Exchange address: ',tx.logs[0].args.exchange)
        const exchange = await protocols.uniswap.getExchange(
            this.web3,
            tx.logs[0].args.exchange
        );
        return exchange   
    }

    async _addTestDaiLiquidity(weiAmount,tokenAmount,ownerAccount) {

        await this.tokenInstance.mint(ownerAccount, tokenAmount, { from: ownerAccount });
        await this.tokenInstance.approve(this.exchangeInstance.address, tokenAmount, { from: ownerAccount });
        await this.exchangeInstance.addLiquidity(
            weiAmount,
            tokenAmount,
            Math.round(Date.now() / 1000) + 60,
            {
              from: ownerAccount,
              value: weiAmount
            }
          )
    }

    async _getAccounts() {
        let accounts = await promisify(cb=>this.web3.eth.getAccounts(cb))
        return accounts
    }

}

module.exports = DaiTestExchange
