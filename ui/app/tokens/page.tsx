'use client'
import Item from '@/components/item'
import { getItems } from '@/services/marketplace'
import { purchaseToken } from '@/services/web3'
import type { Item as ItemType } from '@/types'
import { useEffect, useState } from 'react'
import { useWalletClient } from 'wagmi'
import toast from 'react-hot-toast'

export default function Tokens() {
  const [itemsData, setTokens] = useState<ItemType[]>([])
  const { data: walletClient } = useWalletClient()

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const response = await getItems()
        setTokens(response)
      } catch (error) {
        console.error('Error fetching tokens:', error)
      }
    }
    fetchTokens()
    // If tokens are passed as props, use them directly
  }, [])

  const handlePurchase = async (tokenId: string, price: string) => {
    if (!walletClient) return

    const toastId = toast.loading(`Purchasing token #${tokenId}...`)
    try {
      const receipt = await purchaseToken(parseInt(tokenId), price, walletClient)

      toast.success(
        `Token purchased successfully! Transaction: ${receipt.transactionHash.slice(0, 10)}...`,
        {
          id: toastId,
          duration: 5000,
        },
      )

      console.log('Purchase successful:', receipt)

      // Refresh tokens list after purchase
      const response = await getItems(true)
      setTokens(response)
    } catch (error: any) {
      console.error('Error purchasing token:', error)

      toast.error(`Failed to purchase token: ${error.message?.slice(0, 50) || 'Unknown error'}`, {
        id: toastId,
        duration: 5000,
      })
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Available Tokens for sale</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {itemsData.map((token) => (
          <Item
            key={token.id}
            token={token}
            onPurchase={() => handlePurchase(token.id, token.price)}
          />
        ))}
      </div>
    </main>
  )
}
