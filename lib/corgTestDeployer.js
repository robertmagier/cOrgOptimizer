const { tokens, protocols } = require("hardlydifficult-test-helpers");
const promisify = require('./promisify')
const fairABI = require('../abi/fairABI.js')

class CorgTestDeployer{
    constructor(web3)
    {
        this.web3 = web3
    }

    async deploy(ownerAccount) {
        this.contracts = await protocols.cOrg.deploy(this.web3, {
            control: ownerAccount
        });
        this.ownerAccount = ownerAccount

        this._minInvestment = await this.contracts.dat.minInvestment()
        this._buySlopeDen = await this.contracts.dat.buySlopeDen()
        this._buySlopeNum = await this.contracts.dat.buySlopeNum()
    }

    async approveBuyer(buyerAccount) {
        await this.contracts.erc1404.approve(buyerAccount, true, { from: this.ownerAccount })

    }

    async buy(buyerAccount,weiValue) {
        await this.contracts.dat.buy(buyerAccount, weiValue, 1, {
            from: buyerAccount,
            value: weiValue
          });
    }

    async approve(approvedBy, approvedAccount,amount) {
        let fair = new this.web3.eth.Contract(fairABI,this.contracts.fair.address)
        // await fair.methods.approve(approvedAccount,amount).send({from:approvedBy})
        await this.contracts.fair.approve(approvedAccount,amount,{from:approvedBy})
    }

    async balanceOf(owner) {
        let balance = await this.contracts.fair.balanceOf(owner)
        return balance
    }

    async allowance(from,spender) {
        let amount = await this.contracts.fair.allowance(from,spender)
        return amount.toString()
    }

    async transferFrom(from,to,amount,sender) {
        let fair = new this.web3.eth.Contract(fairABI,this.contracts.fair.address)
        await fair.methods.transferFrom(from,to,amount).send({from:sender})
    }

    async state() 
    {
        let state =  await this.contracts.dat.state()
        return state.toString()
    }
    get tokenAddress() {
        return this.contracts.fair.address
    }

    get datAddress(){
        return this.contracts.dat.address
    }

    get minInvestment() {
        return this._minInvestment
    }

    get buySlopeNum() {
        return this._buySlopeNum
    }

    get buySlopeDen() {
        return this._buySlopeDen
    }

    

}

module.exports=CorgTestDeployer