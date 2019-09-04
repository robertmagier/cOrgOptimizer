const DaiTestExchange = require('./daiTestExchange')
const Web3 = require('web3')

const provider_wss = 'wss://mainnet.infura.io/ws/v3/1083bd1be8444957a770056562d20ded'
const provider_http = 'http://localhost:8545'


var web3 = new Web3(new Web3.providers.WebsocketProvider(provider_wss))
var web3_local = new Web3(new Web3.providers.HttpProvider(provider_http))


async function main() {

    console.log('Preparing Testing Environment')
    let daiTestExchange = new DaiTestExchange(web3_local)
    await daiTestExchange.prepare(1000,1000)

}

main()














