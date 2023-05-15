import {
    FindingType,
    FindingSeverity,
    Finding,
    createTransactionEvent,
    TransactionEvent,
    ethers
} from "forta-agent";


import db from './db';
import agent from "./agent";

import { getRandomAddress, getRandomTxHash, createBatchContractInfo } from './utils/tests';
import { addTransactionRecord, getTransactionByHash, getLatestTransactionRecords } from './client';
import type { MarketName, TransactionRecord } from "./types/types";
import type { NftContract } from 'alchemy-sdk';


function newRecord(
    fromAddr: string,
    toAddr: string,
    initiator: string,
    contractAddress: string,
    hash: string
) {
    const record: TransactionRecord = {
        interactedMarket: 'opensea' as MarketName,
        transactionHash: hash,
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

type HandleTransaction = (txEvent: TransactionEvent, test?: NftContract[]) => Promise<Finding[]>;

jest.setTimeout(10000);
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

    describe("Transaction records", () => {

        it("adds a new record", async () => {
            const txOneHash = getRandomTxHash();
            const record1 = newRecord(bob, alice, bob, ca, txOneHash);
            await addTransactionRecord(db, record1);
    
            const recordFromHash = await getTransactionByHash(db, txOneHash);
    
            expect(recordFromHash).toEqual(record1);
        });
    
        it("adds multiple records", async () => {
            const txOneHash = getRandomTxHash();
            const record1 = newRecord(bob, alice, bob, ca, txOneHash);
            await addTransactionRecord(db, record1);
    
            const txTwoHash = getRandomTxHash();
            const record2 = newRecord(bob, alice, bob, ca, txTwoHash);
            await addTransactionRecord(db, record2);
    
            const recordFromHash1 = await getTransactionByHash(db, txOneHash);
            const recordFromHash2 = await getTransactionByHash(db, txTwoHash);
    
            expect(recordFromHash1).toEqual(record1);
            expect(recordFromHash2).toEqual(record2);
        });
    
        it("throws an error when adding a record with duplicate hash", async () => {
            expect.assertions(1);
            const ca2 = getRandomAddress();
            const txOneHash = getRandomTxHash();
            const record1 = newRecord(bob, alice, bob, ca, txOneHash);
            await addTransactionRecord(db, record1);
    
            const record2 = newRecord(alice, bob, alice, ca2, txOneHash);
    
            await expect(addTransactionRecord(db, record2)).rejects.toThrow(
                "SQLITE_CONSTRAINT: UNIQUE constraint failed: transactions.transaction_hash"
            );
        });
    });
    

    describe("Records and retrives tx from db", () => {
   
        it("Stores New Tx on the db and triggers info alert", async () => {
            let randomContract = getRandomAddress();
            let txHash = getRandomTxHash();
            let [mockApi, criticalEvent] = createBatchContractInfo(
                randomContract,
                'TEST NFT CONTRACT',
                'TSTNFT',
                '100',
                'ERC721',
                [95],
                100,
                bob,
                alice,
                ['777'],
                txHash
            )
            const findings = await handleTransaction(criticalEvent, mockApi);
            let recordFromHash = await getTransactionByHash(db, txHash);
            console.log(JSON.stringify(findings, null, 2))
            console.log(recordFromHash)

            expect(findings.length).toBe(1);
            expect(findings[0].metadata.floorPriceDiff).toBe("-5.00%")
            expect(findings[0].metadata.fromAddr).toBe(bob);
            expect(findings[0].metadata.toAddr).toBe(alice);
            expect(findings[0].labels).toStrictEqual(
                [
                    {
                        "entityType": 1,
                        "entity": `777,${randomContract}`,
                        "label": "nft-sale-record",
                        "confidence": 0.9,
                        "remove": false,
                        "metadata": {}
                    }
                ]
            );

        });

    });
});
