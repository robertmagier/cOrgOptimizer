const { tokens, protocols } = require("hardlydifficult-test-helpers");
const promisify = require('./promisify')
const CorgTestDeployer = require('./corgTestDeployer')
const DaiTestDeployer = require('./daiTestDeployer')
const UniswapProxy = require('./uniswapProxy')
const UniswapFactoryProxy = require('./uniswapFactoryProxy')


class UniswapTestDeployer {
    constructor(web3)
    {
        this.web3 = web3
        this.corgDeployer = new CorgTestDeployer(this.web3)
        this.daiDeployer = new DaiTestDeployer(this.web3)
    }

    async prepare(weiAmount,tokenAmount) 
    {

        let accounts = await this._getAccounts()
        let factoryOwner = accounts[0]
        let fairExchangeOwner = accounts[1]
        let daiExchangeOwner = accounts[2]
        let cOrgOwner = accounts[3]
        let fairBuyer = accounts[4]
        let daiOwner = accounts[5]
        let daiBuyer = accounts[6]
        
    
        await this.corgDeployer.deploy(cOrgOwner)
        await this.daiDeployer.deploy(daiOwner)

        this.uniswap = await this._deployUniswap(factoryOwner)
        
        this.fairExchange = await this._createTestUniswapExchange(fairExchangeOwner,this.corgDeployer.tokenAddress)
        this.daiExchange = await this._createTestUniswapExchange(daiExchangeOwner,this.daiDeployer.tokenAddress)
        weiAmount = 10000000000
        tokenAmount = 10000000000 
        await this.daiDeployer.mint(daiBuyer,tokenAmount)
        await this.daiDeployer.approve(daiBuyer,this.daiExchange.address,tokenAmount)

        console.log('Dai Deployer Balance:', await this.daiDeployer.balanceOf(this.daiExchange.address))
        await this.daiExchange.addLiquidity(
            weiAmount,
            tokenAmount,
            Math.round(Date.now() / 1000) + 60,
            {
              from: daiBuyer,
              value: weiAmount
            }
          )
        console.log('Dai Deployer Balance:', await this.daiDeployer.balanceOf(this.daiExchange.address))

        console.log('Min Investment: ',this.corgDeployer.minInvestment.toString())
        console.log('Buy Slope: ', this.corgDeployer.buySlopeNum.toString(), this.corgDeployer.buySlopeDen.toString())
        await this.corgDeployer.approveBuyer(fairBuyer)
        await this.corgDeployer.buy(fairBuyer,"10000000000000000")
        
        let exchangeAddress = this.fairExchange.address
        await this.corgDeployer.approveBuyer(exchangeAddress)
        
        console.log('Exchange address:',  exchangeAddress)
        // this.fairExchange = new UniswapProxy(this.web3, this.fairExchange.address)
        // this.corgDeployer.approve(fairBuyer,accounts[7],"10000000000")
        console.log('Allowance:',await this.corgDeployer.allowance(fairBuyer,this.fairExchange.address))
        this.corgDeployer.approve(fairBuyer,exchangeAddress,10000000000)
        console.log('Allowance after approval:', await this.corgDeployer.allowance(fairBuyer,this.fairExchange.address))
        console.log('State: ', await this.corgDeployer.state())
        console.log('Fair buyer balance:', await this.corgDeployer.balanceOf(fairBuyer))
        // this.corgDeployer.transferFrom(fairBuyer,exchangeAddress,"10000000000",accounts[7])
        console.log('Fair buyer balance:', await this.corgDeployer.balanceOf(fairBuyer))
        console.log('Uniswap balance:', await this.corgDeployer.balanceOf(exchangeAddress))

        // await this.fairExchange.initialize()
        // console.log('Price: ', await this.fairExchange.getPrice())
        // let ta = await this.fairExchange.tokenAddress()
        // let factoryAddress = await this.fairExchange.factoryAddress()
        // console.log('Factory address: ', factoryAddress)
        // console.log('Token address: ', ta)
        // console.log('Token address: ', await this.corgDeployer.tokenAddress)

        await this.fairExchange.addLiquidity(
            weiAmount,
            tokenAmount,
            Math.round(Date.now() / 1000) + 60,
            {
              from: fairBuyer,
              value: weiAmount
            }
          )
          console.log('Uniswap balance:', await this.corgDeployer.balanceOf(exchangeAddress))

        //     await this.fairExchange.addLiquidity(
        //     weiAmount,
        //     tokenAmount,
        //     Math.round(Date.now() / 1000) + 60,
        //     {
        //       from: fairBuyer,
        //       value: weiAmount
        //     }
        //   ) 


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
        console.log('Exchange address: ',tx.logs[0].args.exchange)
        const exchange = await protocols.uniswap.getExchange(
            this.web3,
            tx.logs[0].args.exchange
        );
        
        return exchange   
    }



    async addLiquidity(weiAmount, tokenAmount, fromAccount) {

        const balanceETH = this.web3.utils.toBN(await this.web3.eth.getBalance(fromAccount)).toString();
        const current_block = await this.web3.eth.getBlock(await this.web3.eth.getBlockNumber());
        // console.log(current_block)
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
