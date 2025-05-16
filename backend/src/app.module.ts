import { Module } from '@nestjs/common'
import { config } from 'dotenv'
import { HealthModule } from './health/health.module'
import { ConfigModule } from '@nestjs/config'
import { Web3Module } from './web3/web3.module'
import { MarketplaceModule } from './marketplace/marketplace.module'

config()

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HealthModule,
    Web3Module,
    MarketplaceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
