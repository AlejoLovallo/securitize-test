export interface ListSignatureResponse {
  domain: {
    verifyingContract: string
    name: string
    version: string
    chainId: number
  }

  types: Record<string, any>

  value: Record<string, any>
}

export interface PurchaseSignatureResponse {
  domain: {
    verifyingContract: string
    name: string
    version: string
    chainId: number
  }

  types: Record<string, any>

  value: Record<string, any>
}

export interface WithdrawSignatureResponse {
  domain: {
    verifyingContract: string
    name: string
    version: string
    chainId: number
  }

  types: Record<string, any>

  value: Record<string, any>
}
