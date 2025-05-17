import { HttpException, Injectable, Logger } from '@nestjs/common'
import { Web3Service } from 'src/web3/web3.service'
import {
  GetItemsQueryDto,
  GetItemsResponse,
  GetPurchasesHistoryDto,
  ListItemDto,
  PurchaseItemDto,
  WithdrawFundsDto,
} from './dto'
import { RedisService } from 'src/marketplace/redis.service'
import { MarketplaceItem, Seller } from './types'

@Injectable()
export class MarketplaceService {
  private readonly logger = new Logger(MarketplaceService.name)

  constructor(
    private readonly web3Service: Web3Service,
    private readonly redisService: RedisService,
  ) {}

  public async getItems(query: GetItemsQueryDto): Promise<GetItemsResponse> {
    this.logger.log('Fetching items from the marketplace')
    const { page, limit, token, seller, forceUpdate } = query
    const offset = (page - 1) * limit

    const cacheKey = `marketplace:items:${token || 'all'}:${seller || 'all'}`
    let items: string[] = []
    let decodedItems = []

    // If not forcing update, try to get from cache
    if (!forceUpdate) {
      const cachedItems = await this.redisService.getValue(cacheKey)
      if (cachedItems) {
        this.logger.log('Found items in cache')
        try {
          const parsedCache = JSON.parse(cachedItems)
          items = parsedCache.items
          decodedItems = parsedCache.decodedItems
        } catch (error) {
          this.logger.error('Error parsing cached items:', error)
        }
      }
    }

    // If cache miss or force update, fetch from blockchain
    if (items.length === 0 || forceUpdate) {
      this.logger.log('Fetching items from blockchain')
      const rawItems = await this.web3Service.callContractMethod('itemsIds')
      items = rawItems.map((item: bigint) => item.toString())
      decodedItems = await this._getItems(items, 0, items.length)

      // Filter by token and seller if provided
      if (token || seller) {
        const filteredResults = decodedItems.reduce(
          (acc: { items: string[]; decoded: any[] }, item: any, index: number) => {
            const tokenMatch = !token || item.token.toLowerCase() === token.toLowerCase()
            const sellerMatch = !seller || item.seller.toLowerCase() === seller.toLowerCase()

            if (tokenMatch && sellerMatch) {
              acc.items.push(items[index])
              acc.decoded.push(item)
            }
            return acc
          },
          { items: [], decoded: [] },
        )

        items = filteredResults.items
        decodedItems = filteredResults.decoded
      }

      // Cache the results
      await this.redisService.setValue(cacheKey, JSON.stringify({ items, decodedItems }))
    }

    // Apply pagination after filtering
    const paginatedDecodedItems = decodedItems.slice(offset, offset + limit)

    return {
      items,
      decodedItems: paginatedDecodedItems,
      total: items.length,
      page,
      offset,
    }
  }

  public async listItem(data: ListItemDto) {
    this.logger.log('Listing item on the marketplace')
    const { token, price, amount, signature, deadline } = data

    const sigDeadline =
      deadline ?? (await this.web3Service.getCurrentBlockTimestamp()) + 60 * 60 * 24

    // Call the smart contract to list the item
    const result = await this.web3Service.executeContractMethod('listItemWithSig', [
      signature,
      token,
      price,
      amount,
      sigDeadline,
    ])

    return {
      success: true,
      transactionHash: result.transactionHash,
    }
  }

  public async purchaseItem(data: PurchaseItemDto) {
    this.logger.log('Purchase item on the marketplace')
    const { itemId, buyer, signature, deadline } = data

    await this._findItem(itemId)

    const sigDeadline =
      deadline ?? (await this.web3Service.getCurrentBlockTimestamp()) + 60 * 60 * 24

    // Call the smart contract to list the item
    const result = await this.web3Service.executeContractMethod('purchaseItemWithSig', [
      itemId,
      buyer,
      signature,
      sigDeadline,
    ])

    return {
      success: true,
      transactionHash: result.transactionHash,
    }
  }

  public async withdrawFunds(data: WithdrawFundsDto) {
    this.logger.log('Withdraw funds from the marketplace')
    const { seller, signature, deadline } = data

    const sigDeadline =
      deadline ?? (await this.web3Service.getCurrentBlockTimestamp()) + 60 * 60 * 24

    // Call the smart contract to withdraw funds
    const result = await this.web3Service.executeContractMethod('withdrawFundsWithSig', [
      seller,
      signature,
      sigDeadline,
    ])

    return {
      success: true,
      transactionHash: result.transactionHash,
    }
  }

  public async getSeller(sellerAddress: string): Promise<Seller> {
    this.logger.log(`Fetching seller from the marketplace with address: ${sellerAddress}`)
    let seller: Seller | null = null

    return await this._findSeller(sellerAddress)
  }

  public async getPurchasesHistory(data: GetPurchasesHistoryDto) {}

  private async _getItems(items: string[], offset: number, limit: number) {
    // Fetch details for each listing
    const itemDetails = await Promise.all(
      items
        .slice(offset, offset + limit)
        .map((itemId) => this.web3Service.callContractMethod('listedItems', [itemId])),
    )

    // Map the item details to a more readable format
    return itemDetails.map((item: any) => this._decodeItem(item))
  }

  private _decodeItem(item: any): MarketplaceItem {
    return {
      token: item[0].toString(),
      seller: item[1].toString(),
      amount: item[2].toString(),
      price: item[3].toString(),
    }
  }

  private async _findItem(itemId: number): Promise<MarketplaceItem> {
    const rawItem = await this.web3Service.callContractMethod('listedItems', [itemId])
    if (!rawItem) {
      throw new HttpException(`Item with id ${itemId} not found`, 404)
    }
    return this._decodeItem(rawItem)
  }

  private async _findSeller(sellerAddress: string): Promise<Seller> {
    const rawSeller = await this.web3Service.callContractMethod('sellers', [sellerAddress])
    if (!rawSeller.active) {
      throw new HttpException(`Not active seller with ${sellerAddress}`, 404)
    }
    return this._decodeSeller(rawSeller)
  }

  private _decodeSeller(rawSeller: any): Seller {
    return {
      activeListedItems: rawSeller[0].toString(),
      totalSoldItems: rawSeller[1].toString(),
      totalListedItems: rawSeller[2].toString(),
      pendingWithdrawals: rawSeller[3].toString(),
      balance: rawSeller[4].toString(),
      signedNonce: rawSeller[5].toString(),
    }
  }
}
