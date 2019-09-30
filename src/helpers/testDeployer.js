const CorgTestDeployer = require('./corgTestDeployer')
const UniswapTestDeployer = require('./uniswapTestDeployer')
const DaiTestDeployer = require('./daiTestDeployer.js')
const BN = require('bignumber.js')
const promisify = require('../../src/promisify')

var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
expect = chai.expect


class TestDeployer {

    constructor (web3) {

        this.web3 = web3
        this.corg = new CorgTestDeployer(this.web3)
        this.uniswap = new UniswapTestDeployer(this.web3)
        this.dai = new DaiTestDeployer(this.web3)
        

    }

    async prepareTest(daiInitialSupply, fairInitialWei, uniswapDaiTokenAmount, uniswapDaiWeiAmount, uniswapFairTokenAmount, uniswapFairWeiAmount ) {
        
        let daiInitial = new BN(daiInitialSupply)
        if(daiInitial.lt(uniswapDaiTokenAmount)){
            throw("Incorrect input parameter values. Dai Initial Supply must be greater than uniswapDaiTokenAmount")
        }

        this.accounts = await this.getAccounts(this.web3)
        this.corgOwner = this.accounts[0]
        this.fairBuyer = this.accounts[1]
        this.uniswapOwner = this.accounts[2]
        this.daiOwner = this.accounts[3]
        this.daiBuyer = this.accounts[4]
        this.uniswapDaiBuyer = this.accounts[5]
        this.uniswapFairBuyer = this.accounts[6]

        // Save parameters values. 
        this.daiInitialSupply = daiInitialSupply
        this.fairInitialWei = fairInitialWei
        this.uniswapDaiTokenAmount = uniswapDaiTokenAmount
        this.uniswapDaiWeiAmount = uniswapDaiWeiAmount
        this.uniswapFairTokenAmount = uniswapFairTokenAmount
        this.uniswapFairWeiAmount = uniswapFairWeiAmount


        //Create supporting clases to deploy contracts
        await this.corg.deploy(this.corgOwner)
        await this.uniswap.deploy(this.uniswapOwner)
        await this.dai.deploy(this.daiOwner)

        // Create Uniswap Exchange Instances. 
        this.fairExchange  = await this.uniswap.createExchange(this.uniswapOwner,this.corg.tokenAddress)
        this.daiExchange  = await this.uniswap.createExchange(this.uniswapOwner,this.dai.tokenAddress)

        //Approve all accounts to DAT. 
        await this.corg.approveBuyer(this.fairBuyer)
        await this.corg.approveBuyer(this.fairExchange.address)
        await this.corg.approveBuyer(this.uniswapDaiBuyer)
        await this.corg.approveBuyer(this.uniswapFairBuyer)

        //Mint DAI Tokens
        await this.dai.mint(this.uniswapDaiBuyer,daiInitialSupply)
        // Buy initial FAIR Supply
        await this.corg.buy(this.fairBuyer,fairInitialWei)

        // Appoove Uniswap Fair Exchange to be able to transfer some tokens. 
        await this.corg.approve(this.fairBuyer,this.fairExchange.address,uniswapFairTokenAmount)
        let allowance = await this.corg.allowance(this.fairBuyer,this.fairExchange.address)
        expect(allowance.toString(),"It was not possible to approve tokens for Uniswap Fair Exchange.").to.be.equal(uniswapFairTokenAmount)

        // Approve Uniswap DAI Fair Exchange to be able to transfer some tokens. 
        await this.dai.approve(this.uniswapDaiBuyer,this.daiExchange.address,uniswapDaiTokenAmount)
        allowance = await this.dai.allowance(this.uniswapDaiBuyer,this.daiExchange.address)
        expect(allowance.toString(),"It was not possible to approve tokens for Uniswap Fair Exchange.").to.be.equal(uniswapDaiTokenAmount)

        let current_block = await this.web3.eth.getBlock(await this.web3.eth.getBlockNumber());
        
        //Add Liquiduty to Fair Exchange
        await this.fairExchange.addLiquidity(uniswapFairWeiAmount,uniswapFairTokenAmount,current_block.timestamp + 300,{from:this.fairBuyer,value:uniswapFairWeiAmount})
        let balance = await this.corg.balanceOf(this.fairExchange.address) 

        //Add Liquiduty to Dai Exchange
        await this.daiExchange.addLiquidity(uniswapDaiWeiAmount,uniswapDaiTokenAmount,current_block.timestamp + 300,{from:this.uniswapDaiBuyer,value:uniswapDaiWeiAmount})

        this.prepared = true
        let result = new Object({
            FAIRExchange: this.fairExchange.address,
            DAIExchange: this.daiExchange.address,
            DAT: this.corg.datAddress,
            FAIRToken: this.corg.tokenAddress,
            DAIToken: this.dai.tokenAddress
        })

        return result

    }

