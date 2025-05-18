'use client'
import { useEffect, useState } from 'react'
import { useAccount, useWalletClient } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  getSeller,
  generateListItemSignature,
  generatePurchaseItemSignature,
  generateWithdrawFundsSignature,
} from '@/services/marketplace'
import { withdrawFunds } from '@/services/web3'
import type { Seller } from '@/types'
import { ListItemModal } from '../../components/listItemModal'
import { formatEther, parseEther } from 'viem'

export default function Seller() {
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const [sellerData, setSellerData] = useState<Seller | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadSellerData = async () => {
      if (!address) return
      try {
        const data = await getSeller(address)
        console.log('Seller data:', data)
        setSellerData(data)
      } catch (error) {
        console.error('Error loading seller data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSellerData()
  }, [address])

  const handleGenerateListSignature = async (
    tokenAddress: string,
    price: number,
    amount: number,
  ) => {
    if (!address) return
    try {
      const signature = await generateListItemSignature(address, tokenAddress, price, amount)
      console.log('List signature:', signature)
    } catch (error) {
      console.error('Error generating list signature:', error)
    }
  }

  const handleGeneratePurchaseSignature = async () => {
    if (!address) return
    try {
      const signature = await generatePurchaseItemSignature(1, address)
      console.log('Purchase signature:', signature)
    } catch (error) {
      console.error('Error generating purchase signature:', error)
    }
  }

  const handleGenerateWithdrawSignature = async () => {
    if (!address) return
    try {
      const signature = await generateWithdrawFundsSignature(address)
      console.log('Withdraw signature:', signature)
    } catch (error) {
      console.error('Error generating withdraw signature:', error)
    }
  }

  const handleWithdrawFunds = async () => {
    if (!address || !walletClient || !sellerData?.pendingWithdrawals) return
    try {
      //const signatureData = await generateWithdrawFundsSignature(address)

      // Luego ejecutamos la transacción on-chain
      const receipt = await withdrawFunds(walletClient)
      console.log('Withdrawal transaction:', receipt)

      // Si la transacción es exitosa, actualizamos los datos del seller
      const data = await getSeller(address)
      setSellerData(data)
    } catch (error) {
      console.error('Error withdrawing funds:', error)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Seller Dashboard</h1>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        sellerData && (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-sm">Active Items: {sellerData.activeListedItems}</div>
              <div className="text-sm">Total Sold: {sellerData.totalSoldItems}</div>
              <div className="text-sm">Total Listed: {sellerData.totalListedItems}</div>
              <div className="text-sm">Balance: {formatEther(BigInt(sellerData.balance))} ETH</div>
              <div className="text-sm">
                Pending: {formatEther(BigInt(sellerData.pendingWithdrawals))} ETH
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">List Item</CardTitle>
                </CardHeader>
                <CardContent>
                  <ListItemModal onSubmit={handleGenerateListSignature} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Purchase Item</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button onClick={handleGeneratePurchaseSignature}>Generate Signature</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Withdraw (Signature)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button onClick={handleGenerateWithdrawSignature}>Generate Signature</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Withdraw Funds</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button onClick={handleWithdrawFunds} disabled={!sellerData.pendingWithdrawals}>
                    Withdraw {sellerData.pendingWithdrawals} ETH
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        )
      )}
    </main>
  )
}
