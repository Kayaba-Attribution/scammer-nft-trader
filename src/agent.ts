import {
  Finding,
  Initialize,
  HandleTransaction,
  HandleAlert,
  AlertEvent,
  TransactionEvent,
  FindingType,
  ethers,
  EntityType,
  Label,
  FindingSeverity,
  getEthersProvider
} from "forta-agent";

import { createCustomAlert } from "./utils/alerts";
import db, { ALCHEMY_API_KEY } from './db';
import { addTransactionRecord, getTransactionsByAddress, getTransactionByHash, getLatestTransactionRecords } from './client';

import { Network, Alchemy, NftTokenType } from 'alchemy-sdk';
import { transferEventTopics } from "./config/logEventTypes";
import retry from 'async-retry';
import type { NftContract } from 'alchemy-sdk';
import { transferIndexer } from './controllers/parseTx.js';

import type { TransactionRecord, TransactionData } from './types/types.js';
import { markets } from './config/markets';
import { getCurrentTimestamp } from "./utils/tests";



let nftContractsData: NftContract[] = [];
let chainCurrency: string = 'ETH';

/**	
  Phishers/scammers that steal NFTs eventually need to sell them.
  This bot should identify NFT traders.
  Scammers vs legitimate users can probably be distinguished by how quickly they 
  sell an NFT they obtained as well as how close/below of the floor price they are.
  At the moment the bot indexes all the NFTS that are traded on the following markets:
  - Opensea
  - Blur
  - LooksRare
  We want to save this information to the database.


*/

const calculateFloorPriceDiff = (avgItemPrice: number, floorPrice: number | null): string => {
  if (floorPrice === null || floorPrice === 0) {
    return "UNKNOWN";
  }

  const floorPriceDiff = ((avgItemPrice - floorPrice) / floorPrice) * 100;
  return `${floorPriceDiff >= 0 ? "+" : ""}${floorPriceDiff.toFixed(2)}%`;
};

function shortenAddress(address: string, digits = 4): string {
  if (!address) {
    throw new Error("Invalid address");
  }
  return `${address.slice(0, digits + 2)}...${address.slice(-digits)}`;
}

function compareKeysAndElements(obj: { [key: string]: boolean }, arr: string[]): boolean {
  const keySet = new Set(Object.keys(obj));

  for (const element of arr) {
    if (keySet.has(element)) {
      return true;
    }
  }

  return false;
}