    // This function verifies if prepare function worked correctly and deployed tokens and wei according to initial parameters. 
    async verify() {
        
        expect(this.prepared,"Environment is not yet prepared").to.be.true
        let balance = await this.corg.balanceOf(this.fairExchange.address) 
        expect(balance.toString()).to.be.equal(this.uniswapFairTokenAmount)

        balance = await this.dai.balanceOf(this.daiExchange.address) 
        expect(balance).to.be.equal(this.uniswapDaiTokenAmount)

        let uniswapDaiBuyerBalance = await this.dai.balanceOf(this.uniswapDaiBuyer)
        expect(uniswapDaiBuyerBalance.toString(),"Uniswap Dai Buyer Balance is incorrect.").to.be.equal(new BN(this.daiInitialSupply).minus(balance).toString())

        balance = await this.web3.eth.getBalance(this.fairExchange.address)
        expect(balance,"Uniswap Fair Exchange Wei Balance incorrect.").to.be.equal(this.uniswapFairWeiAmount)

        balance = await this.web3.eth.getBalance(this.daiExchange.address)
        expect(balance,"Uniswap Dai Exchange Wei Balance incorrect.").to.be.equal(this.uniswapDaiWeiAmount)


    }

    async buyFairTokens(daiAmount) 
    {
        if(!this.prepared)
        {
            throw("First you have to prepare your testing environment")
        }
        let daiBalance = await this.dai.balanceOf(this.uniswapDaiBuyer)
        daiBalance = new BN(daiBalance)
        expect(daiBalance.gt(daiAmount),"Not enought tokens to execute swap transaction.").to.be.true
        await this.dai.approve(this.uniswapDaiBuyer,this.daiExchange.address,daiAmount)

        let current_block = await this.web3.eth.getBlock(await this.web3.eth.getBlockNumber());
        await this.daiExchange.tokenToTokenSwapInput(daiAmount,1,1,current_block.timestamp + 300,this.corg.tokenAddress,{from:this.uniswapDaiBuyer})

    }

    async sellFairTokens(fairAmount) 
    {
        if(!this.prepared)
        {
            throw("First you have to prepare your testing environment")
        }
        let fairBalance = await this.corg.balanceOf(this.fairBuyer)
        fairBalance = new BN(fairBalance)
        expect(fairBalance.gt(fairAmount),"Not enought tokens to execute sell transaction.").to.be.true
        await this.corg.approve(this.fairBuyer,this.fairExchange.address,fairAmount)

        let current_block = await this.web3.eth.getBlock(await this.web3.eth.getBlockNumber());
        await this.fairExchange.tokenToTokenSwapInput(fairAmount,1,1,current_block.timestamp + 300,this.dai.tokenAddress,{from:this.fairBuyer})

    }

    async getAccounts(web3) {
        let accounts = await promisify(cb=>web3.eth.getAccounts(cb))
        return accounts
    }

}

module.exports = TestDeployer
