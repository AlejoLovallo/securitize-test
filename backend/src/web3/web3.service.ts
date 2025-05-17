import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { config } from 'dotenv'
import { ethers } from 'ethers'
import * as abi from './abis/marketplace.json'

config()
@Injectable()
export class Web3Service {
  private readonly logger = new Logger(Web3Service.name)
  private provider: ethers.AlchemyProvider
  private marketPlaceContract: ethers.Contract
  private signer: ethers.Signer
  private contractAddress: string

  constructor(private readonly configService: ConfigService) {
    const alchemyApiKey = this.configService.get<string>('ALCHEMY_API_KEY')
    const network = this.configService.get<string>('NETWORK')
    const contractAddress = this.configService.get<string>('CONTRACT_ADDRESS')
    const mnemonic = this.configService.get<string>('MNEMONIC')

    this.provider = new ethers.AlchemyProvider(network, alchemyApiKey)

    this.marketPlaceContract = new ethers.Contract(contractAddress, abi, this.provider)

    this.signer = ethers.Wallet.fromPhrase(mnemonic).connect(this.provider)

    this.logger.log(`Web3Service initialized with network: ${network}`)
  }

  public async getEvents(eventName: string, args: any[] = [], fromBlock?: number) {
    this.logger.log(`Getting ${eventName} events with args and block:`, args, fromBlock)
    try {
      const filter = this.marketPlaceContract.filters[eventName](...args)
      const events = await this.marketPlaceContract.queryFilter(filter, fromBlock, 'latest')
      return events
    } catch (error) {
      this.logger.error(`Error getting events: ${error.message}`)
      throw error
    }
  }

  public async executeContractMethod(method: string, args: any[] = []) {
    this.logger.log(`Executing contract method: ${method} with args: ${args}`)
    try {
      const result = await this.marketPlaceContract.connect(this.signer)[`${method}`](...args)
      return result
    } catch (error) {
      this.logger.error(`Error calling contract method: ${error.message}`)
      throw error
    }
  }

  public async callContractMethod(method: string, args: any[] = []) {
    this.logger.log(`Calling contract method: ${method} with args: ${args}`)
    try {
      const result = await this.marketPlaceContract[`${method}`](...args)
      return result
    } catch (error) {
      this.logger.error(`Error calling contract method: ${error.message}`)
      throw error
    }
  }

  public async getCurrentBlockTimestamp() {
    const block = await this.provider.getBlock('latest')
    return block.timestamp
  }

  public async getContractAddress(): Promise<string> {
    if (!this.contractAddress) {
      return this.marketPlaceContract.getAddress()
    }
    return this.contractAddress
  }
}
