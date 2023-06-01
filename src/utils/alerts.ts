import { Finding, FindingSeverity, FindingType, Label, EntityType } from 'forta-agent';
import { TransactionRecord } from 'src/types/types';

export function createCustomAlert(
  record: TransactionRecord,
  description: string,
  name: string,
  findingType: FindingType,
  severity: FindingSeverity,
  chainId: number,
  additionalMetadata: { [key: string]: string } = {}
): Finding {
  const metadata: { [key: string]: string } = {
    interactedMarket: record.interactedMarket,
    transactionHash: record.transactionHash,
    toAddr: record.toAddr!,
    fromAddr: record.fromAddr!,
    initiator: record.initiator!,
    totalPrice: record.totalPrice.toString(),
    avgItemPrice: record.avgItemPrice.toString(),
    contractAddress: record.contractAddress,
    floorPrice: record.floorPrice.toString(),
    timestamp: record.timestamp.toString(),
    floorPriceDiff: record.floorPriceDiff || 'ERROR',
    ...additionalMetadata,
  };

  const labels: Label[] = [];

  for (const tokenId in record.tokens) {
    const token = record.tokens[tokenId];
    // labels.push({
    //     entityType: EntityType.Address,
    //     entity: `${tokenId},${record.contractAddress}`,
    //     label: "uncommon-sale",
    //     confidence: 0.9,
    //     remove: false,
    //     metadata: {}
    // })
  }

  let protocol_name = 'ethereum';
  if (chainId === 56) protocol_name = 'bsc';
  if (chainId === 137) protocol_name = 'polygon';

  let market;
  switch (metadata.interactedMarket) {
    case 'blur' || 'blurswap':
      market = 'Blur 🟠';
      break;
    case 'opensea':
      market = 'Opensea 🌊';
      break;
    case 'looksrare':
      market = 'LooksRare 👀💎';
      break;
    default:
      break;
  }

  const findingInput = {
    name: 'scammer-nft-trader',
    description: market ? `[${market}] ${description}` : description,
    alertId: name,
    severity: severity,
    type: findingType,
    metadata,
    labels,
    protocol: protocol_name
  };
  //console.log('findingInput', findingInput);
  return Finding.from(findingInput);
}
