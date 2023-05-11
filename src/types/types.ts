import type { BigNumberish } from 'ethers';
import type { NftTokenType, NftContract } from 'alchemy-sdk';

export interface CustomError extends Error {
    response?: {
        status: number;
        data: string;
    };
}

export type ContractData = {
    name: string | undefined;
    address?: string;
    symbol: string | undefined;
    tokenType: NftTokenType;
};

export type BatchContractInfo = {
    address: string | undefined;
    contractMetadata: NftContract;
}
export type TokenType = 'ERC721' | 'ERC1155' | 'UNKNOWN';

export type TokenData = {
    tokenId?: string;
    name: string;
    markets?: {
        [key: string]: {
            market: Market;
            amount: number;
            price: {
                value: string;
                currency: { name: string; decimals: number };
            };
        };
    };
};

export type TokenInfo = {
    name: string;
    price: {
        value: string;
        currency: { name: string; decimals: number };
    };
};

export type ContractMetadata = {
    name: string;
    symbol: string;
    tokenType: TokenType;
};


export type SwapTokenData = {
    tokenId: string;
    name?: string;
    image?: string;
    tokenType: NftTokenType;
    amount?: number;
    contractAddress: string;
};

interface SwapData {
    name?: string;
    address?: string;
    spentAssets: SwapTokenData[];
    spentAmount?: string;
}

export interface Swap {
    maker: SwapData;
    taker: SwapData;
}

export enum ItemType {
    // 0: ETH on mainnet, MATIC on polygon, etc.
    NATIVE,

    // 1: ERC20 items (ERC777 and ERC20 analogues could also technically work)
    ERC20,

    // 2: ERC721 items
    ERC721,

    // 3: ERC1155 items
    ERC1155,

    // 4: ERC721 items where a number of tokenIds are supported
    ERC721_WITH_CRITERIA,

    // 5: ERC1155 items where a number of ids are supported
    ERC1155_WITH_CRITERIA
}
export type DecodedLogData = { [key: string]: string };

export type OfferItem = {
    itemType: ItemType;
    token: string;
    identifier: string;
    amount: BigNumberish;
};

export type ConsiderationItem = {
    itemType: ItemType;
    token: string;
    identifier: string;
    amount: BigNumberish;
    recipient: string;
};

export type SeaportOrder = {
    offerer: string;
    offer: OfferItem[];
    consideration: ConsiderationItem[];
    recipient: string;
};

export type Fee = {
    rate: number;
    recipient: string;
};

export type Order = {
    trader: string;
    side: number;
    matchingPolicy: string;
    collection: string;
    tokenId: BigNumberish;
    amount: BigNumberish;
    paymentToken: string;
    price: BigNumberish;
    listingTime: BigNumberish;
    expirationTime: BigNumberish;
    fees: Fee[];
    salt: BigNumberish;
    extraParams: string;
};

export type BlurOrder = {
    maker: string;
    taker: string;
    sell: Order;
    sellhash: string;
    buy: Order;
    buyhash: string;
};

export type SwapEvent = {
    _creator: string;
    _time: string;
    _status: number;
    _swapId: string;
    _counterpart: string;
    _referral: string;
};

export type Market = {
    name: MarketName;
    displayName: string;
    contract: string;
    color: number;
    site: string;
    accountPage: string;
    iconURL: string;
    topics: string[];
};


export type CurrencyAddress =
    | '0x0000000000000000000000000000000000000000'
    | '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
    | '0x6b175474e89094c44da98b954eedeac495271d0f'
    | '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
    | '0x4d224452801aced8b2f0aebe155379bb5d594381';

export type Currency = {
    [key in CurrencyAddress]: {
        name: string;
        decimals: number;
    };
};


export type MarketName =
    | 'opensea'
    | 'looksrare'
    | 'x2y2'
    | 'gem'
    | 'genie'
    | 'nfttrader'
    | 'sudoswap'
    | 'blur'
    | 'blurswap'
    | 'unknown';

export type Recipient =
    | 'opensea'
    | 'looksrare'
    | 'x2y2'
    | 'gem'
    | 'genie'
    | 'nfttrader'
    | 'sudoswap'
    | 'blur'
    | 'blurswap'
    | 'unknown';

export type TransactionData = {
    swap?: Swap;
    isAggregator: boolean;
    isBlurBid?: boolean;
    interactedMarket: Market;
    totalPrice: number;
    tokens: {
        [key: string]: TokenData;
    };
    contractData: NftContract;
    gifImage?: Buffer | Uint8Array;
    currency: { name: string; decimals: number };
    contractAddress: string;
    totalAmount: number;
    toAddrName?: string;
    fromAddrName?: string;
    toAddr?: string;
    fromAddr?: string;
    usdPrice?: string | null;
    transactionHash: string;
    floorPriceDiff?: string;
};

export type TransactionRecord = {
    interactedMarket: MarketName,
    transactionHash: string,
    toAddr?: string;
    fromAddr?: string;
    initiator?: string;
    totalPrice: number;
    avgItemPrice: number;
    contractAddress: string;
    floorPrice: number;
    tokens: {
        [key: string]: TokenInfo;
    };
    timestamp: number;
    floorPriceDiff?: string;
}
