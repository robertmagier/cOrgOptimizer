const fairABI = [
    {
      "name": "Approval",
      "inputs": [
        {
          "type": "address",
          "name": "_owner",
          "indexed": true
        },
        {
          "type": "address",
          "name": "_spender",
          "indexed": true
        },
        {
          "type": "uint256",
          "name": "_value",
          "indexed": false
        }
      ],
      "anonymous": false,
      "type": "event"
    },
    {
      "name": "Transfer",
      "inputs": [
        {
          "type": "address",
          "name": "_from",
          "indexed": true
        },
        {
          "type": "address",
          "name": "_to",
          "indexed": true
        },
        {
          "type": "uint256",
          "name": "_value",
          "indexed": false
        }
      ],
      "anonymous": false,
      "type": "event"
    },
    {
      "name": "AuthorizedOperator",
      "inputs": [
        {
          "type": "address",
          "name": "_operator",
          "indexed": true
        },
        {
          "type": "address",
          "name": "_tokenHolder",
          "indexed": true
        }
      ],
      "anonymous": false,
      "type": "event"
    },
    {
      "name": "Burned",
      "inputs": [
        {
          "type": "address",
          "name": "_operator",
          "indexed": true
        },
        {
          "type": "address",
          "name": "_from",
          "indexed": true
        },
        {
          "type": "uint256",
          "name": "_amount",
          "indexed": false
        },
        {
          "type": "bytes",
          "name": "_userData",
          "indexed": false
        },
        {
          "type": "bytes",
          "name": "_operatorData",
          "indexed": false
        }
      ],
      "anonymous": false,
      "type": "event"
    },
    {
      "name": "Minted",
      "inputs": [
        {
          "type": "address",
          "name": "_operator",
          "indexed": true
        },
        {
          "type": "address",
          "name": "_to",
          "indexed": true
        },
        {
          "type": "uint256",
          "name": "_amount",
          "indexed": false
        },
        {
          "type": "bytes",
          "name": "_userData",
          "indexed": false
        },
        {
          "type": "bytes",
          "name": "_operatorData",
          "indexed": false
        }
      ],
      "anonymous": false,
      "type": "event"
    },
    {
      "name": "RevokedOperator",
      "inputs": [
        {
          "type": "address",
          "name": "_operator",
          "indexed": true
        },
        {
          "type": "address",
          "name": "_tokenHolder",
          "indexed": true
        }
      ],
      "anonymous": false,
      "type": "event"
    },
    {
      "name": "Sent",
      "inputs": [
        {
          "type": "address",
          "name": "_operator",
          "indexed": true
        },
        {
          "type": "address",
          "name": "_from",
          "indexed": true
        },
        {
          "type": "address",
          "name": "_to",
          "indexed": true
        },
        {
          "type": "uint256",
          "name": "_amount",
          "indexed": false
        },
        {
          "type": "bytes",
          "name": "_userData",
          "indexed": false
        },
        {
          "type": "bytes",
          "name": "_operatorData",
          "indexed": false
        }
      ],
      "anonymous": false,
      "type": "event"
    },
    {
      "name": "UpdateConfig",
      "inputs": [
        {
          "type": "address",
          "name": "_erc1404Address",
          "indexed": true
        },
        {
          "type": "string",
          "name": "_name",
          "indexed": false
        },
        {
          "type": "string",
          "name": "_symbol",
          "indexed": false
        }
      ],
      "anonymous": false,
      "type": "event"
    },
    {
      "name": "initialize",
      "outputs": [],
      "inputs": [],
      "constant": false,
      "payable": false,
      "type": "function",
      "gas": 110374
    },
    {
      "name": "updateConfig",
      "outputs": [],
      "inputs": [
        {
          "type": "address",
          "name": "_erc1404Address"
        },
        {
          "type": "string",
          "name": "_name"
        },
        {
          "type": "string",
          "name": "_symbol"
        }
      ],
      "constant": false,
      "payable": false,
      "type": "function",
      "gas": 268579
    },
    {
      "name": "detectTransferRestriction",
      "outputs": [
        {
          "type": "uint256",
          "name": "out"
        }
      ],
      "inputs": [
        {
          "type": "address",
          "name": "_from"
        },
        {
          "type": "address",
          "name": "_to"
        },
        {
          "type": "uint256",
          "name": "_value"
        }
      ],
      "constant": true,
      "payable": false,
      "type": "function",
      "gas": 2511
    },
    {
      "name": "allowance",
      "outputs": [
        {
          "type": "uint256",
          "name": "out"
        }
      ],
      "inputs": [
        {
          "type": "address",
          "name": "_owner"
        },
        {
          "type": "address",
          "name": "_spender"
        }
      ],
      "constant": true,
      "payable": false,
      "type": "function",
      "gas": 1031
    },
    {
      "name": "decimals",
      "outputs": [
        {
          "type": "uint256",
          "name": "out"
        }
      ],
      "inputs": [],
      "constant": true,
      "payable": false,
      "type": "function",
      "gas": 553
    },
    {
      "name": "approve",
      "outputs": [
        {
          "type": "bool",
          "name": "out"
        }
      ],
      "inputs": [
        {
          "type": "address",
          "name": "_spender"
        },
        {
          "type": "uint256",
          "name": "_value"
        }
      ],
      "constant": false,
      "payable": false,
      "type": "function",
      "gas": 38136
    },
    {
      "name": "transfer",
      "outputs": [
        {
          "type": "bool",
          "name": "out"
        }
      ],
      "inputs": [
        {
          "type": "address",
          "name": "_to"
        },
        {
          "type": "uint256",
          "name": "_value"
        }
      ],
      "constant": false,
      "payable": false,
      "type": "function",
      "gas": 481863
    },
    {
      "name": "transferFrom",
      "outputs": [
        {
          "type": "bool",
          "name": "out"
        }
      ],
      "inputs": [
        {
          "type": "address",
          "name": "_from"
        },
        {
          "type": "address",
          "name": "_to"
        },
        {
          "type": "uint256",
          "name": "_value"
        }
      ],
      "constant": false,
      "payable": false,
      "type": "function",
      "gas": 520257
    },
    {
      "name": "isOperatorFor",
      "outputs": [
        {
          "type": "bool",
          "name": "out"
        }
      ],
      "inputs": [
        {
          "type": "address",
          "name": "_operator"
        },
        {
          "type": "address",
          "name": "_tokenHolder"
        }
      ],
      "constant": true,
      "payable": false,
      "type": "function",
      "gas": 1444
    },
    {
      "name": "granularity",
      "outputs": [
        {
          "type": "uint256",
          "name": "out"
        }
      ],
      "inputs": [],
      "constant": true,
      "payable": false,
      "type": "function",
      "gas": 703
    },
    {
      "name": "defaultOperators",
      "outputs": [
        {
          "type": "address[1]",
          "name": "out"
        }
      ],
      "inputs": [],
      "constant": true,
      "payable": false,
      "type": "function",
      "gas": 984
    },
    {
      "name": "authorizeOperator",
      "outputs": [],
      "inputs": [
        {
          "type": "address",
          "name": "_operator"
        }
      ],
      "constant": false,
      "payable": false,
      "type": "function",
      "gas": 37676
    },
    {
      "name": "revokeOperator",
      "outputs": [],
      "inputs": [
        {
          "type": "address",
          "name": "_operator"
        }
      ],
      "constant": false,
      "payable": false,
      "type": "function",
      "gas": 22706
    },
    {
      "name": "burn",
      "outputs": [],
      "inputs": [
        {
          "type": "uint256",
          "name": "_amount"
        },
        {
          "type": "bytes",
          "name": "_userData"
        }
      ],
      "constant": false,
      "payable": false,
      "type": "function",
      "gas": 499278
    },
    {
      "name": "operatorBurn",
      "outputs": [],
      "inputs": [
        {
          "type": "address",
          "name": "_from"
        },
        {
          "type": "uint256",
          "name": "_amount"
        },
        {
          "type": "bytes",
          "name": "_userData"
        },
        {
          "type": "bytes",
          "name": "_operatorData"
        }
      ],
      "constant": false,
      "payable": false,
      "type": "function",
      "gas": 502316
    },
    {
      "name": "send",
      "outputs": [],
      "inputs": [
        {
          "type": "address",
          "name": "_to"
        },
        {
          "type": "uint256",
          "name": "_amount"
        },
        {
          "type": "bytes",
          "name": "_userData"
        }
      ],
      "constant": false,
      "payable": false,
      "type": "function",
      "gas": 482556
    },
    {
      "name": "operatorSend",
      "outputs": [],
      "inputs": [
        {
          "type": "address",
          "name": "_from"
        },
        {
          "type": "address",
          "name": "_to"
        },
        {
          "type": "uint256",
          "name": "_amount"
        },
        {
          "type": "bytes",
          "name": "_userData"
        },
        {
          "type": "bytes",
          "name": "_operatorData"
        }
      ],
      "constant": false,
      "payable": false,
      "type": "function",
      "gas": 485595
    },
    {
      "name": "mint",
      "outputs": [],
      "inputs": [
        {
          "type": "address",
          "name": "_operator"
        },
        {
          "type": "address",
          "name": "_to"
        },
        {
          "type": "uint256",
          "name": "_quantity"
        },
        {
          "type": "bytes",
          "name": "_userData"
        },
        {
          "type": "bytes",
          "name": "_operatorData"
        }
      ],
      "constant": false,
      "payable": true,
      "type": "function",
      "gas": 449000
    },
    {
      "name": "erc1404Address",
      "outputs": [
        {
          "type": "address",
          "name": "out"
        }
      ],
      "inputs": [],
      "constant": true,
      "payable": false,
      "type": "function",
      "gas": 1173
    },
    {
      "name": "burnedSupply",
      "outputs": [
        {
          "type": "uint256",
          "name": "out"
        }
      ],
      "inputs": [],
      "constant": true,
      "payable": false,
      "type": "function",
      "gas": 1203
    },
    {
      "name": "datAddress",
      "outputs": [
        {
          "type": "address",
          "name": "out"
        }
      ],
      "inputs": [],
      "constant": true,
      "payable": false,
      "type": "function",
      "gas": 1233
    },
    {
      "name": "balanceOf",
      "outputs": [
        {
          "type": "uint256",
          "name": "out"
        }
      ],
      "inputs": [
        {
          "type": "address",
          "name": "arg0"
        }
      ],
      "constant": true,
      "payable": false,
      "type": "function",
      "gas": 1417
    },
    {
      "name": "totalSupply",
      "outputs": [
        {
          "type": "uint256",
          "name": "out"
        }
      ],
      "inputs": [],
      "constant": true,
      "payable": false,
      "type": "function",
      "gas": 1293
    },
    {
      "name": "name",
      "outputs": [
        {
          "type": "string",
          "name": "out"
        }
      ],
      "inputs": [],
      "constant": true,
      "payable": false,
      "type": "function",
      "gas": 12267
    },
    {
      "name": "symbol",
      "outputs": [
        {
          "type": "string",
          "name": "out"
        }
      ],
      "inputs": [],
      "constant": true,
      "payable": false,
      "type": "function",
      "gas": 7152
    }
  ]

module.exports = fairABI