const handleTransaction: HandleTransaction = async (
  txEvent: TransactionEvent,
  testAPI?: NftContract[]
) => {
  const provider = getEthersProvider();
  const chainId = (await provider.getNetwork()).chainId;
  const findings: Finding[] = [];

  let NFT_RELATED = false;
  for (const log of txEvent.logs) {
    if (transferEventTopics.ERC721 === log.topics[0] || transferEventTopics.ERC1155.includes(log.topics[0])) {
      NFT_RELATED = true;
      break;
    }
  }

  if (!compareKeysAndElements(txEvent.addresses, Object.keys(markets)) || txEvent.logs.length === 0 || !NFT_RELATED) {
    console.log(txEvent.hash, "is not agent related")
    return findings;
  }

  // get all the information for the contracts
  if (!testAPI) {
    if(chainId === 1) {
    nftContractsData = await getBatchContractData(Object.keys(txEvent.addresses));
    } else {
      console.log("Using on-chain data for chainId: ", chainId, "...")
      nftContractsData = await getBatchContractDataOnChain(Object.keys(txEvent.addresses));
      chainCurrency = chainId === 56 ? 'BNB' : chainId === 137 ? 'MATIC' : 'ETH';
    }
  } else {
    console.log("Test Data Loaded")
    nftContractsData = testAPI;
  }

  for (const info of nftContractsData) {
    try {


      if (Object.keys(info).length !== 0) {
        if (info.tokenType === 'ERC721' || info.tokenType === 'ERC1155') {
          console.log(`run indexer for ${info.name} ${info.address} ${txEvent.hash}`)
          const find: TransactionData | undefined = await transferIndexer(txEvent, info);
          if (!find) return findings;

          let record: TransactionRecord;
          let _avgItemPrice = find.totalPrice / Object.keys(find.tokens).length;
          let _floorPrice = find.contractData.openSea?.floorPrice || 0;
          record = {
            interactedMarket: find.interactedMarket.name,
            transactionHash: find.transactionHash,
            toAddr: (find.toAddr)?.toLowerCase(),
            fromAddr: (find.fromAddr)?.toLowerCase(),
            initiator: !testAPI ? txEvent.from : find.fromAddr,
            totalPrice: find.totalPrice,
            avgItemPrice: _avgItemPrice,
            contractAddress: find.contractAddress,
            floorPrice: _floorPrice,
            timestamp: !testAPI ? txEvent.timestamp : getCurrentTimestamp(),
            tokens: {},
            floorPriceDiff: calculateFloorPriceDiff(_avgItemPrice, _floorPrice)
          }

          //console.log(find.contractData.openSea)
          //console.log(find.interactedMarket.name)

          // iterate over the tokens of find
          for (const token of Object.keys(find.tokens)) {
            let _price = find.tokens[token].markets ?
              find.tokens[token].markets![find.interactedMarket.name].price
              : { value: "0", currency: { name: 'ERR', decimals: 0 } };

            if (find.tokens[token].markets![find.interactedMarket.name].price.value === "~") {
              _price = { value: "0", currency: { name: 'ETH', decimals: 18 } }
            }

            record.tokens[token] = {
              name: find.tokens[token].name ? find.tokens[token].name : info.name!,
              price: _price,
            }
          }

          console.log("[record status]", record ? "found" : "not found")
          //console.log(JSON.stringify(record, null, 4));

          await addTransactionRecord(db, record);
          let t: any = await getTransactionByHash(db, txEvent.hash);

          const tokenId = Object.keys(find.tokens)[0];

          let records: any = await getLatestTransactionRecords(db, find.contractAddress, tokenId);

          //console.log("----- Accesed record on db by hash ----- \n\n")
          //console.log(t)

          console.log("[record by id status]", records ? `found (${records.length})` : "err")
          let global_name = record.tokens[tokenId].name ? record.tokens[tokenId].name : record.contractAddress

          if (records.length > 1) {
            // compare the timestamp of the last two records and save the result in minutes
            // Calculate the time difference in minutes
            const timeDifferenceMinutes =
              ((records[0].transaction.timestamp - records[1].transaction.timestamp) / 60).toFixed(2);

            // Calculate the average item price difference
            const avgItemPriceDifference =
              records[0].transaction.avg_item_price - records[1].transaction.avg_item_price;

            // Calculate the profit/loss percentage
            const floorPriceDiffs = records.slice(0, 2).reduce((acc: any, record: any, index: number) => {
              const key = index === 0 ? 'current sale' : 'last sale';
              acc[key] = {
                timestamp: record.transaction.timestamp,
                floorPriceDiff: record.transaction.floor_price_diff,
                avgItemPrice: record.transaction.avg_item_price
              };
              return acc;
            }, {});

            // Check if the to_address of the oldest record matches the from_address of the newest record
            const addressMatch =
              records[0].transaction.from_address === records[1].transaction.to_address;
            //console.log("first record from_address", records[0].transaction.from_address)
            //console.log("first record to_address", records[0].transaction.to_address)
            //console.log("second record from_address", records[1].transaction.from_address)
            //console.log("second record to_address", records[1].transaction.to_address)

            console.log("----- addressMatch -----", addressMatch)
            if (addressMatch) {
              let lastSaleFloorPrice = extractNumericalValue(floorPriceDiffs['last sale'].floorPriceDiff);

              let find_description = `${global_name ? global_name : record.contractAddress} ${tokenId} sold to ${records[0].transaction.to_address} by ${records[1].transaction.to_address} in ${record.interactedMarket} at ${records[0].transaction.floor_price_diff} of floor after ${timeDifferenceMinutes} minutes`;
              let findType: FindingType = FindingType.Info;
              let find_name = `indexed-nft-sale`
              let floorDiffs = Math.abs(extractNumericalValue(floorPriceDiffs['current sale'].floorPriceDiff)) - Math.abs(lastSaleFloorPrice)

              let alert: Finding;
              let alertLabel: Label[] = [];
              let regularSaleExtra = `, for a value of ${(records[0].transaction.avg_item_price).toFixed(4)} ETH where the price floor is ${records[0].transaction.floor_price} ETH`;

              console.log("----- floorDiffs -----", floorDiffs, lastSaleFloorPrice)

              if (floorDiffs < 0) floorDiffs *= -1;
              if (floorDiffs > 85 && lastSaleFloorPrice <= -98) {
                let victim = records[1].transaction.from_address;
                let attacker = records[1].transaction.to_address;
                let profit = Math.abs(avgItemPriceDifference).toFixed(3);
                find_description = `${global_name} ${tokenId} sold to ${records[0].transaction.to_address} by ${records[1].transaction.to_address} possibly stolen from ${victim} in ${record.interactedMarket} at ${records[0].transaction.floor_price_diff} of floor after ${timeDifferenceMinutes} minutes for a profit of ${profit} ${chainCurrency}`;
                findType = FindingType.Exploit;
                find_name = `stolen-nft-sale`

                alertLabel.push({
                  entityType: EntityType.Address,
                  entity: `${tokenId},${record.contractAddress}`,
                  label: "stolen-nft",
                  confidence: 0.8,
                  remove: false,
                  metadata: {}
                })

                alertLabel.push({
                  entityType: EntityType.Address,
                  entity: `${victim}`,
                  label: "nft-phishing-victim",
                  confidence: 0.8,
                  remove: false,
                  metadata: {}
                })

                alertLabel.push({
                  entityType: EntityType.Address,
                  entity: `${attacker}`,
                  label: "nft-phishing-attacker",
                  confidence: 0.8,
                  remove: false,
                  metadata: {}
                })

                alertLabel.push({
                  entityType: EntityType.Transaction,
                  entity: `${records[1].transaction.transaction_hash}`,
                  label: "nft-phishing-attack-hash",
                  confidence: 0.8,
                  remove: false,
                  metadata: {}
                })

                alert = createCustomAlert(
                  record,
                  find_description + regularSaleExtra,
                  find_name,
                  findType,
                  FindingSeverity.High,
                  chainId,
                  floorPriceDiffs
                );

                alert.addresses.push(victim);
                alert.addresses.push(attacker);
              } else {
                alert = createCustomAlert(
                  record,
                  find_description + regularSaleExtra,
                  find_name,
                  findType,
                  FindingSeverity.Info,
                  chainId,
                  floorPriceDiffs
                );
                alertLabel.push({
                  entityType: EntityType.Address,
                  entity: `${tokenId},${record.contractAddress}`,
                  label: "indexed-nft-sale",
                  confidence: 0.9,
                  remove: false,
                  metadata: {}
                })
                alert.addresses.push(records[1].transaction.to_address);
                alert.addresses.push(records[0].transaction.to_address);
                alert.addresses.push(records[0].transaction.from_address);
              }
              alert.metadata.attackHash = records[1].transaction.transaction_hash;


              Object.keys(txEvent.addresses).forEach((address: string) => {
                alert.addresses.push(address);
              });

              for (const label of alertLabel) {
                alert.labels.push(label);
              }



              findings.push(alert);
            }
          } else {
            console.log("----- Only one record available -----")
            /*
              ONLY ONE RECORD AVAILABLE:
              + record is the tx that was just indexed
              + create alerts based on current data (no comparison)
              + ALERTS:
              + sold for more than 120% floor price
                + sold for less than -99% floor price or -100%
                + regular sales
            */

            // get the floor price change ie: -99% or 350%
            const numericalValue = extractNumericalValue(record.floorPriceDiff)
            if (record.tokens) {
              for (const tokenKey in record.tokens) {
                const token = record.tokens[tokenKey];
                const tokenName = token.name ? token.name : shortenAddress(record.contractAddress);
                let alert_description;
                let alert_name;
                let alert_type: FindingType = FindingType.Info;
                let alert_severity = FindingSeverity.Info;
                let alertLabel: Label[] = [];
                let floorMessage = record.floorPrice ? `with collection floor of ${record.floorPrice} ${chainCurrency}` : `(no floor price detected)`;
                let extraInfo = `at ${(record.avgItemPrice).toFixed(4)} ${chainCurrency} ${floorMessage}`
                //console.log("numericalValue: ", numericalValue)

                if (numericalValue >= 20) {
                  alert_name = `nft-sold-above-floor-price`;
                  alert_description = `${tokenName} ${tokenKey} sold for more than 110% of the floor price, ${extraInfo}`;
                  alertLabel.push({
                    entityType: EntityType.Address,
                    entity: `${tokenKey},${record.contractAddress}`,
                    label: "nft-sold-above-floor-price",
                    confidence: 0.9,
                    remove: false,
                    metadata: {}
                  })
                } else if (numericalValue >= -100 && numericalValue <= -98) {
                  alert_severity = FindingSeverity.Medium;
                  alert_type = FindingType.Suspicious;
                  alert_name = `nft-phishing-sale`;
                  alert_description = `${tokenName} ${tokenKey} sold for less than -99% of the floor price, ${extraInfo}`;
                  alertLabel.push({
                    entityType: EntityType.Address,
                    entity: `${record.fromAddr}`,
                    label: "nft-phishing-victim",
                    confidence: 0.8,
                    remove: false,
                    metadata: {}
                  })

                  alertLabel.push({
                    entityType: EntityType.Address,
                    entity: `${record.toAddr}`,
                    label: "nft-phishing-attacker",
                    confidence: 0.8,
                    remove: false,
                    metadata: {}
                  })

                  alertLabel.push({
                    entityType: EntityType.Address,
                    entity: `${tokenKey},${record.contractAddress}`,
                    label: "nft-phising-transfer",
                    confidence: 0.9,
                    remove: false,
                    metadata: {}
                  })


                } else {
                  /**
                   * ALL NEW REGULAR SALES GO HERE
                   */
                  //console.log(JSON.stringify(find.tokens[tokenKey] , null, 2))
                  let currencyType;
                  //let currencyType = find && tokenKey && find.tokens[tokenKey] ? find.tokens[tokenKey].markets!.price.currency.name : chainCurrency;
                  alert_name = `nft-sale`;
                  alert_description = `${tokenName} id ${tokenKey} sold at ${(record.avgItemPrice).toFixed(3)} ${currencyType || chainCurrency} ${floorMessage} (${record.floorPriceDiff})`;
                  alertLabel.push({
                    entityType: EntityType.Address,
                    entity: `${tokenKey},${record.contractAddress}`,
                    label: "nft-sale-record",
                    confidence: 0.9,
                    remove: false,
                    metadata: {}
                  })
                }

                let alert = createCustomAlert(
                  record,
                  alert_description,
                  alert_name,
                  alert_type,
                  alert_severity,
                  chainId
                );

                alert.addresses.push(record.fromAddr!);
                alert.addresses.push(record.toAddr!);
                alert.addresses.push(record.initiator!);

                for (const label of alertLabel) {
                  alert.labels.push(label);
                }

                Object.keys(txEvent.addresses).forEach((address: string) => {
                  alert.addresses.push(address);
                });
                findings.push(alert);
              }
            } else {
              console.log('record.tokens is undefined or null', txEvent.hash);
            }
          }
        }

      }
    }

    catch (e) {
      console.log(`Agent Error: ${e} in tx ${txEvent.hash}, contract ${info.address}`);
    }
  }

  return findings;
};

