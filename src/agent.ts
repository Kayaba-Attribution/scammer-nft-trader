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
  getEthersProvider,
  getChainId,
  Log
} from "forta-agent";

import { Network as fortaNetwork } from "forta-agent";

import { createCustomAlert } from "./utils/alerts";
import db, {
  ALCHEMY_API_KEY,
  ALCHEMY_API_KEY_POLY,
  ALCHEMY_API_KEY_OPT,
  ALCHEMY_API_KEY_ARB

} from './db';
import {
  addTransactionRecord,
  getOpenSeaFloorPrice,
  getTransactionByHash,
  getLatestTransactionRecords,
  getNativeTokenPrice,
  getErc20TokenPrice,
} from './client';

import { Network, Alchemy, NftTokenType } from 'alchemy-sdk';
import { transferEventTopics } from "./config/logEventTypes";
import retry from 'async-retry';
import type { NftContract } from 'alchemy-sdk';
import { transferIndexer } from './controllers/parseTx.js';

import type { TransactionRecord, TransactionData, TokenInfo } from './types/types.js';
import { markets, currencies } from './config/markets';
import { getCurrentTimestamp } from "./utils/tests";
import { forEach, round, set } from "lodash";
import { AbiCoder } from "ethers";



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


async function extractTransferInfo(log: Log, network: fortaNetwork): Promise<{ usdPrice:number, value: string, name: string, decimals: number } | null> {
  const { address, topics, data } = log;

  if (currencies.hasOwnProperty(address)) {
    return null;
  }

  const defaultAbiCoder = new ethers.utils.AbiCoder();
  const sender = defaultAbiCoder.decode(["address"], topics[1]);
  const receiver = defaultAbiCoder.decode(["address"], topics[2]);
  let decimalData = parseInt(data, 16);

  const ERC20_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
  ];

  const provider = getEthersProvider();

  const erc20Contract = new ethers.Contract(address, ERC20_ABI, provider);

  if (decimalData && sender && receiver) {
    //const name: string = await erc20Contract.name();
    const symbol: string = await erc20Contract.symbol();
    const decimals = await erc20Contract.decimals();
    decimalData = decimalData / 10 ** decimals;

    let usdPrice = await getErc20TokenPrice(network, address) ?? 0;
    console.log(`token: ${symbol} usd price: ${usdPrice}`)

    const transferInfo = {
      usdPrice: usdPrice,
      value: String(decimalData),
      name: symbol,
      decimals: decimals,
    };

    return transferInfo;
  }

  return null;
}


