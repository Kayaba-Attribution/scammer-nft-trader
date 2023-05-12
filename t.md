
> scammer-nft-trader@1.0.0 tx
> npm run build && forta-agent run --tx 0x7ccdc6021c4f81367c488ef5441b4c17876398c143dee5ca9d3869e35738cf2e


> scammer-nft-trader@1.0.0 build
> tsc

initializing agent...
Connected to the in-memory SQLite database.
Users table created or already exists
Transactions table created or already exists
Nfts table created or already exists
run indexer for reepz 0xf192502dc0a01728955a82a5b84631bf719c8ee2 0x7ccdc6021c4f81367c488ef5441b4c17876398c143dee5ca9d3869e35738cf2e
----- record -----
{
    "interactedMarket": "blur",
    "transactionHash": "0x7ccdc6021c4f81367c488ef5441b4c17876398c143dee5ca9d3869e35738cf2e",
    "toAddr": "0x1544D2de126e3A4b194Cfad2a5C6966b3460ebE3",
    "fromAddr": "0xE60B2ce34Bc4C118F373197050167489083679D5",
    "initiator": "0x1544d2de126e3a4b194cfad2a5c6966b3460ebe3",
    "totalPrice": 0.36400000000000005,
    "avgItemPrice": 0.02426666666666667,
    "contractAddress": "0xf192502dc0a01728955a82a5b84631bf719c8ee2",
    "floorPrice": 0,
    "timestamp": 1683834335,
    "tokens": {
        "4": {
            "name": "",
            "price": {
                "value": "0.024",
                "currency": {
                    "name": "ETH",
                    "decimals": 18
                }
            }
        },
        "140": {
            "name": "",
            "price": {
                "value": "0.024",
                "currency": {
                    "name": "ETH",
                    "decimals": 18
                }
            }
        },
        "466": {
            "name": "",
            "price": {
                "value": "0.028",
                "currency": {
                    "name": "ETH",
                    "decimals": 18
                }
            }
        },
        "768": {
            "name": "",
            "price": {
                "value": "0.024",
                "currency": {
                    "name": "ETH",
                    "decimals": 18
                }
            }
        },
        "1791": {
            "name": "",
            "price": {
                "value": "0.024",
                "currency": {
                    "name": "ETH",
                    "decimals": 18
                }
            }
        },
        "2514": {
            "name": "",
            "price": {
                "value": "0.024",
                "currency": {
                    "name": "ETH",
                    "decimals": 18
                }
            }
        },
        "2569": {
            "name": "",
            "price": {
                "value": "0.024",
                "currency": {
                    "name": "ETH",
                    "decimals": 18
                }
            }
        },
        "2664": {
            "name": "",
            "price": {
                "value": "0.024",
                "currency": {
                    "name": "ETH",
                    "decimals": 18
                }
            }
        },
        "3147": {
            "name": "",
            "price": {
                "value": "0.024",
                "currency": {
                    "name": "ETH",
                    "decimals": 18
                }
            }
        },
        "3580": {
            "name": "",
            "price": {
                "value": "0.024",
                "currency": {
                    "name": "ETH",
                    "decimals": 18
                }
            }
        },
        "3635": {
            "name": "",
            "price": {
                "value": "0.024",
                "currency": {
                    "name": "ETH",
                    "decimals": 18
                }
            }
        },
        "3752": {
            "name": "",
            "price": {
                "value": "0.024",
                "currency": {
                    "name": "ETH",
                    "decimals": 18
                }
            }
        },
        "4249": {
            "name": "",
            "price": {
                "value": "0.024",
                "currency": {
                    "name": "ETH",
                    "decimals": 18
                }
            }
        },
        "4660": {
            "name": "",
            "price": {
                "value": "0.024",
                "currency": {
                    "name": "ETH",
                    "decimals": 18
                }
            }
        },
        "4838": {
            "name": "",
            "price": {
                "value": "0.024",
                "currency": {
                    "name": "ETH",
                    "decimals": 18
                }
            }
        }
    },
    "floorPriceDiff": "UNKNOWN"
}
COMMIT transaction record: 0x7ccdc6021c4f81367c488ef5441b4c17876398c143dee5ca9d3869e35738cf2e
----- Accesed records on db by contract and tokenId (more recent 2) -----
----- Only one record available -----
15 findings for transaction 0x7ccdc6021c4f81367c488ef5441b4c17876398c143dee5ca9d3869e35738cf2e {
  "name": "scammer-nft-trader",
  "description": "0xf192502dc0a01728955a82a5b84631bf719c8ee2 id 4 sold at 0.024 (no floor price detected)",
  "alertId": "indexed-nft-sale",
  "protocol": "ethereum",
  "severity": "Info",
  "type": "Suspicious",
  "metadata": {
    "interactedMarket": "blur",
    "transactionHash": "0x7ccdc6021c4f81367c488ef5441b4c17876398c143dee5ca9d3869e35738cf2e",
    "toAddr": "0x1544D2de126e3A4b194Cfad2a5C6966b3460ebE3",
    "fromAddr": "0xE60B2ce34Bc4C118F373197050167489083679D5",
    "initiator": "0x1544d2de126e3a4b194cfad2a5c6966b3460ebe3",
    "totalPrice": "0.36400000000000005",
    "avgItemPrice": "0.02426666666666667",
    "contractAddress": "0xf192502dc0a01728955a82a5b84631bf719c8ee2",
    "floorPrice": "0",
    "timestamp": "1683834335",
    "floorPriceDiff": "UNKNOWN"
  },
  "addresses": [
    "0xE60B2ce34Bc4C118F373197050167489083679D5",
    "0x1544D2de126e3A4b194Cfad2a5C6966b3460ebE3",
    "0x1544d2de126e3a4b194cfad2a5c6966b3460ebe3",
    "0x1544d2de126e3a4b194cfad2a5c6966b3460ebe3",
    "0x000000000000ad05ccc4f10045630fb830b95127",
    "0xf192502dc0a01728955a82a5b84631bf719c8ee2"
  ],
  "labels": [
    {
      "entityType": "Address",
      "entity": "4,0xf192502dc0a01728955a82a5b84631bf719c8ee2",
      "label": "nft-sale-record",
      "confidence": 0.9,
      "remove": false,
      "metadata": {}
    }
  ]
},{
  "name": "scammer-nft-trader",
  "description": "0xf192502dc0a01728955a82a5b84631bf719c8ee2 id 140 sold at 0.024 (no floor price detected)",
  "alertId": "indexed-nft-sale",
  "protocol": "ethereum",
  "severity": "Info",
  "type": "Suspicious",
  "metadata": {
    "interactedMarket": "blur",
    "transactionHash": "0x7ccdc6021c4f81367c488ef5441b4c17876398c143dee5ca9d3869e35738cf2e",
    "toAddr": "0x1544D2de126e3A4b194Cfad2a5C6966b3460ebE3",
    "fromAddr": "0xE60B2ce34Bc4C118F373197050167489083679D5",
    "initiator": "0x1544d2de126e3a4b194cfad2a5c6966b3460ebe3",
    "totalPrice": "0.36400000000000005",
    "avgItemPrice": "0.02426666666666667",
    "contractAddress": "0xf192502dc0a01728955a82a5b84631bf719c8ee2",
    "floorPrice": "0",
    "timestamp": "1683834335",
    "floorPriceDiff": "UNKNOWN"
  },
  "addresses": [
    "0xE60B2ce34Bc4C118F373197050167489083679D5",
    "0x1544D2de126e3A4b194Cfad2a5C6966b3460ebE3",
    "0x1544d2de126e3a4b194cfad2a5c6966b3460ebe3",
    "0x1544d2de126e3a4b194cfad2a5c6966b3460ebe3",
    "0x000000000000ad05ccc4f10045630fb830b95127",
    "0xf192502dc0a01728955a82a5b84631bf719c8ee2"
  ],
  "labels": [
    {
      "entityType": "Address",
      "entity": "140,0xf192502dc0a01728955a82a5b84631bf719c8ee2",
      "label": "nft-sale-record",
      "confidence": 0.9,
      "remove": false,
      "metadata": {}
    }
  ]
},{
  "name": "scammer-nft-trader",
  "description": "0xf192502dc0a01728955a82a5b84631bf719c8ee2 id 466 sold at 0.024 (no floor price detected)",
  "alertId": "indexed-nft-sale",
  "protocol": "ethereum",
  "severity": "Info",
  "type": "Suspicious",
  "metadata": {
    "interactedMarket": "blur",
    "transactionHash": "0x7ccdc6021c4f81367c488ef5441b4c17876398c143dee5ca9d3869e35738cf2e",
    "toAddr": "0x1544D2de126e3A4b194Cfad2a5C6966b3460ebE3",
    "fromAddr": "0xE60B2ce34Bc4C118F373197050167489083679D5",
    "initiator": "0x1544d2de126e3a4b194cfad2a5c6966b3460ebe3",
    "totalPrice": "0.36400000000000005",
    "avgItemPrice": "0.02426666666666667",
    "contractAddress": "0xf192502dc0a01728955a82a5b84631bf719c8ee2",
    "floorPrice": "0",
    "timestamp": "1683834335",
    "floorPriceDiff": "UNKNOWN"
  },
  "addresses": [
    "0xE60B2ce34Bc4C118F373197050167489083679D5",
    "0x1544D2de126e3A4b194Cfad2a5C6966b3460ebE3",
    "0x1544d2de126e3a4b194cfad2a5c6966b3460ebe3",
    "0x1544d2de126e3a4b194cfad2a5c6966b3460ebe3",
    "0x000000000000ad05ccc4f10045630fb830b95127",
    "0xf192502dc0a01728955a82a5b84631bf719c8ee2"
  ],
  "labels": [
    {
      "entityType": "Address",
      "entity": "466,0xf192502dc0a01728955a82a5b84631bf719c8ee2",
      "label": "nft-sale-record",
      "confidence": 0.9,
      "remove": false,
      "metadata": {}
    }
  ]
},{
  "name": "scammer-nft-trader",
  "description": "0xf192502dc0a01728955a82a5b84631bf719c8ee2 id 768 sold at 0.024 (no floor price detected)",
  "alertId": "indexed-nft-sale",
  "protocol": "ethereum",
  "severity": "Info",
  "type": "Suspicious",
  "metadata": {
    "interactedMarket": "blur",
    "transactionHash": "0x7ccdc6021c4f81367c488ef5441b4c17876398c143dee5ca9d3869e35738cf2e",
    "toAddr": "0x1544D2de126e3A4b194Cfad2a5C6966b3460ebE3",
    "fromAddr": "0xE60B2ce34Bc4C118F373197050167489083679D5",
    "initiator": "0x1544d2de126e3a4b194cfad2a5c6966b3460ebe3",
    "totalPrice": "0.36400000000000005",
    "avgItemPrice": "0.02426666666666667",
    "contractAddress": "0xf192502dc0a01728955a82a5b84631bf719c8ee2",
    "floorPrice": "0",
    "timestamp": "1683834335",
    "floorPriceDiff": "UNKNOWN"
  },
  "addresses": [
    "0xE60B2ce34Bc4C118F373197050167489083679D5",
    "0x1544D2de126e3A4b194Cfad2a5C6966b3460ebE3",
    "0x1544d2de126e3a4b194cfad2a5c6966b3460ebe3",
    "0x1544d2de126e3a4b194cfad2a5c6966b3460ebe3",
    "0x000000000000ad05ccc4f10045630fb830b95127",
    "0xf192502dc0a01728955a82a5b84631bf719c8ee2"
  ],
  "labels": [
    {
      "entityType": "Address",
      "entity": "768,0xf192502dc0a01728955a82a5b84631bf719c8ee2",
      "label": "nft-sale-record",
      "confidence": 0.9,
      "remove": false,
      "metadata": {}
    }
  ]
},{
  "name": "scammer-nft-trader",
  "description": "0xf192502dc0a01728955a82a5b84631bf719c8ee2 id 1791 sold at 0.024 (no floor price detected)",
  "alertId": "indexed-nft-sale",
  "protocol": "ethereum",
  "severity": "Info",
  "type": "Suspicious",
  "metadata": {
    "interactedMarket": "blur",
    "transactionHash": "0x7ccdc6021c4f81367c488ef5441b4c17876398c143dee5ca9d3869e35738cf2e",
    "toAddr": "0x1544D2de126e3A4b194Cfad2a5C6966b3460ebE3",
    "fromAddr": "0xE60B2ce34Bc4C118F373197050167489083679D5",
    "initiator": "0x1544d2de126e3a4b194cfad2a5c6966b3460ebe3",
    "totalPrice": "0.36400000000000005",
    "avgItemPrice": "0.02426666666666667",
    "contractAddress": "0xf192502dc0a01728955a82a5b84631bf719c8ee2",
    "floorPrice": "0",
    "timestamp": "1683834335",
    "floorPriceDiff": "UNKNOWN"
  },
  "addresses": [
    "0xE60B2ce34Bc4C118F373197050167489083679D5",
    "0x1544D2de126e3A4b194Cfad2a5C6966b3460ebE3",
    "0x1544d2de126e3a4b194cfad2a5c6966b3460ebe3",
    "0x1544d2de126e3a4b194cfad2a5c6966b3460ebe3",
    "0x000000000000ad05ccc4f10045630fb830b95127",
    "0xf192502dc0a01728955a82a5b84631bf719c8ee2"
  ],
  "labels": [
    {
      "entityType": "Address",
      "entity": "1791,0xf192502dc0a01728955a82a5b84631bf719c8ee2",
      "label": "nft-sale-record",
      "confidence": 0.9,
      "remove": false,
      "metadata": {}
    }
  ]
},{
  "name": "scammer-nft-trader",
  "description": "0xf192502dc0a01728955a82a5b84631bf719c8ee2 id 2514 sold at 0.024 (no floor price detected)",
  "alertId": "indexed-nft-sale",
  "protocol": "ethereum",
  "severity": "Info",
  "type": "Suspicious",
  "metadata": {
    "interactedMarket": "blur",
    "transactionHash": "0x7ccdc6021c4f81367c488ef5441b4c17876398c143dee5ca9d3869e35738cf2e",
    "toAddr": "0x1544D2de126e3A4b194Cfad2a5C6966b3460ebE3",
    "fromAddr": "0xE60B2ce34Bc4C118F373197050167489083679D5",
    "initiator": "0x1544d2de126e3a4b194cfad2a5c6966b3460ebe3",
    "totalPrice": "0.36400000000000005",
    "avgItemPrice": "0.02426666666666667",
    "contractAddress": "0xf192502dc0a01728955a82a5b84631bf719c8ee2",
    "floorPrice": "0",
    "timestamp": "1683834335",
    "floorPriceDiff": "UNKNOWN"
  },
  "addresses": [
    "0xE60B2ce34Bc4C118F373197050167489083679D5",
    "0x1544D2de126e3A4b194Cfad2a5C6966b3460ebE3",
    "0x1544d2de126e3a4b194cfad2a5c6966b3460ebe3",
    "0x1544d2de126e3a4b194cfad2a5c6966b3460ebe3",
    "0x000000000000ad05ccc4f10045630fb830b95127",
    "0xf192502dc0a01728955a82a5b84631bf719c8ee2"
  ],
  "labels": [
    {
      "entityType": "Address",
      "entity": "2514,0xf192502dc0a01728955a82a5b84631bf719c8ee2",
      "label": "nft-sale-record",
      "confidence": 0.9,
      "remove": false,
      "metadata": {}
    }
  ]
},{
  "name": "scammer-nft-trader",
  "description": "0xf192502dc0a01728955a82a5b84631bf719c8ee2 id 2569 sold at 0.024 (no floor price detected)",
  "alertId": "indexed-nft-sale",
  "protocol": "ethereum",
  "severity": "Info",
  "type": "Suspicious",
  "metadata": {
    "interactedMarket": "blur",
    "transactionHash": "0x7ccdc6021c4f81367c488ef5441b4c17876398c143dee5ca9d3869e35738cf2e",
    "toAddr": "0x1544D2de126e3A4b194Cfad2a5C6966b3460ebE3",
    "fromAddr": "0xE60B2ce34Bc4C118F373197050167489083679D5",
    "initiator": "0x1544d2de126e3a4b194cfad2a5c6966b3460ebe3",
    "totalPrice": "0.36400000000000005",
    "avgItemPrice": "0.02426666666666667",
    "contractAddress": "0xf192502dc0a01728955a82a5b84631bf719c8ee2",
    "floorPrice": "0",
    "timestamp": "1683834335",
    "floorPriceDiff": "UNKNOWN"
  },
  "addresses": [
    "0xE60B2ce34Bc4C118F373197050167489083679D5",
    "0x1544D2de126e3A4b194Cfad2a5C6966b3460ebE3",
    "0x1544d2de126e3a4b194cfad2a5c6966b3460ebe3",
    "0x1544d2de126e3a4b194cfad2a5c6966b3460ebe3",
    "0x000000000000ad05ccc4f10045630fb830b95127",
    "0xf192502dc0a01728955a82a5b84631bf719c8ee2"
  ],
  "labels": [
    {
      "entityType": "Address",
      "entity": "2569,0xf192502dc0a01728955a82a5b84631bf719c8ee2",
      "label": "nft-sale-record",
      "confidence": 0.9,
      "remove": false,
      "metadata": {}
    }
  ]
},{
  "name": "scammer-nft-trader",
  "description": "0xf192502dc0a01728955a82a5b84631bf719c8ee2 id 2664 sold at 0.024 (no floor price detected)",
  "alertId": "indexed-nft-sale",
  "protocol": "ethereum",
  "severity": "Info",
  "type": "Suspicious",
  "metadata": {
    "interactedMarket": "blur",
    "transactionHash": "0x7ccdc6021c4f81367c488ef5441b4c17876398c143dee5ca9d3869e35738cf2e",
    "toAddr": "0x1544D2de126e3A4b194Cfad2a5C6966b3460ebE3",
    "fromAddr": "0xE60B2ce34Bc4C118F373197050167489083679D5",
    "initiator": "0x1544d2de126e3a4b194cfad2a5c6966b3460ebe3",
    "totalPrice": "0.36400000000000005",
    "avgItemPrice": "0.02426666666666667",
    "contractAddress": "0xf192502dc0a01728955a82a5b84631bf719c8ee2",
    "floorPrice": "0",
    "timestamp": "1683834335",
    "floorPriceDiff": "UNKNOWN"
  },
  "addresses": [
    "0xE60B2ce34Bc4C118F373197050167489083679D5",
    "0x1544D2de126e3A4b194Cfad2a5C6966b3460ebE3",
    "0x1544d2de126e3a4b194cfad2a5c6966b3460ebe3",
    "0x1544d2de126e3a4b194cfad2a5c6966b3460ebe3",
    "0x000000000000ad05ccc4f10045630fb830b95127",
    "0xf192502dc0a01728955a82a5b84631bf719c8ee2"
  ],
  "labels": [
    {
      "entityType": "Address",
      "entity": "2664,0xf192502dc0a01728955a82a5b84631bf719c8ee2",
      "label": "nft-sale-record",
      "confidence": 0.9,
      "remove": false,
      "metadata": {}
    }
  ]
},{
  "name": "scammer-nft-trader",
  "description": "0xf192502dc0a01728955a82a5b84631bf719c8ee2 id 3147 sold at 0.024 (no floor price detected)",
  "alertId": "indexed-nft-sale",
  "protocol": "ethereum",
  "severity": "Info",
  "type": "Suspicious",
  "metadata": {
    "interactedMarket": "blur",
    "transactionHash": "0x7ccdc6021c4f81367c488ef5441b4c17876398c143dee5ca9d3869e35738cf2e",
    "toAddr": "0x1544D2de126e3A4b194Cfad2a5C6966b3460ebE3",
    "fromAddr": "0xE60B2ce34Bc4C118F373197050167489083679D5",
    "initiator": "0x1544d2de126e3a4b194cfad2a5c6966b3460ebe3",
    "totalPrice": "0.36400000000000005",
    "avgItemPrice": "0.02426666666666667",
    "contractAddress": "0xf192502dc0a01728955a82a5b84631bf719c8ee2",
    "floorPrice": "0",
    "timestamp": "1683834335",
    "floorPriceDiff": "UNKNOWN"
  },
  "addresses": [
    "0xE60B2ce34Bc4C118F373197050167489083679D5",
    "0x1544D2de126e3A4b194Cfad2a5C6966b3460ebE3",
    "0x1544d2de126e3a4b194cfad2a5c6966b3460ebe3",
    "0x1544d2de126e3a4b194cfad2a5c6966b3460ebe3",
    "0x000000000000ad05ccc4f10045630fb830b95127",
    "0xf192502dc0a01728955a82a5b84631bf719c8ee2"
  ],
  "labels": [
    {
      "entityType": "Address",
      "entity": "3147,0xf192502dc0a01728955a82a5b84631bf719c8ee2",
      "label": "nft-sale-record",
      "confidence": 0.9,
      "remove": false,
      "metadata": {}
    }
  ]
},{
  "name": "scammer-nft-trader",
  "description": "0xf192502dc0a01728955a82a5b84631bf719c8ee2 id 3580 sold at 0.024 (no floor price detected)",
  "alertId": "indexed-nft-sale",
  "protocol": "ethereum",
  "severity": "Info",
  "type": "Suspicious",
  "metadata": {
    "interactedMarket": "blur",
    "transactionHash": "0x7ccdc6021c4f81367c488ef5441b4c17876398c143dee5ca9d3869e35738cf2e",
    "toAddr": "0x1544D2de126e3A4b194Cfad2a5C6966b3460ebE3",
    "fromAddr": "0xE60B2ce34Bc4C118F373197050167489083679D5",
    "initiator": "0x1544d2de126e3a4b194cfad2a5c6966b3460ebe3",
    "totalPrice": "0.36400000000000005",
    "avgItemPrice": "0.02426666666666667",
    "contractAddress": "0xf192502dc0a01728955a82a5b84631bf719c8ee2",
    "floorPrice": "0",
    "timestamp": "1683834335",
    "floorPriceDiff": "UNKNOWN"
  },
  "addresses": [
    "0xE60B2ce34Bc4C118F373197050167489083679D5",
    "0x1544D2de126e3A4b194Cfad2a5C6966b3460ebE3",
    "0x1544d2de126e3a4b194cfad2a5c6966b3460ebe3",
    "0x1544d2de126e3a4b194cfad2a5c6966b3460ebe3",
    "0x000000000000ad05ccc4f10045630fb830b95127",
    "0xf192502dc0a01728955a82a5b84631bf719c8ee2"
  ],
  "labels": [
    {
      "entityType": "Address",
      "entity": "3580,0xf192502dc0a01728955a82a5b84631bf719c8ee2",
      "label": "nft-sale-record",
      "confidence": 0.9,
      "remove": false,
      "metadata": {}
    }
  ]
},{
  "name": "scammer-nft-trader",
  "description": "0xf192502dc0a01728955a82a5b84631bf719c8ee2 id 3635 sold at 0.024 (no floor price detected)",
  "alertId": "indexed-nft-sale",
  "protocol": "ethereum",
  "severity": "Info",
  "type": "Suspicious",
  "metadata": {
    "interactedMarket": "blur",
    "transactionHash": "0x7ccdc6021c4f81367c488ef5441b4c17876398c143dee5ca9d3869e35738cf2e",
    "toAddr": "0x1544D2de126e3A4b194Cfad2a5C6966b3460ebE3",
    "fromAddr": "0xE60B2ce34Bc4C118F373197050167489083679D5",
    "initiator": "0x1544d2de126e3a4b194cfad2a5c6966b3460ebe3",
    "totalPrice": "0.36400000000000005",
    "avgItemPrice": "0.02426666666666667",
    "contractAddress": "0xf192502dc0a01728955a82a5b84631bf719c8ee2",
    "floorPrice": "0",
    "timestamp": "1683834335",
    "floorPriceDiff": "UNKNOWN"
  },
  "addresses": [
    "0xE60B2ce34Bc4C118F373197050167489083679D5",
    "0x1544D2de126e3A4b194Cfad2a5C6966b3460ebE3",
    "0x1544d2de126e3a4b194cfad2a5c6966b3460ebe3",
    "0x1544d2de126e3a4b194cfad2a5c6966b3460ebe3",
    "0x000000000000ad05ccc4f10045630fb830b95127",
    "0xf192502dc0a01728955a82a5b84631bf719c8ee2"
  ],
  "labels": [
    {
      "entityType": "Address",
      "entity": "3635,0xf192502dc0a01728955a82a5b84631bf719c8ee2",
      "label": "nft-sale-record",
      "confidence": 0.9,
      "remove": false,
      "metadata": {}
    }
  ]
},{
  "name": "scammer-nft-trader",
  "description": "0xf192502dc0a01728955a82a5b84631bf719c8ee2 id 3752 sold at 0.024 (no floor price detected)",
  "alertId": "indexed-nft-sale",
  "protocol": "ethereum",
  "severity": "Info",
  "type": "Suspicious",
  "metadata": {
    "interactedMarket": "blur",
    "transactionHash": "0x7ccdc6021c4f81367c488ef5441b4c17876398c143dee5ca9d3869e35738cf2e",
    "toAddr": "0x1544D2de126e3A4b194Cfad2a5C6966b3460ebE3",
    "fromAddr": "0xE60B2ce34Bc4C118F373197050167489083679D5",
    "initiator": "0x1544d2de126e3a4b194cfad2a5c6966b3460ebe3",
    "totalPrice": "0.36400000000000005",
    "avgItemPrice": "0.02426666666666667",
    "contractAddress": "0xf192502dc0a01728955a82a5b84631bf719c8ee2",
    "floorPrice": "0",
    "timestamp": "1683834335",
    "floorPriceDiff": "UNKNOWN"
  },
  "addresses": [
    "0xE60B2ce34Bc4C118F373197050167489083679D5",
    "0x1544D2de126e3A4b194Cfad2a5C6966b3460ebE3",
    "0x1544d2de126e3a4b194cfad2a5c6966b3460ebe3",
    "0x1544d2de126e3a4b194cfad2a5c6966b3460ebe3",
    "0x000000000000ad05ccc4f10045630fb830b95127",
    "0xf192502dc0a01728955a82a5b84631bf719c8ee2"
  ],
  "labels": [
    {
      "entityType": "Address",
      "entity": "3752,0xf192502dc0a01728955a82a5b84631bf719c8ee2",
      "label": "nft-sale-record",
      "confidence": 0.9,
      "remove": false,
      "metadata": {}
    }
  ]
},{
  "name": "scammer-nft-trader",
  "description": "0xf192502dc0a01728955a82a5b84631bf719c8ee2 id 4249 sold at 0.024 (no floor price detected)",
  "alertId": "indexed-nft-sale",
  "protocol": "ethereum",
  "severity": "Info",
  "type": "Suspicious",
  "metadata": {
    "interactedMarket": "blur",
    "transactionHash": "0x7ccdc6021c4f81367c488ef5441b4c17876398c143dee5ca9d3869e35738cf2e",
    "toAddr": "0x1544D2de126e3A4b194Cfad2a5C6966b3460ebE3",
    "fromAddr": "0xE60B2ce34Bc4C118F373197050167489083679D5",
    "initiator": "0x1544d2de126e3a4b194cfad2a5c6966b3460ebe3",
    "totalPrice": "0.36400000000000005",
    "avgItemPrice": "0.02426666666666667",
    "contractAddress": "0xf192502dc0a01728955a82a5b84631bf719c8ee2",
    "floorPrice": "0",
    "timestamp": "1683834335",
    "floorPriceDiff": "UNKNOWN"
  },
  "addresses": [
    "0xE60B2ce34Bc4C118F373197050167489083679D5",
    "0x1544D2de126e3A4b194Cfad2a5C6966b3460ebE3",
    "0x1544d2de126e3a4b194cfad2a5c6966b3460ebe3",
    "0x1544d2de126e3a4b194cfad2a5c6966b3460ebe3",
    "0x000000000000ad05ccc4f10045630fb830b95127",
    "0xf192502dc0a01728955a82a5b84631bf719c8ee2"
  ],
  "labels": [
    {
      "entityType": "Address",
      "entity": "4249,0xf192502dc0a01728955a82a5b84631bf719c8ee2",
      "label": "nft-sale-record",
      "confidence": 0.9,
      "remove": false,
      "metadata": {}
    }
  ]
},{
  "name": "scammer-nft-trader",
  "description": "0xf192502dc0a01728955a82a5b84631bf719c8ee2 id 4660 sold at 0.024 (no floor price detected)",
  "alertId": "indexed-nft-sale",
  "protocol": "ethereum",
  "severity": "Info",
  "type": "Suspicious",
  "metadata": {
    "interactedMarket": "blur",
    "transactionHash": "0x7ccdc6021c4f81367c488ef5441b4c17876398c143dee5ca9d3869e35738cf2e",
    "toAddr": "0x1544D2de126e3A4b194Cfad2a5C6966b3460ebE3",
    "fromAddr": "0xE60B2ce34Bc4C118F373197050167489083679D5",
    "initiator": "0x1544d2de126e3a4b194cfad2a5c6966b3460ebe3",
    "totalPrice": "0.36400000000000005",
    "avgItemPrice": "0.02426666666666667",
    "contractAddress": "0xf192502dc0a01728955a82a5b84631bf719c8ee2",
    "floorPrice": "0",
    "timestamp": "1683834335",
    "floorPriceDiff": "UNKNOWN"
  },
  "addresses": [
    "0xE60B2ce34Bc4C118F373197050167489083679D5",
    "0x1544D2de126e3A4b194Cfad2a5C6966b3460ebE3",
    "0x1544d2de126e3a4b194cfad2a5c6966b3460ebe3",
    "0x1544d2de126e3a4b194cfad2a5c6966b3460ebe3",
    "0x000000000000ad05ccc4f10045630fb830b95127",
    "0xf192502dc0a01728955a82a5b84631bf719c8ee2"
  ],
  "labels": [
    {
      "entityType": "Address",
      "entity": "4660,0xf192502dc0a01728955a82a5b84631bf719c8ee2",
      "label": "nft-sale-record",
      "confidence": 0.9,
      "remove": false,
      "metadata": {}
    }
  ]
},{
  "name": "scammer-nft-trader",
  "description": "0xf192502dc0a01728955a82a5b84631bf719c8ee2 id 4838 sold at 0.024 (no floor price detected)",
  "alertId": "indexed-nft-sale",
  "protocol": "ethereum",
  "severity": "Info",
  "type": "Suspicious",
  "metadata": {
    "interactedMarket": "blur",
    "transactionHash": "0x7ccdc6021c4f81367c488ef5441b4c17876398c143dee5ca9d3869e35738cf2e",
    "toAddr": "0x1544D2de126e3A4b194Cfad2a5C6966b3460ebE3",
    "fromAddr": "0xE60B2ce34Bc4C118F373197050167489083679D5",
    "initiator": "0x1544d2de126e3a4b194cfad2a5c6966b3460ebe3",
    "totalPrice": "0.36400000000000005",
    "avgItemPrice": "0.02426666666666667",
    "contractAddress": "0xf192502dc0a01728955a82a5b84631bf719c8ee2",
    "floorPrice": "0",
    "timestamp": "1683834335",
    "floorPriceDiff": "UNKNOWN"
  },
  "addresses": [
    "0xE60B2ce34Bc4C118F373197050167489083679D5",
    "0x1544D2de126e3A4b194Cfad2a5C6966b3460ebE3",
    "0x1544d2de126e3a4b194cfad2a5c6966b3460ebe3",
    "0x1544d2de126e3a4b194cfad2a5c6966b3460ebe3",
    "0x000000000000ad05ccc4f10045630fb830b95127",
    "0xf192502dc0a01728955a82a5b84631bf719c8ee2"
  ],
  "labels": [
    {
      "entityType": "Address",
      "entity": "4838,0xf192502dc0a01728955a82a5b84631bf719c8ee2",
      "label": "nft-sale-record",
      "confidence": 0.9,
      "remove": false,
      "metadata": {}
    }
  ]
}
