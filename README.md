# scammer-nft-trader agent

## Description

This agent analyzes NFT transactions on OpenSea, LooksRare and Blur and generates alerts based on specific criteria. It processes the transactions and saves them in a local mySQL database as records.

Having all the records stored, it is possible to run any type of queries to extract and identify suspicious activities, such as NFTs being sold far from the floor price, or NFTs being sold too quickly.

Bad NFT Orders such as phishing are detected, tracked, and labeled. 

## Supported Chains

- Ethereum
  - OpenSea
  - LooksRare
  - Blur

- Optimism, BSC, Polygon, Fantom, Arbitrum, Avalanche
  - OpenSea

## Alerts

Describe each of the type of alerts fired by this agent

> floorPriceDiff: The difference between the floor price and the average item price, expressed as a percentage


- nft-sold-above-floor-price
  - Fired when a floorPriceDiff is above a certain threshold (+110%)
  - Severity is always set to "Info"
  - Type is always set to "Info" 
  - Includes the tokens sold, along with the currency used and value

- indexed-nft-sale
  - Fired when a previously indexed tokenId of a collection is sold
  - Severity is always set to "Info"
  - Type is always set to "Info" 
  - Included the time between transactions
  - Included the timeDiff between transactions
  - Includes the timestamp floorPriceDiff of the first and second txns

- nft-phishing-sale (nft-potential-low-value-phishing-sale for floorPrice < 50 USD>)
  - Fired when a previously indexed nft transaction has a value lower than a certain threshold (<-99% floor || 0)
  - Severity is always set to "Medium"
  - Type is always set to "Suspicious" 
    - Includes the labels:
    - nft-phishing-victim     (address)
    - nft-phishing-attacker   (address)
    - nft-phising-transfer    (id,address)
  - metadata example:
  ```
    "metadata": {
      "interactedMarket": "opensea",
      "transactionHash": "0x4fff109d9a6c030fce4de9426229a113524903f0babd6de11ee6c046d07226ff",
      "toAddr": "0xbf96d79074b269f75c20bd9fa6daed0773209ee7",
      "fromAddr": "0x08395c15c21dc3534b1c3b1d4fa5264e5bd7020c",
      "initiator": "0xaefc35de05da370f121998b0e2e95698841de9b1",
      "totalPrice": "0.001",
      "avgItemPrice": "0.0002",
      "contractAddress": "0xae99a698156ee8f8d07cbe7f271c31eeaac07087",
      "floorPrice": "0.58",
      "timestamp": "1671432035",
      "floorPriceDiff": "-99.97%"
    }
  ```

- stolen-nft-sale
  - Fired when a previously indexed nft id has a record that points to a a possible phishing attack.
  - Verifies by comparing the addresses between records and calculating the difference between values and floorPrice differences.
  - Severity is always set to "High"
  - Type is always set to "Exploit" 
    - Includes the labels:
    - nft-phishing-victim      (address)
    - nft-phishing-attacker    (address)
    - nft-phishing-attack-hash (hash) 
    - stolen-nft               (id,address)
  - Includes the address from which the nft was stolen and the profit made by the scammer
  - metadata example:
  ```
      "metadata": {
      "interactedMarket": "opensea",
      "transactionHash": "0xdc6fd3c2846f330aec65615341789397e1a9bb37a471851fe68b2db20a5a7b9f",
      "toAddr": "0x679d5162bad71990abca0f18095948c12a2756b0",
      "fromAddr": "0xbf96d79074b269f75c20bd9fa6daed0773209ee7",
      "initiator": "0x679d5162bad71990abca0f18095948c12a2756b0",
      "totalPrice": "0.5790000000000001",
      "avgItemPrice": "0.5790000000000001",
      "contractAddress": "0xae99a698156ee8f8d07cbe7f271c31eeaac07087",
      "floorPrice": "0.58",
      "timestamp": "1671457439",
      "floorPriceDiff": "-0.17%",
      "current sale": {
        "timestamp": 1671457439,
        "floorPriceDiff": "-0.17%",
        "avgItemPrice": 0.5790000000000001
      },
      "last sale": {
        "timestamp": 1671432035,
        "floorPriceDiff": "-99.97%",
        "avgItemPrice": 0.0002
      },
      "attackHash": "0x4fff109d9a6c030fce4de9426229a113524903f0babd6de11ee6c046d07226ff"
    }
  ```
### Alerts Matchers

Currently supported:
+ floorPriceDiff is >110%
+ floorPriceDiff is <1%
+ transfer value is 0
+ Indexed NFT sold

Planned:
+ NFTs sold too quickly (multiple thresholds)
+ NFT Wash Trade


## Examples

