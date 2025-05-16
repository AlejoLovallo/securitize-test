import { Module } from '@nestjs/common'
import { MarketplaceController } from './marketplace.controller'
import { MarketplaceService } from './marketplace.service'
import { Web3Module } from 'src/web3/web3.module'
import { RedisService } from 'src/common/services/redis.service'

@Module({
  controllers: [MarketplaceController],
  providers: [MarketplaceService],
  imports: [Web3Module, RedisService],
})
export class MarketplaceModule {}
