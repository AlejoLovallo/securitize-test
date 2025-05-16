import { Controller, Get, Post, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { MarketplaceService } from './marketplace.service'
import { GetItemsQueryDto } from './dto'

/**
 * Query listed items and purchase history from the smart contract.
Generate EIP-712-compliant messages for token transfers.
 * Listing items via signed messages ( POST /list).
Querying all items ( GET /items).
Purchasing item ( POST /purchase).
Withdraw item ( POST /withdraw)
 */

@ApiTags('marketplace')
@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Get('items')
  async getItems(@Query() query: GetItemsQueryDto) {
    return this.marketplaceService.getItems(query)
  }

  @Get('purchases')
  async getPurchases() {}

  @Post('purchase')
  async purchaseItem() {}

  @Post('withdraw')
  async withdrawFunds() {}
}