> Mutant Hound Collars 9911 sold for less than -99% of the floor price, at 0.0002 ETH with collection floor of 0.58 ETH
```
5 findings for transaction 0x4fff109d9a6c030fce4de9426229a113524903f0babd6de11ee6c046d07226ff {
  "name": "scammer-nft-trader",
  "description": "[Opensea 🌊] Mutant Hound Collars 6262 sold for less than -99% of the floor price, at 0.0002 ETH with collection floor of 0.58 ETH",
  "alertId": "nft-phishing-sale",
  "protocol": "ethereum",
  "severity": "Medium",
  "type": "Suspicious",
  "metadata": {
    "interactedMarket": "opensea",
    "transactionHash": "0x4fff109d9a6c030fce4de9426229a113524903f0babd6de11ee6c046d07226ff",
    "toAddr": "0xbf96d79074b269f75c20bd9fa6daed0773209ee7",
    "fromAddr": "0x08395c15c21dc3534b1c3b1d4fa5264e5bd7020c",
    "initiator": "0xaefc35de05da370f121998b0e2e95698841de9b1",
    "totalPrice": "0.001",
    "avgItemPrice": "0.0002",
    "contractAddress": "0xae99a698156ee8f8d07cbe7f271c31eeaac07087",
    "floorPrice": "0.58",
    "timestamp": "1671432035",
    "floorPriceDiff": "-99.97%"
  },
  "addresses": [
    "0x08395c15c21dc3534b1c3b1d4fa5264e5bd7020c",
    "0xbf96d79074b269f75c20bd9fa6daed0773209ee7",
    "0xaefc35de05da370f121998b0e2e95698841de9b1",
    "0xaefc35de05da370f121998b0e2e95698841de9b1",
    "0x00000000006c3852cbef3e08e8df289169ede581",
    "0xae99a698156ee8f8d07cbe7f271c31eeaac07087"
  ],
  "labels": [
    {
      "entityType": "Address",
      "entity": "0x08395c15c21dc3534b1c3b1d4fa5264e5bd7020c",
      "label": "nft-phishing-victim",
      "confidence": 0.8,
      "remove": false,
      "metadata": {}
    },
    {
      "entityType": "Address",
      "entity": "0xbf96d79074b269f75c20bd9fa6daed0773209ee7",
      "label": "nft-phishing-attacker",
      "confidence": 0.8,
      "remove": false,
      "metadata": {}
    },
    {
      "entityType": "Address",
      "entity": "6262,0xae99a698156ee8f8d07cbe7f271c31eeaac07087",
      "label": "nft-phising-transfer",
      "confidence": 0.9,
      "remove": false,
      "metadata": {}
    }
  ]
}, 4 more ...
```

> Mutant Hound Collars 6262 sold to 0x679d5162bad71990abca0f18095948c12a2756b0 by 0xbf96d79074b269f75c20bd9fa6daed0773209ee7 possibly stolen from 0x08395c15c21dc3534b1c3b1d4fa5264e5bd7020c in opensea at -0.17% of floor after 423.40 minutes for a profit of 0.579 ETH, for a value of 0.5790 ETH where the price floor is 0.58 ETH

```
1 findings for transaction 0xdc6fd3c2846f330aec65615341789397e1a9bb37a471851fe68b2db20a5a7b9f {
  "name": "scammer-nft-trader",
  "description": "[Opensea 🌊] Mutant Hound Collars 6262 sold to 0x679d5162bad71990abca0f18095948c12a2756b0 by 0xbf96d79074b269f75c20bd9fa6daed0773209ee7 possibly stolen from 0x08395c15c21dc3534b1c3b1d4fa5264e5bd7020c in opensea at -0.17% of floor after 423.40 minutes for a profit of 0.579 ETH, for a value of 0.5790 ETH where the price floor is 0.58 ETH",
  "alertId": "stolen-nft-sale",
  "protocol": "ethereum",
  "severity": "High",
  "type": "Exploit",
  "metadata": {
    "interactedMarket": "opensea",
    "transactionHash": "0xdc6fd3c2846f330aec65615341789397e1a9bb37a471851fe68b2db20a5a7b9f",
    "toAddr": "0x679d5162bad71990abca0f18095948c12a2756b0",
    "fromAddr": "0xbf96d79074b269f75c20bd9fa6daed0773209ee7",
    "initiator": "0x679d5162bad71990abca0f18095948c12a2756b0",
    "totalPrice": "0.5790000000000001",
    "avgItemPrice": "0.5790000000000001",
    "contractAddress": "0xae99a698156ee8f8d07cbe7f271c31eeaac07087",
    "floorPrice": "0.58",
    "timestamp": "1671457439",
    "floorPriceDiff": "-0.17%",
    "current sale": {
      "timestamp": 1671457439,
      "floorPriceDiff": "-0.17%",
      "avgItemPrice": 0.5790000000000001
    },
    "last sale": {
      "timestamp": 1671432035,
      "floorPriceDiff": "-99.97%",
      "avgItemPrice": 0.0002
    },
    "attackHash": "0x4fff109d9a6c030fce4de9426229a113524903f0babd6de11ee6c046d07226ff"
  },
  "addresses": [
    "0x08395c15c21dc3534b1c3b1d4fa5264e5bd7020c",
    "0xbf96d79074b269f75c20bd9fa6daed0773209ee7",
    "0x679d5162bad71990abca0f18095948c12a2756b0",
    "0x00000000006c3852cbef3e08e8df289169ede581",
    "0xae99a698156ee8f8d07cbe7f271c31eeaac07087"
  ],
  "labels": [
    {
      "entityType": "Address",
      "entity": "6262,0xae99a698156ee8f8d07cbe7f271c31eeaac07087",
      "label": "stolen-nft",
      "confidence": 0.8,
      "remove": false,
      "metadata": {}
    },
    {
      "entityType": "Address",
      "entity": "0x08395c15c21dc3534b1c3b1d4fa5264e5bd7020c",
      "label": "nft-phishing-victim",
      "confidence": 0.8,
      "remove": false,
      "metadata": {}
    },
    {
      "entityType": "Address",
      "entity": "0xbf96d79074b269f75c20bd9fa6daed0773209ee7",
      "label": "nft-phishing-attacker",
      "confidence": 0.8,
      "remove": false,
      "metadata": {}
    },
    {
      "entityType": "Transaction",
      "entity": "0x4fff109d9a6c030fce4de9426229a113524903f0babd6de11ee6c046d07226ff",
      "label": "nft-phishing-attack-hash",
      "confidence": 0.8,
      "remove": false,
      "metadata": {}
    }
  ]
}

```
### Database Schema