function extractNumericalValue(floorPriceDiff: string | undefined): number {
  if (!floorPriceDiff) {
    return 0;
  }

  const numericalValue = parseFloat(floorPriceDiff.replace('%', ''));
  return numericalValue;
}


const initialize: Initialize = async () => {

}

const getName = async (provider: ethers.providers.Provider, address: string): Promise<string> => {
  const erc721Contract = new ethers.Contract(address, ["function name() view returns (string)"], provider);
  const name = await erc721Contract.name();
  return name;
}


const getBatchContractDataOnChain = async (contractAddresses: string[]): Promise<NftContract[]> => {

  const ERC721_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function supportsInterface(bytes4) view returns (bool)"
  ];

  const ERC1155_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function supportsInterface(bytes4) view returns (bool)"
  ];

  const ERC721_INTERFACE_ID = '0x80ac58cd';
  const ERC1155_INTERFACE_ID = '0xd9b67a26';

  const provider = getEthersProvider();

  let data: NftContract[] = [];

  for (const address of contractAddresses) {

    const erc721Contract = new ethers.Contract(address, ERC721_ABI, provider);
    const erc1155Contract = new ethers.Contract(address, ERC1155_ABI, provider);

    let isErc721, isErc1155;

    try {
      isErc721 = await erc721Contract.supportsInterface(ERC721_INTERFACE_ID);
    } catch (error) {
      isErc721 = false;
    }

    try {
      isErc1155 = await erc1155Contract.supportsInterface(ERC1155_INTERFACE_ID);
    } catch (error) {
      isErc1155 = false;
    }

    if (isErc721) {
      const name = await erc721Contract.name();
      const symbol = await erc721Contract.symbol();
      data.push({
        name: name,
        symbol: symbol,
        tokenType: NftTokenType.ERC721,
        address: address
      })
    }

    if (isErc1155) {
      const name = await erc1155Contract.name();
      const symbol = await erc1155Contract.symbol();
      data.push({
        name: name,
        symbol: symbol,
        tokenType: NftTokenType.ERC1155,
        address: address
      })
    }

  }

  return data;

}

const getBatchContractData = async (contractAddresses: string[]): Promise<NftContract[]> => {
  // Alchemy sdk setup
  const settings = {
    apiKey: ALCHEMY_API_KEY,
    network: Network.ETH_MAINNET
  };

  const alchemy = new Alchemy(settings);
  //const provider = new ethers.providers.AlchemyProvider('homestead', ALCHEMY_API_KEY);

  const result = await retry(
    async () => {
      const response = await alchemy.nft.getContractMetadataBatch(contractAddresses);

      if (response === null) {
        console.log('Might hitting rate limit, try again', contractAddresses);
      }

      return response;
    },
    {
      retries: 5
    }
  );
  return result;
};

const handleAlert: HandleAlert = async (alertEvent: AlertEvent) => {
  const findings: Finding[] = [];
  // detect some alert condition
  return findings;
}

export default {
  initialize,
  handleTransaction,
  // handleBlock,
  //handleAlert
};