const handleTransaction: HandleTransaction = async (
  txEvent: TransactionEvent,
  testAPI?: NftContract[]
) => {
  const network = txEvent.network;
  console.log("network", network)
  const nativeTokenPrice = await getNativeTokenPrice(network);
  console.log("nativeTokenPrice", nativeTokenPrice)

  const provider = getEthersProvider();
  const chainId = (await provider.getNetwork()).chainId;
  const findings: Finding[] = [];
  const extraERC20: { usdPrice:number, value: string, name: string, decimals: number }[] = [];
  let currencyType;

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

  for (const log of txEvent.logs) {
    if (log.topics.includes(transferEventTopics.ERC20)) {
      let res = await extractTransferInfo(log, network)
      if (res) extraERC20.push(res)
    }
  }


  const alchemySupportedChains = new Set<number>([1, 137, 42161]);
  // get all the information for the contracts
  if (!testAPI) {
    if (alchemySupportedChains.has(chainId)) {
      nftContractsData = await getBatchContractData(Object.keys(txEvent.addresses), chainId);
    } else {
      console.log("Using on-chain data for chainId: ", chainId, "...")
      nftContractsData = await getBatchContractDataOnChain(Object.keys(txEvent.addresses));
    }
    chainCurrency = chainId === 56 ? 'BNB' : chainId === 137 ? 'MATIC' : 'ETH';
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
          let directFloorPrice = await getOpenSeaFloorPrice(find.contractAddress)
          // if direct floor price is not null compare against _floorPrice and set _floorPrice to the min of the two
          if (directFloorPrice !== null) {
            _floorPrice = _floorPrice == 0 ? directFloorPrice : Math.min(_floorPrice, directFloorPrice)
          }
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

          console.log("extraERC20", JSON.stringify(extraERC20))

          const sumValues: { [name: string]: number } = {};

          const key = Object.keys(record.tokens)[0];
          let nativeERC20value: number = 0;
          let ercToNativeMSG: string = ``;

          // ASUME ONLY ONE ERC20 TOKEN
          if (extraERC20.length > 0) {
            const tokenName = extraERC20[0].name;

            for (const extraToken of extraERC20) {
              const value = Number(extraToken.value);

              if (tokenName in sumValues) {
                sumValues[tokenName] += value;
              } else {
                sumValues[tokenName] = value;
              }
            }

            record.tokens[key].price = {
              value: String(sumValues[tokenName]),
              currency: {
                name: tokenName,
                decimals: extraERC20[0].decimals,
              }
            };

            currencyType = tokenName;
            if (record.avgItemPrice == 0) {
              //console.log(JSON.stringify(record.tokens))
              let avgItemPriceSum: number = 0;
              for (const key in record.tokens) {
                if (Object.prototype.hasOwnProperty.call(record.tokens, key)) {
                  const tokenInfo: TokenInfo = record.tokens[key];
                  avgItemPriceSum += Number(tokenInfo.price.value);
                }
              }
              record.avgItemPrice = Number((avgItemPriceSum / Object.keys(record.tokens).length).toFixed(2))
              record.totalPrice = avgItemPriceSum;

              record.avgItemPrice = round(record.avgItemPrice, 2);
              record.totalPrice = round(record.totalPrice, 2);
            }

            if(nativeTokenPrice){
              nativeERC20value = Number(truncateDecimal(Number(sumValues[tokenName]) * Number(extraERC20[0].usdPrice) / nativeTokenPrice));
              console.log(`1 ${chainCurrency} = ${nativeTokenPrice} | 1 ${tokenName} => ${extraERC20[0].usdPrice} | ${sumValues[tokenName]} ${tokenName} = ${nativeERC20value} ${chainCurrency}`)
              ercToNativeMSG = `(~${nativeERC20value} ${chainCurrency})`
              record.avgItemPrice = nativeERC20value;
              record.totalPrice = nativeERC20value;
            }
            console.log(ercToNativeMSG)
          }

          console.log("[record status]", record ? "found" : "not found")
          console.log(JSON.stringify(record, null, 4));

          await addTransactionRecord(db, record);
          let t: any = await getTransactionByHash(db, txEvent.hash);

          const tokenId = Object.keys(find.tokens)[0];

          let records: any = await getLatestTransactionRecords(db, find.contractAddress, tokenId);

          //console.log("----- Accesed record on db by hash ----- \n\n")

          console.log("[record by id status]", records ? `found (${records.length})` : "err")
          let global_name = record.tokens[tokenId]?.name ?? record.contractAddress;


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
                let floorMessage = record.floorPrice ? `with collection floor of ${record.floorPrice.toFixed(4)} ${chainCurrency}` : `(no floor price detected)`;
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
                  //let currencyType = find && tokenKey && find.tokens[tokenKey] ? find.tokens[tokenKey].markets!.price.currency.name : chainCurrency;
                  alert_name = `nft-sale`;
                  let customValue = `${nativeERC20value != 0 ? sumValues[extraERC20[0].name] : truncateDecimal((record.avgItemPrice))}`
                  alert_description = `${tokenName} id ${tokenKey} sold at ${customValue} ${currencyType || chainCurrency} ${ercToNativeMSG ? ercToNativeMSG: ''} ${floorMessage} (${record.floorPriceDiff})`;
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


function truncateDecimal(number: number): string {
  const decimalString = number.toFixed(20); // Convert number to a string with up to 20 decimals

  // Find the index of the last non-zero digit
  let lastIndex = decimalString.length - 1;
  while (lastIndex >= 0 && decimalString[lastIndex] === '0') {
    lastIndex--;
  }

  // Check if the last non-zero digit is a decimal point
  const isDecimalPoint = decimalString[lastIndex] === '.';
  
  // Check if there are any trailing zeros after the last non-zero digit
  const hasTrailingZeros = lastIndex < decimalString.length - 1 && !isDecimalPoint;

  // Determine the number of decimals to keep based on the presence of trailing zeros
  const numDecimals = hasTrailingZeros ? 2 : 3;

  return number.toFixed(numDecimals);
}

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

const getBatchContractData = async (contractAddresses: string[], chainId?: number): Promise<NftContract[]> => {
  // Alchemy sdk setup
  let settings = {
    apiKey: '',
    network: Network.ETH_MAINNET
  };

  switch (chainId) {
    case 10:
      settings.apiKey = ALCHEMY_API_KEY_OPT;
      settings.network = Network.OPT_MAINNET;
      break;
    case 137:
      settings.apiKey = ALCHEMY_API_KEY_POLY;
      settings.network = Network.MATIC_MAINNET;
      break;
    case 42161:
      settings.apiKey = ALCHEMY_API_KEY_ARB;
      settings.network = Network.ARB_MAINNET;
      break;
    default:
      settings.apiKey = ALCHEMY_API_KEY;
      settings.network = Network.ETH_MAINNET;
      break;
  }

  const alchemy = new Alchemy(settings);

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
