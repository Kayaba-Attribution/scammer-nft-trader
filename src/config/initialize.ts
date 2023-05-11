import { markets } from './markets.js';
import type { BatchContractInfo, TransactionData } from '../types';
import { NftContract } from 'alchemy-sdk';

export const initializeTransactionData = (
    transactionHash: string,
    contractData: NftContract,
    recipient: string,
    contractAddress: string
) => {
    const isAggregator = ['gem', 'genie', 'blurswap'].includes(
        markets[recipient].name
    );
    let tx: TransactionData;
    //console.log("initializeTransactionData running...")
    try {
        tx = {
            interactedMarket: markets[recipient],
            isAggregator: isAggregator,
            tokens: {},
            totalPrice: 0,
            totalAmount: 0,
            contractData: contractData,
            currency: { name: 'ETH', decimals: 18 },
            contractAddress: contractAddress,
            transactionHash: transactionHash
        };
    } catch (error) {
        console.log("initializeTransactionData", error, transactionHash)
    }


    return tx!;
};