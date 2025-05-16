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
