'use server'

import {
  Item,
  ListSignatureResponse,
  PurchaseSignatureResponse,
  Seller,
  WithdrawSignatureResponse,
} from '@/types'

const BACKEND_SERVICE = process.env.BACKEND_URL

export const getItems = async (forceUpdate?: boolean): Promise<Item[]> => {
  const response = await fetch(
    `${BACKEND_SERVICE}/api/marketplace/items?forceUpdate=${forceUpdate}`,
  )
  const data = await response.json()

  return data.decodedItems.map((item: any) => ({
    id: item.itemId,
    token: item.token,
    seller: item.seller,
    amount: item.amount,
    price: item.price,
  }))
}

export const getSeller = async (address: string): Promise<Seller> => {
  const response = await fetch(`${BACKEND_SERVICE}/api/marketplace/sellers/${address}`)
  const data = await response.json()

  return {
    activeListedItems: data.activeListedItems,
    totalSoldItems: data.totalSoldItems,
    totalListedItems: data.totalListedItems,
    pendingWithdrawals: data.pendingWithdrawals,
    balance: data.balance,
    signedNonce: data.signedNonce,
  }
}

export const listItemWithSig = async (
  signature: string,
  seller: string,
  tokenAddress: string,
  price: number,
  amount: number,
) => {
  const response = await fetch(`${BACKEND_SERVICE}/api/marketplace/list`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token: tokenAddress,
      seller,
      price,
      amount,
      signature,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to list item')
  }

  return response.json()
}

export const purchaseItemWithSig = async (signature: string, itemId: number, buyer: string) => {
  const response = await fetch(`${BACKEND_SERVICE}/api/marketplace/purchase`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      itemId,
      buyer,
      signature,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to purchase item')
  }

  return response.json()
}

export const withdrawFundsWithSig = async (signature: string, seller: string) => {
  const response = await fetch(`${BACKEND_SERVICE}/api/marketplace/withdraw`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      seller,
      signature,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to withdraw funds')
  }

  return response.json()
}

export const generateListItemSignature = async (
  seller: string,
  tokenAddress: string,
  price: number,
  amount: number,
): Promise<ListSignatureResponse> => {
  const response = await fetch(`${BACKEND_SERVICE}/api/marketplace/signatures/list`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token: tokenAddress,
      seller,
      price,
      amount,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to generate list item signature')
  }

  return response.json()
}

export const generatePurchaseItemSignature = async (
  itemId: number,
  buyer: string,
): Promise<PurchaseSignatureResponse> => {
  const response = await fetch(`${BACKEND_SERVICE}/api/marketplace/signatures/purchase`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      itemId,
      buyer,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to generate purchase item signature')
  }

  return response.json()
}

export const generateWithdrawFundsSignature = async (
  seller: string,
): Promise<WithdrawSignatureResponse> => {
  const response = await fetch(`${BACKEND_SERVICE}/api/marketplace/signatures/withdraw`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      seller,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to generate withdraw funds signature')
  }

  return response.json()
}
