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
import {
  ListSignatureResponse,
  MarketplaceItem,
  PurchaseSignatureResponse,
  Seller,
  TransactionResponse,
  WithdrawSignatureResponse,
} from './types'
import {
  DOMAIN,
  LIST_ITEM_SIGNATURE,
  PURCHASE_ITEM_SIGNATURE,
  WITHDRAW_SIGNATURE,
} from 'src/web3/types'

@Injectable()
export class MarketplaceService {
  private readonly logger = new Logger(MarketplaceService.name)

  constructor(
    private readonly web3Service: Web3Service,
    private readonly redisService: RedisService,
  ) {}

  /**
   * @Get active listed items
   * @param query {GetItemsQueryDto}
   * @returns {GetItemsResponse}
   */
  public async getItems(query: GetItemsQueryDto): Promise<GetItemsResponse> {
    this.logger.log('Fetching items from the marketplace')
    let { page, limit, token, seller, forceUpdate } = query
    const offset = (page - 1) * limit
    forceUpdate = typeof forceUpdate === 'string' ? forceUpdate === 'true' : forceUpdate === true

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

  /**
   * @dev List an item on the marketplace with EIP712 signature
   * @param data {ListItemDto}
   * @returns {TransactionResponse}
   */
  public async listItem(data: ListItemDto): Promise<TransactionResponse> {
    this.logger.log('Listing item on the marketplace')
    const { token, price, amount, signature, deadline, seller } = data

    const sigDeadline =
      deadline ?? (await this.web3Service.getCurrentBlockTimestamp()) + 60 * 60 * 24

    // Call the smart contract to list the item - fixed capitalization to match contract
    const result = await this.web3Service.executeContractMethod('ListItemWithSig', [
      signature,
      seller, // Make sure seller is passed correctly
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

  /**
   * @dev Purchase an item on the marketplace with EIP712 signature
   * @param data {PurchaseItemDto}
   * @returns {TransactionResponse}
   */
  public async purchaseItem(data: PurchaseItemDto): Promise<TransactionResponse> {
    this.logger.log('Purchase item on the marketplace')
    const { itemId, buyer, signature, deadline } = data

    await this._findItem(itemId)

    const sigDeadline =
      deadline ?? (await this.web3Service.getCurrentBlockTimestamp()) + 60 * 60 * 24

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

  /**
   * @dev Withdraw funds from the marketplace with EIP712 signature
   * @param data {WithdrawFundsDto}
   * @returns {TransactionResponse}
   */
  public async withdrawFunds(data: WithdrawFundsDto): Promise<TransactionResponse> {
    this.logger.log('Withdraw funds from the marketplace')
    const { seller, signature, deadline } = data

    const sigDeadline =
      deadline ?? (await this.web3Service.getCurrentBlockTimestamp()) + 60 * 60 * 24

    const result = await this.web3Service.executeContractMethod('withdrawWithSig', [
      seller,
      signature,
      sigDeadline,
    ])

    return {
      success: true,
      transactionHash: result.transactionHash,
    }
  }

  /**
   * @dev Get seller information from the marketplace
   * @param sellerAddress {string}
   * @returns {Seller}
   */
  public async getSeller(sellerAddress: string): Promise<Seller> {
    this.logger.log(`Fetching seller from the marketplace with address: ${sellerAddress}`)

    return await this._findSeller(sellerAddress)
  }

  public async getPurchasesHistory(data: GetPurchasesHistoryDto) {
    this.logger.log('Fetching purchases history from the marketplace')
    const { fromBlock, toBlock } = data

    const cacheKey = `marketplace:purchases:all`
    let purchaseEvents: any[] = []

    // If not forcing update, try to get from cache
    const cachedEvents = await this.redisService.getValue(cacheKey)
    if (cachedEvents) {
      this.logger.log('Found purchases in cache')
      try {
        const parsedCache = JSON.parse(cachedEvents)
        purchaseEvents = parsedCache
      } catch (error) {
        this.logger.error('Error parsing cached purchases:', error)
      }
    }

    // If cache miss or force update, fetch from blockchain
    if (purchaseEvents.length === 0) {
      this.logger.log('Fetching purchases from blockchain')
      const rawEvents = await this.web3Service.getEvents('ItemPurchased', [], fromBlock)

      purchaseEvents = await this._getDecodedPurchaseEvents(rawEvents)

      // Cache the results
      await this.redisService.setValue(cacheKey, JSON.stringify({ purchaseEvents }))
    }

    return {
      purchaseEvents,
    }
  }

  /**
   * @dev Generate EIP712 signature for listing an item
   * @param data {Omit<ListItemDto, 'signature'>}
   * @returns {ListSignatureResponse}
   */
  public async generateListSignature(
    data: Omit<ListItemDto, 'signature'>,
  ): Promise<ListSignatureResponse> {
    const seller = await this._findSeller(data.seller, false)
    const nonce = seller?.signedNonce || 0
    const deadline =
      data.deadline ?? (await this.web3Service.getCurrentBlockTimestamp()) + 60 * 60 * 24

    return {
      domain: {
        verifyingContract: await this.web3Service.getContractAddress(),
        ...DOMAIN,
      },
      types: {
        ListItem: LIST_ITEM_SIGNATURE.ListItem,
      },
      value: {
        tokenAddress: data.token,
        amount: data.amount,
        price: data.price,
        nonce: nonce,
        deadline: deadline,
      },
    }
  }

  /**
   * @dev Generate EIP712 signature for purchasing an item
   * @param data {Omit<PurchaseItemDto, 'signature'>}
   * @returns {PurchaseSignatureResponse}
   */
  public async generatePurchaseSignature(
    data: Omit<PurchaseItemDto, 'signature'>,
  ): Promise<PurchaseSignatureResponse> {
    const buyerNonce = await this.web3Service.callContractMethod('buyerNonces', [data.buyer])
    // Only calls it to throw if it's not found
    await this._findItem(parseInt(data.itemId.toString()))

    const deadline =
      data.deadline ?? (await this.web3Service.getCurrentBlockTimestamp()) + 60 * 60 * 24

    return {
      domain: {
        verifyingContract: await this.web3Service.getContractAddress(),
        ...DOMAIN,
      },
      types: {
        PurchaseItem: PURCHASE_ITEM_SIGNATURE.PurchaseItem,
      },
      value: {
        itemId: data.itemId,
        nonce: parseInt(buyerNonce.toString()),
        deadline: deadline,
      },
    }
  }

  /**
   * @dev Generate EIP712 signature for withdrawing funds
   * @param data {Omit<WithdrawFundsDto, 'signature'>}
   * @returns {WithdrawSignatureResponse}
   */
  public async generateWithdrawSignature(
    data: Omit<WithdrawFundsDto, 'signature'>,
  ): Promise<WithdrawSignatureResponse> {
    // In this case, we have to throw because at least the seller must exist to be able to withdraw
    const seller = await this._findSeller(data.seller, true)
    const deadline =
      data.deadline ?? (await this.web3Service.getCurrentBlockTimestamp()) + 60 * 60 * 24

    return {
      domain: {
        verifyingContract: await this.web3Service.getContractAddress(),
        ...DOMAIN,
      },
      types: {
        ListItem: WITHDRAW_SIGNATURE.WithdrawFunds,
      },
      value: {
        nonce: seller.signedNonce,
        deadline: deadline,
      },
    }
  }

  /////////////////////////////////////////////// PRIVATE METHODS ///////////////////////////////////////////////

  private async _getItems(items: string[], offset: number, limit: number) {
    // Fetch details for each listing
    const slicedItems = items.slice(offset, offset + limit)
    const itemDetails = await Promise.all(
      slicedItems.map((itemId) => this.web3Service.callContractMethod('listedItems', [itemId])),
    )

    // Map the item details to a more readable format and include itemId
    return itemDetails.map((item: any, idx: number) => ({
      ...this._decodeItem(item),
      itemId: slicedItems[idx],
    }))
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

  private async _findSeller(sellerAddress: string, throwOnNotFound = true): Promise<Seller> {
    const rawSeller = await this.web3Service.callContractMethod('sellers', [sellerAddress])
    if (!rawSeller.active && throwOnNotFound) {
      throw new HttpException(`Not active seller with ${sellerAddress}`, 404)
    }
    return rawSeller ? this._decodeSeller(rawSeller) : null
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

  private async _getDecodedPurchaseEvents(rawEvents: any[]): Promise<any[]> {
    return rawEvents.map((event: any) => {
      return {
        buyer: event.args[0].toString(),
        token: event.args[1].toString(),
        amount: event.args[2].toString(),
        price: event.args[3].toString(),
      }
    })
  }
}
