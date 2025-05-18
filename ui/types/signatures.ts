export interface ListSignatureResponse {
  amount: number
  price: number
  token: string
  signature: string
  domain: {
    verifyingContract: string
    name: string
    version: string
    chainId: number
  }

  types: Record<string, any>
  value: Record<string, any>

  list: Record<string, any>
}

export interface PurchaseSignatureResponse {
  itemId: number
  signature: string
  domain: {
    verifyingContract: string
    name: string
    version: string
    chainId: number
  }

  types: Record<string, any>

  value: Record<string, any>
  purchase: Record<string, any>
}

export interface WithdrawSignatureResponse {
  signature: string
  domain: {
    verifyingContract: string
    name: string
    version: string
    chainId: number
  }

  types: Record<string, any>

  value: Record<string, any>
  withdraw: Record<string, any>
}
