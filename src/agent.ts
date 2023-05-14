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
  Label
} from "forta-agent";

import { createCustomAlert } from "./utils/alerts";
import db, { ALCHEMY_API_KEY } from './db';
import { addTransactionRecord, getTransactionsByAddress, getTransactionByHash, getLatestTransactionRecords } from './client';

import { Network, Alchemy } from 'alchemy-sdk';
import { transferEventTopics } from "./config/logEventTypes";
import retry from 'async-retry';
import type { NftContract } from 'alchemy-sdk';
import { transferIndexer } from './controllers/parseTx.js';

import type { TransactionRecord, TransactionData } from './types/types.js';
import { markets } from './config/markets';



let nftContractsData: NftContract[] = [];

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
  txEvent: TransactionEvent
) => {
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
  nftContractsData = await getBatchContractData(Object.keys(txEvent.addresses));

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
            toAddr: find.toAddr,
            fromAddr: find.fromAddr,
            initiator: txEvent.from,
            totalPrice: find.totalPrice,
            avgItemPrice: _avgItemPrice,
            contractAddress: find.contractAddress,
            floorPrice: _floorPrice,
            timestamp: txEvent.timestamp,
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
              name: find.tokens[token].name,
              price: _price,
            }
          }

          console.log("----- record -----")
          console.log(JSON.stringify(record, null, 4));

          await addTransactionRecord(db, record);
          let t: any = await getTransactionByHash(db, txEvent.hash);

          const tokenId = Object.keys(find.tokens)[0];

          let records: any = await getLatestTransactionRecords(db, find.contractAddress, tokenId);

          //console.log("----- Accesed record on db by hash ----- \n\n")
          //console.log(t)

          console.log("----- Accesed records on db by contract and tokenId (more recent 2) -----")
          //console.log(records)
          let global_name = record.tokens[tokenId].name ? record.tokens[tokenId].name : record.contractAddress

          if (records.length > 1) {
            // compare the timestamp of the last two records and save the result in minutes
            // Calculate the time difference in minutes
            const timeDifferenceMinutes =
              (records[0].transaction.timestamp - records[1].transaction.timestamp) / 60;

            // Calculate the average item price difference
            const avgItemPriceDifference =
              records[0].transaction.avg_item_price - records[1].transaction.avg_item_price;

            // Calculate the profit/loss percentage
            const floorPriceDiffs = records.map((record: any) => ({
              timestamp: record.transaction.timestamp,
              floorPriceDiff: record.transaction.floor_price_diff,
              avgItemPrice: record.transaction.avg_item_price
            }));

            // Check if the to_address of the oldest record matches the from_address of the newest record
            const addressMatch =
              records[1].transaction.to_address === records[0].transaction.from_address;

            //console.log("Time difference (minutes):", timeDifferenceMinutes);
            //console.log("Average item price difference:", avgItemPriceDifference);
            //console.log("floor price differences:", floorPriceDiffs);
            //console.log("Address match:", addressMatch);
            if (addressMatch) {

              let find_description = `${global_name ? global_name : record.contractAddress} ${tokenId} sold to ${records[0].transaction.to_address} by ${records[1].transaction.to_address} in ${record.interactedMarket} at ${records[0].transaction.floor_price_diff} of floor after ${timeDifferenceMinutes} minutes`;
              let findType: FindingType = FindingType.Info;
              let find_name = `indexed-nft-sale`
              let floorDiffs = Math.abs(extractNumericalValue(floorPriceDiffs[1].floorPriceDiff)) - Math.abs(extractNumericalValue(floorPriceDiffs[0].floorPriceDiff))


              let alert: Finding;
              let alertLabel: Label[] = [];

              if (floorDiffs > 98) {
                let victim = records[1].transaction.from_address;
                let attacker = records[1].transaction.to_address;
                let profit = avgItemPriceDifference;
                find_description = `${global_name} ${tokenId} sold to ${records[0].transaction.to_address} by ${records[1].transaction.to_address} possibly stolen from ${victim} in ${record.interactedMarket} at ${records[0].transaction.floor_price_diff} of floor after ${timeDifferenceMinutes} minutes for a profit of ${profit}`;
                findType = FindingType.Exploit;
                find_name = `nft-phishing-sale`

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

                alert = createCustomAlert(
                  record,
                  find_description,
                  find_name,
                  findType,
                  floorPriceDiffs
                );

                alert.addresses.push(victim);
                alert.addresses.push(attacker);
              } else {
                alert = createCustomAlert(
                  record,
                  find_description,
                  find_name,
                  findType,
                  floorPriceDiffs
                );
              }
              alert.metadata.attackHash = records[0].transaction.transaction_hash;


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
            // get the floor price change ie: -99% or 350%
            const numericalValue = extractNumericalValue(record.floorPriceDiff)
            if (record.tokens) {
              for (const tokenKey in record.tokens) {
                const token = record.tokens[tokenKey];
                const tokenName = token.name ? token.name : record.contractAddress;
                let alert_description;
                let alert_name;
                let alertLabel: Label[] = [];

                if (numericalValue > 110) {
                  alert_name = `nft-sold-above-floor-price`;
                  alert_description = `${tokenName} ${tokenKey} sold for more than 110% of the floor price`;
                } else if (numericalValue < -99) {
                  alert_name = `nft-possible-phishing-transfer`;
                  alert_description = `${tokenName} ${tokenKey} sold for less than -99% of the floor price`;
                  alertLabel.push({
                    entityType: EntityType.Address,
                    entity: `${record.fromAddr}`,
                    label: "nft-possible-phishing-victim",
                    confidence: 0.8,
                    remove: false,
                    metadata: {}
                  })

                  alertLabel.push({
                    entityType: EntityType.Address,
                    entity: `${record.toAddr}`,
                    label: "nft-possible-phishing-attacker",
                    confidence: 0.8,
                    remove: false,
                    metadata: {}
                  })

                  alertLabel.push({
                    entityType: EntityType.Address,
                    entity: `${tokenKey},${record.contractAddress}`,
                    label: "nft-possible-phising-transfer",
                    confidence: 0.9,
                    remove: false,
                    metadata: {}
                  })


                } else {
                  alert_name = `indexed-nft-sale`;
                  alert_description = `${tokenName} id ${tokenKey} sold at ${(record.avgItemPrice).toFixed(3)} (no floor price detected)`;
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
                  FindingType.Suspicious
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

const getBatchContractData = async (contractAddresses: string[]): Promise<NftContract[]> => {
  // Alchemy sdk setup
  const settings = {
    apiKey: ALCHEMY_API_KEY,
    network: Network.ETH_MAINNET
  };

  const alchemy = new Alchemy(settings);
  const provider = new ethers.providers.AlchemyProvider('homestead', ALCHEMY_API_KEY);

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
  //console.log(result)
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
