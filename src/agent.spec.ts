import {
    FindingType,
    FindingSeverity,
    Finding,
    HandleTransaction,
    createTransactionEvent
} from "forta-agent";

// ! TODO FIX
/**
    /home/kayaba/WORK FORTA/scammer-nft-trader/node_modules/@adraffy/ens-normalize/dist/index.js:1177
    export { ens_beautify, ens_emoji, ens_normalize, ens_normalize_fragment, ens_split, ens_tokenize, is_combining_mark, nfc, nfd, safe_str_from_cps, should_escape };
    ^^^^^^

    SyntaxError: Unexpected token 'export'
 */

import agent from "./agent";

import db from './db';
import { addTransactionRecord, getTransactionsByAddress, getTransactionByHash, getLatestTransactionRecords } from './client';

import type { MarketName } from "./types/types";

import crypto from 'crypto';

function toHexString(byteArray: Uint8Array): string {
    return '0x' + Array.from(byteArray, byte => byte.toString(16).padStart(2, '0')).join('');
}

function getRandomTxHash(): string {
    const randomBytes = crypto.randomBytes(32);
    const randomTxHash = toHexString(new Uint8Array(randomBytes));
    return randomTxHash;
}

function getRandomAddress(): string {
    const bytes = crypto.randomBytes(20);
    const randomAddress = toHexString(new Uint8Array(bytes));
    return randomAddress;
}


function newRecord(fromAddr: string, toAddr: string, initiator: string,
    contractAddress: string,) {
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
