import { TransactionRecord, TokenInfo, MarketName } from './types/types.js';
import { Database } from 'sqlite3';
import retry from 'async-retry';
import axios from 'axios';
import { LRUCache } from 'lru-cache';
import { Network } from 'forta-agent';

// it helps not to make a lot of requests for the same token
interface CoinPriceResponse {
    coins: {
      [key: string]: {
        decimals: number;
        symbol: string;
        price: number;
        timestamp: number;
        confidence: number;
      };
    };
  }
  
  const coinPriceCache = new LRUCache({
    max: 300, // addresses
    ttl: 60 * 60 * 1000, // 60 min
    fetchMethod: async (key: string) => {
      const [coinKey, timestamp] = key.split('/');
      const url = timestamp
        ? `https://coins.llama.fi/prices/historical/${timestamp}`
        : 'https://coins.llama.fi/prices/current';
       console.log(`${url}/${coinKey}`);
      const res = await fetch(`${url}/${coinKey}`);
      const data = await res.json() as CoinPriceResponse;
  
      const price = data.coins[coinKey]?.price;
      if (price == null) {
        console.log('Unknown token price', coinKey);
      }
      return price;
    },
  });
  

export async function getNativeTokenPrice(
    network: Network,
    timestamp?: number,
  ): Promise<number | undefined> {
    // https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc
    const keys: { [chain: number]: string } = {
      [Network.MAINNET]: 'coingecko:ethereum',
      [Network.BSC]: 'coingecko:binancecoin',
      [Network.POLYGON]: 'coingecko:matic-network',
      [Network.ARBITRUM]: 'coingecko:ethereum', // arbitrum doesn't have a native token
      [Network.FANTOM]: 'coingecko:fantom',
      [Network.AVALANCHE]: 'coingecko:avalanche-2',
      [Network.OPTIMISM]: 'coingecko:ethereum', // optimism doesn't have a native token
    };
  
    if (!keys[network]) throw new Error('Not implemented yet: ' + Network[network]);
  
    try {
      const coinKey = [keys[network], timestamp].filter((v) => v).join('/');
      const price = await coinPriceCache.fetch(coinKey);
      if (price !== undefined) {
        return price;
      } else {
        console.log('Price not found for coinKey', coinKey);
        return undefined;
      }
    } catch (e) {
      console.log(e);
    }
  }

export async function getErc20TokenPrice(
    network: Network,
    address: string,
    timestamp?: number,
  ): Promise<number | undefined> {
    const chainKeysByNetwork: { [x: number]: string } = {
      [Network.MAINNET]: 'ethereum',
      [Network.BSC]: 'bsc',
      [Network.POLYGON]: 'polygon',
      [Network.ARBITRUM]: 'arbitrum',
      [Network.FANTOM]: 'fantom',
      [Network.AVALANCHE]: 'avax',
      [Network.OPTIMISM]: 'optimism',
    };
  
    if (!chainKeysByNetwork[network]) throw new Error('Not implemented yet: ' + Network[network]);
  
    try {
      const coinKey = [`${chainKeysByNetwork[network]}:${address}`, timestamp]
        .filter((v) => v)
        .join('/');
  
      const price = await coinPriceCache.fetch(coinKey);
      if (price !== undefined) {
        return price;
      } else {
        console.log('Price not found for coinKey', coinKey);
        return undefined;
      }
    } catch (e) {
      console.log(e);
    }
  }

export async function getOpenSeaFloorPrice(contractAddress: string): Promise<number | null> {
    let slug: string = '';
    const slugUrl = `https://api.opensea.io/api/v1/asset_contract/${contractAddress}`;
    const apiKey = '9a3186c6c9444ca7884ee18b58a5c16f';

    const result = await retry(
        async () => {
            const response = await axios.get(slugUrl, {
                headers: {
                    'X-API-KEY': apiKey,
                },
            });

            if (!response.data) {
                console.log('Might be hitting the rate limit, try again', contractAddress);
                throw new Error('Request failed');
            }

            return response.data;
        },
        {
            retries: 5,
        }
    );

    if (result.collection == null) return null;
    if (!result.collection.slug) return null;

    slug = result.collection.slug;
    const floorPriceUrl = `https://api.opensea.io/api/v1/collection/${slug}/stats`;
    const floorResult = await retry(
        async () => {
            const response = await axios.get(floorPriceUrl, {
                headers: {
                    'X-API-KEY': apiKey,
                },
            });

            if (!response.data) {
                console.log('Might be hitting the rate limit, try again', contractAddress);
                throw new Error('Request failed');
            }

            return response.data;
        },
        {
            retries: 5,
        }
    );

    console.log("OpenSea Direct Floor Price:", slug, floorResult.stats.floor_price);
    let floorPrice = floorResult.stats.floor_price;
    if (!floorPrice) return null;
    return floorPrice;
}


