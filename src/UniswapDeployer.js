// Tutorial 2
// Command Line: node tutorial2.js --deploy example.sol

// The require packages
const path = require('path');
const fs = require('fs');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx').Transaction
const abiTool = require('ethereumjs-abi')

// Retrieve the command line arguments
let argv = require('minimist')(process.argv.slice(2));

let accounts = [
    {
        // Ganache Default Accounts, do not use it for your production
        // Develop 1
        address: '0x1C4d3187CA1effB42C10F33DE20C10D6804f6C14',
        key: '5c633a15635b1f2c297f949992d94ac31aeedb5f8cecd852f5e5eba2806c1d25'
    }
];

// Ganache or Private Ethereum Blockchain
let selectedHost = 'http://127.0.0.1:7545';
let selectedAccountIndex = 0; // Using the first account in the list

// web3 = new Web3(new Web3.providers.HttpProvider(selectedHost));
const provider_wss = 'wss://ropsten.infura.io/ws/v3/1083bd1be8444957a770056562d20ded'
var web3 = new Web3(new Web3.providers.WebsocketProvider(provider_wss))



 async function deployContract(contract) {
    let gasPrice = 100000000000
    console.log('Gas Price:', gasPrice)
    let gasPriceHex = web3.utils.toHex(gasPrice);
    let gasLimitHex = web3.utils.toHex(8000000);
    let block = await web3.eth.getBlock("latest");
    let nonce =  await web3.eth.getTransactionCount(accounts[selectedAccountIndex].address, "pending");
    let nonceHex = web3.utils.toHex(nonce);
    console.log('Deploy Contract')
    // It will read the ABI & byte code contents from the JSON file in ./build/contracts/ folder
    let jsonOutputName = path.parse(contract).name + '.json';
    let jsonFile = './abi/' + jsonOutputName;
    console.log('JSON File:', jsonFile)
    // After the smart deployment, it will generate another simple json file for web frontend.
    let webJsonFile = './assets/' + jsonOutputName;
    let result = false;

    try {
        result = fs.statSync(jsonFile);
    } catch (error) {
        console.log(error.message);
        return false;
    }

    // Read the JSON file contents
    let contractJsonContent = fs.readFileSync(jsonFile, 'utf8');    
    // console.log(contractJsonContent)
    let jsonOutput = JSON.parse(contractJsonContent);

    let abi = jsonOutput.abi
    let bytecode = jsonOutput.bytecode;
    // console.log(bytecode)
    // let encodedParameters = 
    // abiTool.rawEncode(['address'],  [ "0x0000000000000000000000000000000000000000" ])
    let contractData = bytecode


    // Prepare the raw transaction information
    let rawTx = {
        nonce: nonceHex,
        gasPrice: gasPriceHex,
        gasLimit: gasLimitHex,
        data: contractData,
        from: accounts[selectedAccountIndex].address
    };

    // Get the account private key, need to use it to sign the transaction later.
    let privateKey = new Buffer(accounts[selectedAccountIndex].key, 'hex')

    let tx = new Tx(rawTx,{chain:'ropsten', hardfork: 'petersburg'});

    // Sign the transaction 
    tx.sign(privateKey);
    let serializedTx = tx.serialize();

    let receipt = null;

    // Submit the smart contract deployment transaction
    console.log('Send Raw Transaction')
    web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'), async (err, hash) => {
        console.log('Inside')
        if (err) { 
            console.log(err); return; 
        }
    
        // Log the tx, you can explore status manually with eth.getTransaction()
        console.log('Contract creation tx: ' + hash);
    
        // Wait for the transaction to be mined
        while (receipt == null) {
            
            receipt = await web3.eth.getTransactionReceipt(hash)
            console.log('.')
            console.log('Receipt:', receipt)
            // Simulate the sleep function
            Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000);
        }
        
        // Update JSON
        // console.log('Contract address: ' + res.contractAddress);
        // jsonOutput['contracts'][contract]['contractAddress'] = receipt.contractAddress;

        // Web frontend just need to have abi & contract address information
        let webJsonOutput = {
            'abi': abi,
            'contractAddress': receipt.contractAddress
        };

        let formattedJson = JSON.stringify(jsonOutput, null, 4);
        let formattedWebJson = JSON.stringify(webJsonOutput);

        //console.log(formattedJson);
        fs.writeFileSync(jsonFile, formattedJson);
        fs.writeFileSync(webJsonFile, formattedWebJson);

        console.log('==============================');
    
    });
    // console.log('Output: ', output)
    return true;
}
console.log(web3.utils.toChecksumAddress('0x6198149b79AFE8114dc07b46A01d94a6af304ED9'))
console.log('0x6198149b79AFE8114dc07b46A01d94a6af304ED9')
console.log(argv)

if (typeof argv.deploy !== 'undefined') {
    // Build contract
    console.log('*')
    let contract = argv.deploy;

    let result = deployContract(contract);
    return;
}

console.log('End here.');