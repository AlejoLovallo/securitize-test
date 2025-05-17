'use server'

const BACKEND_SERVICE = process.env.BACKEND_URL

export const getItems = async () => {
  const response = await fetch(`${BACKEND_SERVICE}/api/marketplace/items`)
  return response.json()
}

export const getSeller = async (address: string) => {
  const response = await fetch(`${BACKEND_SERVICE}/api/marketplace/sellers/${address}`)
  return response.json()
}

export const listItemWithSig = async () => {}

export const purchaseItemWithSig = async () => {}

export const withdrawFundsWithSig = async () => {}