The database consists of three tables: users, transactions, and nfts. These tables store information about NFT users, their transactions, and the NFTs involved in those transactions


#### Users Table

```
CREATE TABLE IF NOT EXISTS users (
  address TEXT PRIMARY KEY,
  tx_count INTEGER
);
```

#### Transactions Table

```
CREATE TABLE IF NOT EXISTS transactions (
  transaction_hash TEXT PRIMARY KEY,
  interacted_market TEXT,
  to_address TEXT,
  from_address TEXT,
  initiator TEXT,
  total_price REAL,
  avg_item_price REAL,
  contract_address TEXT,
  floor_price REAL,
  timestamp INTEGER,
  floor_price_diff TEXT,
  FOREIGN KEY (to_address) REFERENCES users (address),
  FOREIGN KEY (from_address) REFERENCES users (address)
);

```

Columns
- transaction_hash: The hash of the transaction (Primary Key)
- interacted_market: The market where the transaction took place
- to_address: The Ethereum address of the recipient
- from_address: The Ethereum address of the sender
- initiator: The Ethereum address of the transaction initiator
- total_price: The total price of the NFTs involved in the transaction
- avg_item_price: The average price of the NFTs involved in the transaction
- contract_address: The address of the NFT contract
- floor_price: The floor price of the NFT at the time of the transaction
- timestamp: The timestamp of the transaction
- floor_price_diff: The difference between the floor price and the average item price, expressed as a percentage


#### NFTs Table

```
CREATE TABLE IF NOT EXISTS nfts (
  transaction_hash TEXT NOT NULL,
  token_id TEXT NOT NULL,
  name TEXT,
  price_value TEXT,
  price_currency_name TEXT,
  price_currency_decimals INTEGER,
  contract_address TEXT NOT NULL,
  FOREIGN KEY (transaction_hash) REFERENCES transactions (transaction_hash)
);
```

Columns
- transaction_hash: The hash of the transaction in which the NFT was involved
- token_id: The unique identifier of the NFT
- name: The name of the NFT
- price_value: The price of the NFT
- price_currency_name: The name of the currency used for the NFT's price
- price_currency_decimals: The number of decimals used in the currency
- contract_address: The address of the NFT contract



## Test Data

The agent behaviour can be verified with the following transactions:

- 0xdc6fd3c2846f330aec65615341789397e1a9bb37a471851fe68b2db20a5a7b9f OpenSea Trade
- 0x3b5966677f3b062c1ee2651b2dcc473b9a7d7cab995bf371e1952d0366ee4c67 Looks Rare
- 0xd7dbed24b00aa1ad13070da9221f10b050c1cdaf75f161e9ec5e3582f2450943 Blur

npm run tx 0x4fff109d9a6c030fce4de9426229a113524903f0babd6de11ee6c046d07226ff,0xdc6fd3c2846f330aec65615341789397e1a9bb37a471851fe68b2db20a5a7b9f

BSC OpenSea Trade:

- npm run bsctx 0x67c77755fcb06cec9884382e402b86ca77d3ab4998179653a17dfde85f2ef95f

Polygon OpenSea Trade:

- npm run polytx 0x50b9f159f227ce8bf0f596831adaddad49616537d3f36d1b5533f89d4aa94a50

## Alerts Test

- nft-sale 0xb9c1bf89d896ae50ff0cb9bb3ad9de1292c4378516a4399d309658b1bb720252

## Current Test Suite:

+ Database
  + adds a new record
  + adds multiple records
  + check for duplicate hash
  + save and retrive tx records

+ For newly indexed tokens txns
  + possible phising (0 or <99% floor price sale)
  + nft sale for >120% (configurable value)
  + regular sales

+ For previosly indexed tokens txns
  + regular salese (more info)
  + verified phising transfers