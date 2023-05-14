import _ from 'lodash';

// modules
import {
    Finding,
    FindingSeverity,
    FindingType,
    TransactionEvent,
    EntityType,
} from "forta-agent";
import { ethers } from 'ethers';
import Web3EthAbi from 'web3-eth-abi';



// config
import { markets, currencies } from '../config/markets';
import { saleEventTopics, cancelEventTypes } from '../config/logEventTypes';
import { initializeTransactionData } from '../config/initialize';


import ABI from '../abi/ABI.json';
// parsers
import { parseSeaport } from './parseSeaport';
import { parseLooksRare } from './parseLooksRare';
import { parseBlur } from './parseBlur';
//import { parseSaleToken } from './parseSaleToken.js';

// api
import { NftContract } from 'alchemy-sdk';

async function transferIndexer(
    txEvent: TransactionEvent,
    contractData: NftContract
) {

    //console.log("transferIndexer Running...")
    const contractAddress: string = contractData.address!;
    const transactionHash: string = txEvent.transaction.hash;

    let recipient: string = txEvent.to ? txEvent.to : '';

    if (!(recipient.toLowerCase() in markets)) {
        console.log(`\n No market found for recipient ${recipient}\n`);
        return;
    }
    const tx = initializeTransactionData(transactionHash, contractData, recipient, contractAddress);

    //const isSudoswap = tx.interactedMarket.name === 'sudoswap';
    const iface = new ethers.Interface(ABI);

    for (const log of txEvent.logs) {
        const logAddress = log.address.toLowerCase();
        const market = markets[logAddress];
        if (logAddress in currencies) {
            tx.currency = currencies[logAddress as keyof typeof currencies];
        }

        if (
            market?.name === 'opensea' &&
            market?.topics.includes(log.topics[0])
        ) {
            parseSeaport(tx, log, market, iface);
        } else if (
            market?.name === 'looksrare' &&
            market?.topics.includes(log.topics[0])
        ) {
            parseLooksRare(tx, log, market, iface);
        } else if (
            market?.name === 'blur' &&
            market?.topics.includes(log.topics[0])
        ) {
            parseBlur(tx, log, market, iface);
        } 
    }

    return tx
};

export { transferIndexer };
