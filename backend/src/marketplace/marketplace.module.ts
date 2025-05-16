import { Module } from '@nestjs/common'
import { MarketplaceController } from './marketplace.controller'
import { MarketplaceService } from './marketplace.service'
import { Web3Module } from 'src/web3/web3.module'
import { RedisService } from './redis.service'

@Module({
  controllers: [MarketplaceController],
  providers: [MarketplaceService, RedisService],
  imports: [Web3Module],
})
export class MarketplaceModule {}
