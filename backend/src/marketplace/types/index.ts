import { ApiResponseProperty } from '@nestjs/swagger'
import { IsBoolean, IsObject, IsString } from 'class-validator'

export interface MarketplaceItem {
  token: string
  seller: string
  amount: string
  price: string
}

export interface Seller {
  activeListedItems: string
  totalSoldItems: string
  totalListedItems: string
  pendingWithdrawals: string
  balance: string
  signedNonce: string
}

export class TransactionResponse {
  @ApiResponseProperty()
  @IsString()
  transactionHash: string

  @ApiResponseProperty()
  @IsBoolean()
  success: boolean
}

export class ListSignatureResponse {
  @ApiResponseProperty()
  @IsObject()
  domain: {
    verifyingContract: string
    name: string
    version: string
    chainId: number
  }

  @ApiResponseProperty()
  @IsObject()
  types: Record<string, any>

  @ApiResponseProperty()
  @IsObject()
  value: Record<string, any>
}

export class PurchaseSignatureResponse {
  @ApiResponseProperty()
  @IsObject()
  domain: {
    verifyingContract: string
    name: string
    version: string
    chainId: number
  }

  @ApiResponseProperty()
  @IsObject()
  types: Record<string, any>

  @ApiResponseProperty()
  @IsObject()
  value: Record<string, any>
}

export class WithdrawSignatureResponse {
  @ApiResponseProperty()
  @IsObject()
  domain: {
    verifyingContract: string
    name: string
    version: string
    chainId: number
  }

  @ApiResponseProperty()
  @IsObject()
  types: Record<string, any>

  @ApiResponseProperty()
  @IsObject()
  value: Record<string, any>
}
