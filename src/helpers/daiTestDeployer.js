const { tokens, protocols } = require("hardlydifficult-test-helpers");

class DaiTestDeployer{
    constructor(web3)
    {
        this.web3 = web3
    }

    async deploy(ownerAccount) {
        this.dai = await tokens.dai.deploy(this.web3, ownerAccount);
        this.ownerAccount = ownerAccount
    }

    async approveBuyer(buyerAccount) {
        await this.contracts.erc1404.approve(buyerAccount, true, { from: this.ownerAccount })

    }
    async allowance(from,spender) {
        let amount = await this.dai.allowance(from,spender)
        return amount.toString()
    }

    async mint(buyerAccount,tokenAmount) {
        await this.dai.mint(buyerAccount, tokenAmount, { from: this.ownerAccount });
    }

    async approve(approvedBy, approvedAccount, tokenAmount) {
        await this.dai.approve(approvedAccount, tokenAmount, { from: approvedBy });

    }

    async balanceOf(account) {
        let balance = await this.dai.balanceOf(account)
        return balance.toString()
    }

    async transfer(from,to,amount) {
        await this.dai.transfer(to,amount,{from:from})

    }
    
    get tokenAddress() {
        return this.dai.address
    }

}

module.exports=DaiTestDeployer