export const addTransactionRecord = (db: Database, record: TransactionRecord): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        db.serialize(() => {
            db.run(`BEGIN TRANSACTION;`);

            // Insert the transaction
            db.run(
                `INSERT INTO transactions (interacted_market, transaction_hash, to_address, from_address, initiator, total_price, avg_item_price, contract_address, floor_price, timestamp, floor_price_diff)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    record.interactedMarket,
                    record.transactionHash,
                    record.toAddr,
                    record.fromAddr,
                    record.initiator,
                    record.totalPrice,
                    record.avgItemPrice,
                    record.contractAddress,
                    record.floorPrice,
                    record.timestamp,
                    record.floorPriceDiff
                ],
                (err) => {
                    if (err) {
                        console.log('Error inserting transaction:', record.transactionHash, err.message)
                        db.run(`ROLLBACK;`);
                        reject(err);
                        return;
                    }

                    // Update user transaction count for the initiator
                    db.run(
                        `UPDATE users SET tx_count = tx_count + 1 WHERE address = ?`,
                        [record.initiator],
                        (err) => {
                            if (err) {
                                console.log('Error updating user tx_count:', record.initiator, err.message);
                                db.run(`ROLLBACK;`);
                                reject(err);
                                return;
                            }

                            // Insert tokens
                            const tokenInsertPromises = Object.entries(record.tokens).map(([tokenId, tokenInfo]) => {
                                return new Promise((resolveToken, rejectToken) => {
                                    db.run(
                                        `INSERT INTO nfts (transaction_hash, token_id, name, price_value, price_currency_name, price_currency_decimals, contract_address)
                                        VALUES (?, ?, ?, ?, ?, ?, ?)`,
                                        [
                                            record.transactionHash,
                                            tokenId,
                                            tokenInfo.name,
                                            tokenInfo.price.value,
                                            tokenInfo.price.currency.name,
                                            tokenInfo.price.currency.decimals,
                                            record.contractAddress,
                                        ],
                                        (err) => {
                                            if (err) {
                                                rejectToken(err);
                                            } else {
                                                resolveToken(undefined);
                                            }
                                        }
                                    );
                                });
                            });

                            Promise.all(tokenInsertPromises)
                                .then(() => {
                                    db.run(`COMMIT;`);
                                    console.log('COMMIT transaction record:', record.transactionHash);
                                    resolve();
                                })
                                .catch((err) => {
                                    db.run(`ROLLBACK;`);
                                    reject(err);
                                });
                        }
                    );
                }
            );
        });
    });
};



interface TransactionRow {
    interacted_market: string;
    transaction_hash: string;
    to_address: string;
    from_address: string;
    initiator: string;
    total_price: number;
    avg_item_price: number;
    contract_address: string;
    floor_price: number;
    timestamp: number;
    floor_price_diff: string;
}

interface TokenRow {
    transaction_hash: string;
    token_id: string;
    name: string;
    price_value: string;
    price_currency_name: string;
    price_currency_decimals: number;
}

export const getTransactionByHash = async (
    db: Database,
    transactionHash: string
): Promise<TransactionRecord | null> => {
    return new Promise((resolve, reject) => {
        db.get(
            `
        SELECT *
        FROM transactions
        WHERE transaction_hash = ?
        `,
            [transactionHash],
            (err, row: TransactionRow | undefined) => {
                if (err) {
                    reject(err.message);
                } else if (row) {
                    db.all(
                        `
              SELECT *
              FROM nfts
              WHERE transaction_hash = ?
              `,
                        [transactionHash],
                        (err, tokenRows: TokenRow[] | undefined) => {
                            if (err) {
                                reject(err.message);
                            } else {
                                const tokens: { [key: string]: TokenInfo } = {};

                                tokenRows!.forEach((tokenRow) => {
                                    tokens[tokenRow.token_id] = {
                                        name: tokenRow.name,
                                        price: {
                                            value: tokenRow.price_value,
                                            currency: {
                                                name: tokenRow.price_currency_name,
                                                decimals: tokenRow.price_currency_decimals,
                                            },
                                        },
                                    };
                                });

                                const record: TransactionRecord = {
                                    interactedMarket: row.interacted_market as MarketName,
                                    transactionHash: row.transaction_hash,
                                    toAddr: row.to_address,
                                    fromAddr: row.from_address,
                                    initiator: row.initiator,
                                    totalPrice: row.total_price,
                                    avgItemPrice: row.avg_item_price,
                                    contractAddress: row.contract_address,
                                    floorPrice: row.floor_price,
                                    tokens: tokens,
                                    timestamp: row.timestamp,
                                    floorPriceDiff: row.floor_price_diff,
                                };

                                resolve(record);
                            }
                        }
                    );
                } else {
                    resolve(null);
                }
            }
        );
    });
};


export async function getLatestTransactionRecords(
    db: Database,
    contractAddress: string,
    tokenId: string
): Promise<Array<{ transaction: TransactionRow; token: TokenRow }>> {
    return new Promise((resolve, reject) => {
        db.all(
            `
        SELECT t.*, n.*
        FROM transactions t
        JOIN nfts n ON t.transaction_hash = n.transaction_hash
        WHERE n.contract_address = ? AND n.token_id = ?
        ORDER BY t.timestamp DESC
        LIMIT 2
        `,
            [contractAddress, tokenId],
            (err, rows: any[]) => {
                if (err) {
                    reject(err.message);
                } else {
                    const results: Array<{ transaction: TransactionRow; token: TokenRow }> = [];

                    for (const row of rows) {
                        const transaction: TransactionRow = {
                            interacted_market: row.interacted_market,
                            transaction_hash: row.transaction_hash,
                            to_address: row.to_address,
                            from_address: row.from_address,
                            initiator: row.initiator,
                            total_price: row.total_price,
                            avg_item_price: row.avg_item_price,
                            contract_address: row.contract_address,
                            floor_price: row.floor_price,
                            timestamp: row.timestamp,
                            floor_price_diff: row.floor_price_diff,
                        };

                        const token: TokenRow = {
                            transaction_hash: row.transaction_hash,
                            token_id: row.token_id,
                            name: row.name,
                            price_value: row.price_value,
                            price_currency_name: row.price_currency_name,
                            price_currency_decimals: row.price_currency_decimals,
                        };

                        results.push({ transaction, token });
                    }

                    resolve(results);
                }
            }
        );
    });
}


export const getTransactionsByAddress = (db: Database, address: string): Promise<TransactionRecord[]> => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT * FROM transactions WHERE to_address = ? OR from_address = ?`,
            [address, address],
            (err, rows: TransactionRow[]) => {
                if (err) {
                    reject(err);
                } else {
                    const transactions: TransactionRecord[] = rows.map((row: TransactionRow) => ({
                        interactedMarket: row.interacted_market as MarketName,
                        transactionHash: row.transaction_hash,
                        toAddr: row.to_address,
                        fromAddr: row.from_address,
                        initiator: row.initiator,
                        totalPrice: row.total_price,
                        avgItemPrice: row.avg_item_price,
                        contractAddress: row.contract_address,
                        floorPrice: row.floor_price,
                        timestamp: row.timestamp,
                        tokens: {} // Placeholder for tokens, to be filled in the next step
                    }));

                    // Fetch the associated tokens for each transaction
                    const fetchTokensPromises = transactions.map((transaction) => {
                        return new Promise((resolveTokens, rejectTokens) => {
                            db.all(
                                `SELECT * FROM nfts WHERE transaction_hash = ?`,
                                transaction.transactionHash,
                                (err, tokenRows: TokenRow[]) => {
                                    if (err) {
                                        rejectTokens(err);
                                    } else {
                                        const tokens: { [key: string]: TokenInfo } = {};

                                        tokenRows.forEach((tokenRow: TokenRow) => {
                                            tokens[tokenRow.token_id] = {
                                                name: tokenRow.name,
                                                price: {
                                                    value: tokenRow.price_value,
                                                    currency: {
                                                        name: tokenRow.price_currency_name,
                                                        decimals: tokenRow.price_currency_decimals
                                                    }
                                                }
                                            };
                                        });

                                        transaction.tokens = tokens;
                                        resolveTokens(undefined);
                                    }
                                }
                            );
                        });
                    });

                    Promise.all(fetchTokensPromises)
                        .then(() => resolve(transactions))
                        .catch((err) => reject(err));
                }
            }
        );
    });
};