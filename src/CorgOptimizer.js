
const UniswapPair = require('./UniswapPair')
const FairProxy = require('./FairProxy')
const DaiProxy = require('./daiProxy')
const TestDeployer = require('./helpers/testDeployer.js')
const BN = require('bignumber.js')
const TokenBroker = require('./TokenBroker')
const TXSender = require('./helpers/txSender')

class CorgOptimizer {

    constructor(web3) {
        this.web3 = web3
        this.ready = false
    }

    async init(DAIExchangeAddress, FAIRExchangeAddress, DATAddress) {


        await this._init(DAIExchangeAddress, FAIRExchangeAddress, DATAddress)

    }

    async prepareTest(daiInitialSupply, fairInitialWei, uniswapDaiTokenAmount, uniswapDaiWeiAmount, uniswapFairTokenAmount, uniswapFairWeiAmount ) {
        this.testDeployer = new TestDeployer(this.web3)
        let result = await this.testDeployer.prepareTest(daiInitialSupply, fairInitialWei, uniswapDaiTokenAmount, uniswapDaiWeiAmount, uniswapFairTokenAmount, uniswapFairWeiAmount )
        await this._init(this.testDeployer.daiExchange.address, this.testDeployer.fairExchange.address, this.testDeployer.corg.datAddress)
        return result
    }

    async _init(DAIExchangeAddress, FAIRExchangeAddress, DATAddress) {
                
        this.DAIExchangeAddress = DAIExchangeAddress
        this.FAIRExchangeAddress = FAIRExchangeAddress
        this.DATAddress = DATAddress

        this.uniswapPair = new UniswapPair(this.web3,DAIExchangeAddress,FAIRExchangeAddress)
        this.fairProxy = new FairProxy(this.web3,DATAddress)
        await this.uniswapPair.initialize()
        await this.fairProxy.initialize()
        this.daiAddress = await this.uniswapPair.token1Address
        this.daiProxy = new DaiProxy(this.web3, this.daiAddress)
        await this.daiProxy.initialize()
        this.ready = true
    }

    async getUniswapInformation() {
        let daiExchangeInformation = new Object({name:'DAI', factoryAddress:0x0})
        let factoryAddress = await this.uniswapPair.getFactoryAddress()
        console.log(factoryAddress)
        return daiExchangeInformation
    }

    async fairBalance(account) {
        let broker = new TokenBroker(this.web3)
        console.log('FAIR ADDRESS: ', this.fairProxy.tokenAddress)
        let balance = await broker.readTokenBalance(this.fairProxy.tokenAddress,account)
        return balance
    }

    async optimizeBuyTransaction(daiAmount) {

        if(this.ready == false) {
            throw('Call init(exchange1Address, exchange2Address, datAddress) function first or prepareTest to initialize this object.')
        }
        let fairPrice = await this.fairProxy.calculateFairBuyPrice() //returns price in DAI/FAIR
        let uniswapPrice = await this.uniswapPair.getPrices() 
        let uniswapAmount = 0
        let datAmount = 0
        
        fairPrice = new BN(fairPrice)
        if(fairPrice.lt(uniswapPrice[2])) {
            uniswapAmount = 0
            datAmount = daiAmount
        } else {
            let targetToken = await this.uniswapPair.getUniswapTargetToken(true,fairPrice)
            if(targetToken.gte(daiAmount)) {
                uniswapAmount = daiAmount 
                datAmount = 0

            } else 
            {
                uniswapAmount = targetToken
                datAmount = new BN(daiAmount).minus(targetToken)
            }
        }
        
        uniswapAmount = new BN(uniswapAmount)
        datAmount = new BN(datAmount)

        return new Object({uniswap:uniswapAmount,dat:datAmount})

    }

