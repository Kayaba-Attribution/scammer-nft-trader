
> scammer-nft-trader@1.0.0 tx
> npm run build && forta-agent run --tx 0xcccca4f81bed3d7e7ba2398fe084a133c100d7e2910ae09b943b8780b40d6d84


> scammer-nft-trader@1.0.0 build
> tsc

initializing agent...
Connected to the in-memory SQLite database.
Users table created or already exists
Transactions table created or already exists
Nfts table created or already exists
NaN
1900000000
name: GreenMetaverseToken
symbol: GMT
decimals: 8
Address: 0xe3c408bd53c31c085a1746af401a4042954ff740
Sender: [ '0x5d5c9023b5B6C086BCBb5086393ece6084474e5B' ]
Receiver: [ '0xc1cEbcf3cf47f35227987dCda354ca69BFc25c95' ]
Data (Decimal): 19
[
  {
    address: '0x5d5c9023b5b6c086bcbb5086393ece6084474e5b',
    name: undefined,
    symbol: undefined,
    totalSupply: undefined,
    tokenType: 'NOT_A_CONTRACT',
    openSea: {
      floorPrice: undefined,
      collectionName: undefined,
      safelistRequestStatus: undefined,
      imageUrl: undefined,
      description: undefined,
      externalUrl: undefined,
      twitterUsername: undefined,
      discordUrl: undefined,
      lastIngestedAt: '2023-06-03T07:12:25.000Z'
    },
    contractDeployer: undefined,
    deployedBlockNumber: undefined
  },
  {
    address: '0x00000000006c3852cbef3e08e8df289169ede581',
    name: 'Seaport',
    symbol: undefined,
    totalSupply: undefined,
    tokenType: 'NO_SUPPORTED_NFT_STANDARD',
    openSea: {
      floorPrice: 0,
      collectionName: 'Seaport V3',
      safelistRequestStatus: 'not_requested',
      imageUrl: undefined,
      description: undefined,
      externalUrl: undefined,
      twitterUsername: undefined,
      discordUrl: undefined,
      lastIngestedAt: '2023-04-26T21:24:17.000Z'
    },
    contractDeployer: '0x939c8d89ebc11fa45e576215e2353673ad0ba18a',
    deployedBlockNumber: 14946474
  },
  {
    address: '0x80cc7ba448603052d657dacf8053b0bb60e980e0',
    name: 'Before Dawn',
    symbol: 'BD',
    totalSupply: '5500',
    tokenType: 'ERC721',
    openSea: {
      floorPrice: 0,
      collectionName: 'Before Dawn (Mooar)',
      safelistRequestStatus: 'not_requested',
      imageUrl: 'https://i.seadn.io/gcs/files/d0fd630ebd12425ed1cb8cd0325a2609.jpg?w=500&auto=format',
      description: '',
      externalUrl: 'http://beforedawn.xyz',
      twitterUsername: undefined,
      discordUrl: undefined,
      lastIngestedAt: '2023-06-25T18:01:16.000Z'
    },
    contractDeployer: '0x5d5c9023b5b6c086bcbb5086393ece6084474e5b',
    deployedBlockNumber: 16098450
  },
  {
    address: '0xe3c408bd53c31c085a1746af401a4042954ff740',
    name: 'GreenMetaverseToken',
    symbol: 'GMT',
    totalSupply: '2147483647',
    tokenType: 'NO_SUPPORTED_NFT_STANDARD',
    openSea: {
      floorPrice: 0,
      collectionName: 'GreenMetaverseToken',
      safelistRequestStatus: 'not_requested',
      imageUrl: undefined,
      description: undefined,
      externalUrl: undefined,
      twitterUsername: undefined,
      discordUrl: undefined,
      lastIngestedAt: '2023-06-14T05:08:14.000Z'
    },
    contractDeployer: '0x656b1d2e9425c76eaa15f67e7ae17ff72415ecc9',
    deployedBlockNumber: 14996264
  }
]
run indexer for Before Dawn 0x80cc7ba448603052d657dacf8053b0bb60e980e0 0xcccca4f81bed3d7e7ba2398fe084a133c100d7e2910ae09b943b8780b40d6d84
isNftTrader: false
Currency address 0xe3c408bd53c31c085a1746af401a4042954ff740
Currency amount 1900000000n
Currency undefined
Currency address 0xe3c408bd53c31c085a1746af401a4042954ff740
Currency amount 100000000n
Currency undefined
[record status] found
COMMIT transaction record: 0xcccca4f81bed3d7e7ba2398fe084a133c100d7e2910ae09b943b8780b40d6d84
[record by id status] found (1)
----- Only one record available -----
1 findings for transaction 0xcccca4f81bed3d7e7ba2398fe084a133c100d7e2910ae09b943b8780b40d6d84 {
  "name": "scammer-nft-trader",
  "description": "[Opensea 🌊] Before Dawn id 27 sold at 0.0 ETH (no floor price detected) (UNKNOWN)",
  "alertId": "nft-sale",
  "protocol": "ethereum",
  "severity": "Info",
  "type": "Info",
  "metadata": {
    "interactedMarket": "opensea",
    "transactionHash": "0xcccca4f81bed3d7e7ba2398fe084a133c100d7e2910ae09b943b8780b40d6d84",
    "toAddr": "0x5d5c9023b5b6c086bcbb5086393ece6084474e5b",
    "fromAddr": "0xc1cebcf3cf47f35227987dcda354ca69bfc25c95",
    "initiator": "0x5d5c9023b5b6c086bcbb5086393ece6084474e5b",
    "totalPrice": "0",
    "avgItemPrice": "0",
    "contractAddress": "0x80cc7ba448603052d657dacf8053b0bb60e980e0",
    "floorPrice": "0",
    "timestamp": "1685775011",
    "floorPriceDiff": "UNKNOWN"
  },
  "addresses": [
    "0xc1cebcf3cf47f35227987dcda354ca69bfc25c95",
    "0x5d5c9023b5b6c086bcbb5086393ece6084474e5b",
    "0x5d5c9023b5b6c086bcbb5086393ece6084474e5b",
    "0x5d5c9023b5b6c086bcbb5086393ece6084474e5b",
    "0x00000000006c3852cbef3e08e8df289169ede581",
    "0x80cc7ba448603052d657dacf8053b0bb60e980e0",
    "0xe3c408bd53c31c085a1746af401a4042954ff740"
  ],
  "labels": [
    {
      "entityType": "Address",
      "entity": "27,0x80cc7ba448603052d657dacf8053b0bb60e980e0",
      "label": "nft-sale-record",
      "confidence": 0.9,
      "remove": false,
      "metadata": {}
    }
  ]
}
