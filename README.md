# C-Org-Optimizer

This module should be used together winth Uniswap Exchange and C-ORG DAT Smart Contract. 
The idea is that user can buy FAIR tokens directly from DAT ( C-ORG Decentralized Autonomous Trust ) contract or from Uniswap. 
Selling and buying price is calculated differently in both of those smart contracts. 
You can read more about it here:
* C-ORG - https://github.com/C-ORG/whitepaper
* Uniswap - https://docs.uniswap.io/frontend-integration/swap

To buy FAIR tokens on Uniswap Exchange user has use two Uniswap Exchanges. First Exchange is DAI Token Uniswap Exchange and second exchange is FAIR Token Uniswap Exchange. Process is that first DAI Tokens are exchanged to ETH and then ETH is exchanged to buy FAIR in second Uniswap Exchange Contract

DAI ---> ETH ---> FAIR

Uniswap Exchange function to swap tokens is: 
* `tokenToTokenSwapInput()` to buy tokens for specified recipient address
* `tokenToTokenTransferInput()` to buy tokens for transaction sender
 
One can buy FAIR tokens by calling one of above functions on Uniswap **DAI** exchange Smart Contract or sell FAIR tokens by calling those functions on Uniswap **FAIR** Exchange contract. 

## How to use this Class
Typical scenario how this class can be used is as follows. Example can be found below:
1. Create web3 provider object. 
2. Initialize c-org-optimizer module and provide web3 provider as an input parameter. 
3. Call init() function **OR** prepareTest() function to initalize c-org-optimizer and provide correct DAT and Uniswap Exchange Addresses. Calling prepareTest() function will deploy all smart contracts for you and create testing environment. Using init() function will let you work already deployed smart contracts. ***prepareTest() function can be used only on local ganache node***
4. Call either optimizeBuyTransaction or optimizeSellTransaction function to get optimization results. 

## Implemented functions
This module implements following functions: 
* `constructor(web3)` - Class Constructor expects web3 instance to be provided as an input parameter. 
* `optimizeBuyTransaction(DAI_Amount)` - Taking into account that user wants to spend DAI_Amount of DAI Tokens function will calculate how to split those tokens between Uniswap Exchange and DAT Smart Contract to be able to buy biggest amount of FAIR Tokens. It returns an object with two properties: uniswap and dat (Big Number objects) representing how many DAI tokens we should spend on uniswap and how many on dat. 
* `optimizeSellTransaction(FAIR_AMOUNT)` - Taking into account that user wants to spend FAIR_Amount of FAIR Tokens function will calculate how to split those tokens between Uniswap Exchange and DAT Smart Contract to be able to buy biggest amount of DAI Tokens. It is called optimizeSellTransaction becuase buy selling FAIR Tokens we are buying DAI Tokens. It returns an object with two properties: uniswap and dat (Big Number objects) representing how many FAIR tokens we should spend on uniswap and how many on dat. 
* `async prepareTest(daiInitialSupply, fairInitialWei, uniswapDaiTokenAmount, uniswapDaiWeiAmount, uniswapFairTokenAmount, uniswapFairWeiAmount )` - this function creates initial testing environment on local ganache node. It will fail if called on Ropsten or any other network. It assumes that all accounts  are already approved. It might be a usefull for internal testing to see how Uniswap Exchanges and DAT Smart Contract Interact together. User does not have to call init function when this function was used to initialize c-org-optimizer. 

    __Input Parameters__
    * `daiInitialSupply` - number of DAI Tokens user wants to mint on DAI Tokens Smart Contract. 
    * `fairInitialWei` - initial investment on DAT Smart Contracts in WEI. 
    * `uniswapDaiTokenAmount` - amount of DAI Tokens we want add to DAI Uniswap Exchange to create Liquidity Pool. 
    * `uniswapDaiWeiAmount` - amount of WEI we want to add to DAI Uniswap Exchange to create Liquidity Pool. 
    * `uniswapFairTokenAmount` - amount of FAIR Tokens we want add to FAIR Uniswap Exchange to create Liquidity Pool.
    * `uniswapFairWeiAmount` - amount of WEI we want to add to FAIR Uniswap Exchange to create Liquidity Pool.
    
    __Returns__
    Function returns object with following properties:
    * `FAIRExchange` - address of Uniswap Exchange for FAIR Tokens. 
    * `DAIExchange` - address of Uniswap Exchange for DAI Tokens. 
    * `DAT` - address of DAT Smart Contracts
    * `FAIRToken` - address of FAIR Token Smart Contract
    * `DAIToken` - address of DAI Token Smart Contract
    
* `async init(DAIExchangeAddress, FAIRExchangeAddress, DATAddress)` - use this function when working on ropsten or main network to initialize c-org-optimizer. It takes address of Uniswap DAI Exchange, Uniswap Fair Exchange and DAT Adddress as input parameters. User doesn't not have to call this function when prepareTest function was used. 

More information about Big Number module is here: https://github.com/MikeMcl/bignumber.js/


## This is the example code how to use this module:
```javascript
const Optimizer = require('c-org-optimizer')
const Web3 = require('web3')
const provider_http = 'http://localhost:8545'

var web3 = new Web3(new Web3.providers.HttpProvider(provider_http))

const daiExchange = '0x9B53246dd09549E120575fed900E3C41D595496c'
const fairExchange = '0x336FcAb263982922b4e5C736Ed888D577eE817cf'
const DAT = '0x93264ff8642d0F2C21BCC78aE367B9eC6137addA'


async function main()
{
    optimizer = new Optimizer(web3)
    await optimizer.init(,daiExchange,fairExchange,DAT)
    //OR IF YOU WANT TO CREATE YOUR LOCAL TESTING ENVIRONMENT
    //let environment = await optimizer.prepareTest("2000000000000","1000000000000000000000","1000000000000","1000000000000","10000000000","10000000000")
    //console.log('Uniswap Fair Exchange Address: ', environment.FAIRExchange)
    //console.log('Uniswap DAI Exchange Address:  ', environment.DAIExchange)
    //console.log('DAT Address:                   ', environment.DAT)
    //console.log('FAIR Token Address:            ', environment.FAIRToken)
    //console.log('DAI Token Address:             ', environment.DAIToken)
    
    let result = await optimizer.optimizeBuyTransaction('11083071190')
    console.log('Result of Buy Optimization. ')
    console.log('Amount to buy on Uniswap:   ', result.uniswap.toString())
    console.log('Amount to buy on DAT:       ', result.dat.toString())

    result = await optimizer.optimizeSellTransaction('11083071190')
    console.log()
    console.log('Result of Sell Optimization.') 
    console.log('Amount to sell on Uniswap:  ', result.uniswap.toString())
    console.log('Amount to sel on DAT:       ', result.dat.toString())
}

main()
```




