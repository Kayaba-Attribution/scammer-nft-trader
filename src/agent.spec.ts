import {
    FindingType,
    FindingSeverity,
    Finding,
    HandleTransaction,
    createTransactionEvent,
    ethers,
} from "forta-agent";

import agent from "./agent";

import db from './db';
import { addTransactionRecord, getTransactionsByAddress, getTransactionByHash, getLatestTransactionRecords } from './client';

import type { MarketName } from "./types/types";

function getRandomTxHash() {
    const randomBytes = ethers.utils.randomBytes(32);
    const randomTxHash = ethers.utils.hexlify(randomBytes);
    return randomTxHash;
}

function getRandomAddress() {
    const bytes = ethers.utils.randomBytes(20);
    const randomAddress = ethers.utils.hexlify(ethers.utils.arrayify(bytes));
    return randomAddress;
}

function newRecord(fromAddr: string, toAddr: string, initiator: string,
     contractAddress: string, ) {
    const record = {
        interactedMarket: 'opensea' as MarketName,
        transactionHash: getRandomTxHash(),
        toAddr: toAddr,
        fromAddr: fromAddr,
        initiator: initiator,
        totalPrice: 1,
        avgItemPrice: 1,
        contractAddress: contractAddress,
        floorPrice: 1,
        timestamp: 1234567,
        tokens: {},
        floorPriceDiff: '0',
    }

    return record;
}

describe("NFT trader test", () => {
    let handleTransaction: HandleTransaction;
    const mockTxEvent = createTransactionEvent({} as any);

    let bob: string;
    let alice: string;
    let jack: string;
    let ca: string;

    beforeAll(() => {
        handleTransaction = agent.handleTransaction;
        bob = getRandomAddress();
        alice = getRandomAddress();
        jack = getRandomAddress();
        ca = getRandomAddress();
    });

    
    describe("Records db check", () => {
        it("adds a new record", async () => {
            const record1 = newRecord(
                bob,
                alice,
                jack,
                ca
            );
            await addTransactionRecord(db, record1);
        });
        
    });
});
