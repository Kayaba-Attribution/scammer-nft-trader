import { Finding, FindingSeverity, FindingType, Label, EntityType } from 'forta-agent';
import { TransactionRecord } from 'src/types/types';

export function createCustomAlert(
  record: TransactionRecord,
  description: string,
  name: string,
  findingType: FindingType,
  severity: FindingSeverity,
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


  const findingInput = {
    name: 'scammer-nft-trader',
    description,
    alertId: name,
    severity: severity,
    type: findingType,
    metadata,
    labels
  };
  //console.log('findingInput', findingInput);
  return Finding.from(findingInput);
}
