const datABI = [
    {
      "name": "Buy",
      "inputs": [
        {
          "type": "address",
          "name": "_from",
          "indexed": false
        },
        {
          "type": "address",
          "name": "_to",
          "indexed": false
        },
        {
          "type": "uint256",
          "name": "_currencyValue",
          "indexed": false
        },
        {
          "type": "uint256",
          "name": "_fairValue",
          "indexed": false
        }
      ],
      "anonymous": false,
      "type": "event"
    },
    {
      "name": "Sell",
      "inputs": [
        {
          "type": "address",
          "name": "_from",
          "indexed": false
        },
        {
          "type": "address",
          "name": "_to",
          "indexed": false
        },
        {
          "type": "uint256",
          "name": "_currencyValue",
          "indexed": false
        },
        {
          "type": "uint256",
          "name": "_fairValue",
          "indexed": false
        }
      ],
      "anonymous": false,
      "type": "event"
    },
    {
      "name": "Pay",
      "inputs": [
        {
          "type": "address",
          "name": "_from",
          "indexed": false
        },
        {
          "type": "address",
          "name": "_to",
          "indexed": false
        },
        {
          "type": "uint256",
          "name": "_currencyValue",
          "indexed": false
        },
        {
          "type": "uint256",
          "name": "_fairValue",
          "indexed": false
        }
      ],
      "anonymous": false,
      "type": "event"
    },
    {
      "name": "Close",
      "inputs": [
        {
          "type": "uint256",
          "name": "_exitFee",
          "indexed": false
        }
      ],
      "anonymous": false,
      "type": "event"
    },
    {
      "name": "StateChange",
      "inputs": [
        {
          "type": "uint256",
          "name": "_previousState",
          "indexed": false,
          "unit": "The DAT's internal state machine"
        },
        {
          "type": "uint256",
          "name": "_newState",
          "indexed": false,
          "unit": "The DAT's internal state machine"
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
          "indexed": false
        },
        {
          "type": "address",
          "name": "_beneficiary",
          "indexed": true
        },
        {
          "type": "address",
          "name": "_control",
          "indexed": true
        },
        {
          "type": "address",
          "name": "_feeCollector",
          "indexed": true
        },
        {
          "type": "uint256",
          "name": "_burnThresholdBasisPoints",
          "indexed": false
        },
        {
          "type": "uint256",
          "name": "_feeBasisPoints",
          "indexed": false
        },
        {
          "type": "uint256",
          "name": "_minInvestment",
          "indexed": false
        },
        {
          "type": "uint256",
          "name": "_openUntilAtLeast",
          "indexed": false
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
      "name": "buybackReserve",
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
      "gas": 2428
    },
    {
      "name": "initialize",
      "outputs": [],
      "inputs": [
        {
          "type": "address",
          "name": "_bigDiv"
        },
        {
          "type": "address",
          "name": "_fairAddress"
        },
        {
          "type": "uint256",
          "name": "_initReserve"
        },
        {
          "type": "address",
          "name": "_currencyAddress"
        },
        {
          "type": "uint256",
          "name": "_initGoal"
        },
        {
          "type": "uint256",
          "name": "_buySlopeNum"
        },
        {
          "type": "uint256",
          "name": "_buySlopeDen"
        },
        {
          "type": "uint256",
          "name": "_investmentReserveBasisPoints"
        },
        {
          "type": "uint256",
          "name": "_revenueCommitmentBasisPoints"
        }
      ],
      "constant": false,
      "payable": false,
      "type": "function",
      "gas": 609394
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
          "type": "address",
          "name": "_beneficiary"
        },
        {
          "type": "address",
          "name": "_control"
        },
        {
          "type": "address",
          "name": "_feeCollector"
        },
        {
          "type": "uint256",
          "name": "_feeBasisPoints"
        },
        {
          "type": "uint256",
          "name": "_burnThresholdBasisPoints"
        },
        {
          "type": "uint256",
          "name": "_minInvestment"
        },
        {
          "type": "uint256",
          "name": "_openUntilAtLeast"
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
      "gas": 339988
    },
    {
      "name": "estimateBuyValue",
      "outputs": [
        {
          "type": "uint256",
          "name": "out"
        }
      ],
      "inputs": [
        {
          "type": "uint256",
          "name": "_currencyValue"
        }
      ],
      "constant": true,
      "payable": false,
      "type": "function",
      "gas": 176732
    },
    {
      "name": "buy",
      "outputs": [],
      "inputs": [
        {
          "type": "address",
          "name": "_to"
        },
        {
          "type": "uint256",
          "name": "_currencyValue"
        },
        {
          "type": "uint256",
          "name": "_minTokensBought"
        }
      ],
      "constant": false,
      "payable": true,
      "type": "function",
      "gas": 482582
    },
    {
      "name": "estimateSellValue",
      "outputs": [
        {
          "type": "uint256",
          "name": "out"
        }
      ],
      "inputs": [
        {
          "type": "uint256",
          "name": "_quantityToSell"
        }
      ],
      "constant": true,
      "payable": false,
      "type": "function",
      "gas": 15434
    },
    {
      "name": "sell",
      "outputs": [],
      "inputs": [
        {
          "type": "address",
          "name": "_to"
        },
        {
          "type": "uint256",
          "name": "_quantityToSell"
        },
        {
          "type": "uint256",
          "name": "_minCurrencyReturned"
        }
      ],
      "constant": false,
      "payable": false,
      "type": "function",
      "gas": 156145
    },
    {
      "name": "estimatePayValue",
      "outputs": [
        {
          "type": "uint256",
          "name": "out"
        }
      ],
      "inputs": [
        {
          "type": "uint256",
          "name": "_currencyValue"
        }
      ],
      "constant": true,
      "payable": false,
      "type": "function",
      "gas": 178035
    },
    {
      "name": "pay",
      "outputs": [],
      "inputs": [
        {
          "type": "address",
          "name": "_to"
        },
        {
          "type": "uint256",
          "name": "_currencyValue"
        }
      ],
      "constant": false,
      "payable": true,
      "type": "function",
      "gas": 532238
    },
    {
      "constant": false,
      "payable": true,
      "type": "fallback"
    },
    {
      "name": "estimateExitFee",
      "outputs": [
        {
          "type": "uint256",
          "name": "out"
        }
      ],
      "inputs": [
        {
          "type": "uint256",
          "unit": "wei",
          "name": "_msgValue"
        }
      ],
      "constant": true,
      "payable": false,
      "type": "function",
      "gas": 15136
    },
    {
      "name": "close",
      "outputs": [],
      "inputs": [],
      "constant": false,
      "payable": true,
      "type": "function",
      "gas": 95643
    },
    {
      "name": "tokensReceived",
      "outputs": [],
      "inputs": [
        {
          "type": "address",
          "name": "_operator"
        },
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
      "gas": 497406
    },
    {
      "name": "beneficiary",
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
      "gas": 1083
    },
    {
      "name": "bigDivAddress",
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
      "gas": 1113
    },
    {
      "name": "burnThresholdBasisPoints",
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
      "gas": 1143
    },
    {
      "name": "buySlopeNum",
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
      "gas": 1173
    },
    {
      "name": "buySlopeDen",
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
      "name": "control",
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
      "name": "currencyAddress",
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
      "gas": 1263
    },
    {
      "name": "feeCollector",
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
      "gas": 1293
    },
    {
      "name": "feeBasisPoints",
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
      "gas": 1323
    },
    {
      "name": "fairAddress",
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
      "gas": 1353
    },
    {
      "name": "initGoal",
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
      "gas": 1383
    },
    {
      "name": "initInvestors",
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
      "gas": 1567
    },
    {
      "name": "initReserve",
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
      "gas": 1443
    },
    {
      "name": "investmentReserveBasisPoints",
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
      "gas": 1473
    },
    {
      "name": "isCurrencyERC777",
      "outputs": [
        {
          "type": "bool",
          "name": "out"
        }
      ],
      "inputs": [],
      "constant": true,
      "payable": false,
      "type": "function",
      "gas": 1503
    },
    {
      "name": "openUntilAtLeast",
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
      "gas": 1533
    },
    {
      "name": "minInvestment",
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
      "gas": 1563
    },
    {
      "name": "revenueCommitmentBasisPoints",
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
      "gas": 1593
    },
    {
      "name": "state",
      "outputs": [
        {
          "type": "uint256",
          "unit": "The DAT's internal state machine",
          "name": "out"
        }
      ],
      "inputs": [],
      "constant": true,
      "payable": false,
      "type": "function",
      "gas": 1623
    }
  ]
module.exports = datABI  