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

  constructor(private readonly configService: ConfigService) {
    const alchemyApiKey = this.configService.get<string>('ALCHEMY_API_KEY')
    const network = this.configService.get<string>('NETWORK')
    const contractAddress = this.configService.get<string>('CONTRACT_ADDRESS')

    this.provider = new ethers.AlchemyProvider(network, alchemyApiKey)

    this.marketPlaceContract = new ethers.Contract(contractAddress, abi, this.provider)

    this.logger.log(`Web3Service initialized with network: ${network}`)
  }

  public async executeContractMethod() {}

  public async callContractMethod() {}
}
