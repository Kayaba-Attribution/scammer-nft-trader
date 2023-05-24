import { OpenSeaSDK, Network } from 'opensea-js'

// TODO deprecate alchemy and use this instead

function getContractData(contractAddress: string, provider: any) {

  const openseaSDK = new OpenSeaSDK(provider, {
    networkName: Network.Main,
    apiKey: '9a3186c6c9444ca7884ee18b58a5c16f'
  })

  return openseaSDK.api.getAsset({ tokenAddress: contractAddress, tokenId: 1 })
}