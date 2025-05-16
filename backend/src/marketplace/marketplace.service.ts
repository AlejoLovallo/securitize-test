import { Injectable, Logger } from '@nestjs/common'
import { Web3Service } from 'src/web3/web3.service'
import { GetItemsQueryDto } from './dto'

@Injectable()
export class MarketplaceService {
  private readonly logger = new Logger(MarketplaceService.name)

  constructor(private readonly web3Service: Web3Service) {}

  public async getItems(query: GetItemsQueryDto) {}
}
