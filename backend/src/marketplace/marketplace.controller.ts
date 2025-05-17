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
import {
  ListSignatureResponse,
  PurchaseSignatureResponse,
  Seller,
  TransactionResponse,
  WithdrawSignatureResponse,
} from './types'

@ApiTags('marketplace')
@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Get('items')
  async getItems(@Query() query: GetItemsQueryDto): Promise<GetItemsResponse> {
    return this.marketplaceService.getItems(query)
  }

  @Post('list')
  async listItem(@Body() body: ListItemDto): Promise<TransactionResponse> {
    return this.marketplaceService.listItem(body)
  }

  @Get('purchases')
  async getPurchases(@Body() body: GetPurchasesHistoryDto) {
    return this.marketplaceService.getPurchasesHistory(body)
  }

  @Post('purchase')
  async purchaseItem(@Body() body: PurchaseItemDto): Promise<TransactionResponse> {
    return this.marketplaceService.purchaseItem(body)
  }

  @Post('withdraw')
  async withdrawFunds(@Body() body: WithdrawFundsDto): Promise<TransactionResponse> {
    return this.marketplaceService.withdrawFunds(body)
  }

  @Get('sellers/:address')
  async getSeller(@Param('address') address: string): Promise<Seller> {
    return this.marketplaceService.getSeller(address)
  }

  @Post('signatures/list')
  async generateListSignature(
    @Body() data: Omit<ListItemDto, 'signature'>,
  ): Promise<ListSignatureResponse> {
    return this.marketplaceService.generateListSignature(data)
  }

  @Post('signatures/purchase')
  async generatePurchaseSignature(
    @Body() data: Omit<PurchaseItemDto, 'signature'>,
  ): Promise<PurchaseSignatureResponse> {
    return this.marketplaceService.generatePurchaseSignature(data)
  }

  @Post('signatures/withdraw')
  async generateWithdrawSignature(
    @Body() data: Omit<WithdrawFundsDto, 'signature'>,
  ): Promise<WithdrawSignatureResponse> {
    return this.marketplaceService.generateWithdrawSignature(data)
  }
}