    async optimizeSellTransaction(fairAmount) {

        if(this.ready == false) {
            throw('Call init(exchange1Address, exchange2Address, datAddress) function first or prepareTest to initialize this object.')
        }

        let fairPrice = await this.fairProxy.calculateFairSellPrice() //returns price in DAI/FAIR
        let uniswapPrice = await this.uniswapPair.getPrices() 
        let targetPrice = new BN(1).div(fairPrice) //Price should be in FAIR/DAI as expected in formula. 
        let uniswapAmount = 0
        let datAmount = 0

        if(fairPrice.gt(uniswapPrice[2])) {
            datAmount = fairAmount
            uniswapAmount = 0
        }
        else {
            let targetDai = await this.uniswapPair.getUniswapTargetToken(false,fairPrice)
            let targetToken = targetDai

            if(targetToken.lt(fairAmount)){
                uniswapAmount = targetToken
                datAmount = new BN(fairAmount).minus(targetToken)
            }
            else {
                uniswapAmount = fairAmount
                datAmount = 0
            }
        
        }

        return new Object({uniswap:uniswapAmount,dat:datAmount})


    }


    async approveFairUniswap(amount,from,_pkey) {
        let balance = await this.fairProxy.balanceOf(from)
        if(balance.lt(amount.toString())){
            throw('User does not have enough tokens to approve addLiquidity. ' + 'Account Balance: ' + balance.toFixed(0) + ' Requested Amount:' + amount.toString())
        }
        else {
            console.log('It is ok.')
        }

        let allowance = await this.fairProxy.allowance(from,this.FAIRExchangeAddress)
        allowance = new BN(allowance.toString())
        if(allowance.gte(amount)){
            console.log('This amount is already approved.')
            return;
        }
        let txData = this.fairProxy.approveTxData(from,this.FAIRExchangeAddress,amount)
        let wei=0
        await this._sendAndGetReceipt(this.DATAddress,txData,wei,_pkey)

        allowance = await this.fairProxy.allowance(from,this.FAIRExchangeAddress)
        console.log('FAIR Allowance: ', allowance)


    }

    async approveDAIUniswap(amount,from,_pkey) {
        let balance = await this.daiProxy.balanceOf(from)
        if(balance.lt(amount.toString())){
            throw('User does not have enough tokens to approve addLiquidity. ' + 'Account Balance: ' + balance.toFixed(0) + ' Requested Amount:' + amount.toString())
        }
        else {
            console.log('It is ok.')
        }

        let allowance = await this.daiProxy.allowance(from,this.DAIExchangeAddress)
        allowance = new BN(allowance.toString())
        if(allowance.gte(amount)){
            console.log('This amount is already approved.')
            return;
        }
        let txData = this.daiProxy.approveTxData(from,this.DAIExchangeAddress,amount)
        let wei=0
        await this._sendAndGetReceipt(this.daiAddress,txData,wei,from,_pkey)

        allowance = await this.daiProxy.allowance(from,this.DAIExchangeAddress)
        console.log('DAI Allowance: ', allowance)


    }


    async addFAIRLiquidity(amount,wei,from,_pkey) {
        // check account balance on DAT to make sure user has enough
 
        let txData = this.uniswapPair.addLiquidityTxData(1,amount,await this._currentBlockTimeStamp()+300)
        await this._sendAndGetReceipt(this.FAIRExchangeAddress,txData,wei,from,_pkey)


        // approve fair Tokens on DAT
        // Call function 
    }

    async addDAILiquidity(amount,wei,from,_pkey) {
        // check account balance on DAT to make sure user has enough
 
        let txData = this.uniswapPair.addLiquidityTxData(1,amount,await this._currentBlockTimeStamp()+300)
        await this._sendAndGetReceipt(this.DAIExchangeAddress,txData,wei,from,_pkey)


        // approve fair Tokens on DAT
        // Call function 
    }

    async _sendAndGetReceipt(to, txData, wei, from,_pkey) {

        let txSender = new TXSender(this.web3,from,_pkey)
        let hash = await txSender.send(to,txData,wei)
        console.log('Transaction Hash: ', hash)
        let receipt = null
        while(receipt == null) {
            receipt = await txSender.receipt(hash)
            Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000);
    
            process.stdout.write('.')
        }
        console.log('Receipt: ', receipt)
    }

    async _currentBlockTimeStamp()
    {
        let current_block = await this.web3.eth.getBlock(await this.web3.eth.getBlockNumber());
        let ts = current_block.timestamp
        return ts
    }

}

module.exports = CorgOptimizer