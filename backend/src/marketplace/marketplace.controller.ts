import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { MarketplaceService } from './marketplace.service'
import {
  GetItemsQueryDto,
  GetItemsResponse,
  GetPurchasesHistoryDto,
  ListItemDto,
  PurchaseItemDto,
  WithdrawFundsDto,
} from './dto'
import { Seller } from './types'

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
  async getItems(@Query() query: GetItemsQueryDto): Promise<GetItemsResponse> {
    return this.marketplaceService.getItems(query)
  }

  @Post('list')
  async listItem(@Body() body: ListItemDto) {
    return this.marketplaceService.listItem(body)
  }

  @Get('purchases')
  async getPurchases(@Body() body: GetPurchasesHistoryDto) {
    return this.marketplaceService.getPurchasesHistory(body)
  }

  @Post('purchase')
  async purchaseItem(@Body() body: PurchaseItemDto) {
    return this.marketplaceService.purchaseItem(body)
  }

  @Post('withdraw')
  async withdrawFunds(@Body() body: WithdrawFundsDto) {
    return this.marketplaceService.withdrawFunds(body)
  }

  @Get('sellers/:address')
  async getSeller(@Param('address') address: string): Promise<Seller> {
    return this.marketplaceService.getSeller(address)
  }

  @Post('signatures/list')
  async generateListSignature() {}

  @Post('signatures/purchase')
  async generatePurchaseSignature() {}

  @Post('signatures/withdraw')
  async generateWithdrawSignature() {}
}
