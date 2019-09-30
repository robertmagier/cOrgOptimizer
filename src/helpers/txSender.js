const EthereumTx = require('ethereumjs-tx').Transaction
const promisify = require('../promisify')

class TxSender {
    constructor(web3, _account, _privateKey) {
        this.web3 = web3
        this.account = _account
        this.privateKey = _privateKey
    }

async send(_to, _txData, weiAmount) {

    var web3 = this.web3
    var output = null
    let gasPrice = 50000000000
    let gasPriceHex = this.web3.utils.toHex(gasPrice);
    let gasLimitHex = this.web3.utils.toHex(8000000);
    let weiAmountHex = this.web3.utils.toHex(weiAmount);
    let block = await this.web3.eth.getBlock("latest");
    let nonce =  await this.web3.eth.getTransactionCount(this.account, "pending");
    let nonceHex = this.web3.utils.toHex(nonce);

    let rawTx = {
        nonce: nonceHex,
        gasPrice: gasPriceHex,
        gasLimit: gasLimitHex,
        data: _txData,
        to:_to,
        from: this.account,
        value: weiAmountHex
    }

    let privateKey = new Buffer(this.privateKey, 'hex')
    let tx = new EthereumTx(rawTx,{chain:'ropsten', hardfork: 'petersburg'});

    tx.sign(privateKey);
    let serializedTx = tx.serialize();
    let txHash = await promisify(cb=>this.web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'), cb))
    return txHash

}

    async receipt(hash) {
    let receipt = await promisify(cb=>this.web3.eth.getTransactionReceipt(hash,cb))
    return receipt
    }
}



module.exports = TxSender