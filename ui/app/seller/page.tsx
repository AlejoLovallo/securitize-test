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
  listItemWithSig,
  purchaseItemWithSig,
  withdrawFundsWithSig,
  getItems,
} from '@/services/marketplace'
import { signTypedMessage, withdrawFunds, listItem } from '@/services/web3'
import type {
  Seller,
  ListSignatureResponse,
  PurchaseSignatureResponse,
  WithdrawSignatureResponse,
} from '@/types'
import { ListItemModal } from '../../components/listItemModal'
import { PurchaseItemModal } from '../../components/purchaseItemModal'
import { DirectListItemModal } from '../../components/directListItemModal'
import { formatEther } from 'viem'
import toast from 'react-hot-toast'

export default function Seller() {
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const [sellerData, setSellerData] = useState<Seller | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [signatures, setSignatures] = useState<{
    list?: ListSignatureResponse
    purchase?: PurchaseSignatureResponse
    withdraw?: WithdrawSignatureResponse
  }>({})
  const [showSignatures, setShowSignatures] = useState({
    list: false,
    purchase: false,
    withdraw: false,
  })

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
      setSignatures((prev) => ({ ...prev, list: signature }))
      setShowSignatures((prev) => ({ ...prev, list: true }))
    } catch (error) {
      console.error('Error generating list signature:', error)
    }
  }

  const handleGeneratePurchaseSignature = async (itemId: number) => {
    if (!address) return
    try {
      const signature = await generatePurchaseItemSignature(itemId, address)
      setSignatures((prev) => ({ ...prev, purchase: signature }))
      setShowSignatures((prev) => ({ ...prev, purchase: true }))
    } catch (error) {
      console.error('Error generating purchase signature:', error)
    }
  }

  const handleGenerateWithdrawSignature = async () => {
    if (!address) return
    try {
      const signature = await generateWithdrawFundsSignature(address)
      setSignatures((prev) => ({ ...prev, withdraw: signature }))
      setShowSignatures((prev) => ({ ...prev, withdraw: true }))
    } catch (error) {
      console.error('Error generating withdraw signature:', error)
    }
  }

  const handleExecuteListWithSig = async () => {
    if (!address || !signatures.list) return

    const toastId = toast.loading('Executing list with signature...')
    try {
      await listItemWithSig(
        signatures.list.signature,
        address,
        signatures.list.token,
        signatures.list.price,
        signatures.list.amount,
      )
      toast.success('Item listed successfully with signature!', {
        id: toastId,
        duration: 5000,
      })
      setSignatures((prev) => ({ ...prev, list: undefined }))

      // Refresh seller data
      const data = await getSeller(address)
      setSellerData(data)
    } catch (error: any) {
      console.error('Error executing list with signature:', error)
      toast.error(
        `Failed to list with signature: ${error.message?.slice(0, 50) || 'Unknown error'}`,
        {
          id: toastId,
          duration: 5000,
        },
      )
    }
  }

  const handleExecutePurchaseWithSig = async () => {
    if (!address || !signatures.purchase) return

    const toastId = toast.loading('Executing purchase with signature...')
    try {
      await purchaseItemWithSig(signatures.purchase.signature, signatures.purchase.itemId, address)
      toast.success('Item purchased successfully with signature!', {
        id: toastId,
        duration: 5000,
      })
      setSignatures((prev) => ({ ...prev, purchase: undefined }))

      // Refresh seller data
      const data = await getSeller(address)
      setSellerData(data)
    } catch (error: any) {
      console.error('Error executing purchase with signature:', error)
      toast.error(
        `Failed to purchase with signature: ${error.message?.slice(0, 50) || 'Unknown error'}`,
        {
          id: toastId,
          duration: 5000,
        },
      )
    }
  }

  const handleExecuteWithdrawWithSig = async () => {
    if (!address || !walletClient || !signatures.withdraw) return

    const toastId = toast.loading('Signing withdraw request...')
    try {
      const signedMessage = await signTypedMessage(
        walletClient,
        signatures.withdraw,
        'WithdrawFunds',
      )

      toast.loading('Executing withdraw with signature...', { id: toastId })

      if (signedMessage) {
        await withdrawFundsWithSig(signedMessage, address)
        toast.success('Funds withdrawn successfully with signature!', {
          id: toastId,
          duration: 5000,
        })
      }

      setSignatures((prev) => ({ ...prev, withdraw: undefined }))

      // Refresh seller data
      const data = await getSeller(address)
      setSellerData(data)
    } catch (error: any) {
      console.error('Error executing withdraw with signature:', error)
      toast.error(
        `Failed to withdraw with signature: ${error.message?.slice(0, 50) || 'Unknown error'}`,
        {
          id: toastId,
          duration: 5000,
        },
      )
    }
  }

  const handleWithdrawFunds = async () => {
    if (!address || !walletClient || !sellerData?.pendingWithdrawals) return

    const toastId = toast.loading('Withdrawing funds...')
    try {
      const receipt = await withdrawFunds(walletClient)
      toast.success(
        `Funds withdrawn successfully! Transaction: ${receipt.transactionHash.slice(0, 10)}...`,
        {
          id: toastId,
          duration: 5000,
        },
      )

      const data = await getSeller(address)
      setSellerData(data)
    } catch (error: any) {
      console.error('Error withdrawing funds:', error)
      toast.error(`Failed to withdraw funds: ${error.message?.slice(0, 50) || 'Unknown error'}`, {
        id: toastId,
        duration: 5000,
      })
    }
  }

  const handleDirectListItem = async (tokenAddress: string, price: string, amount: number) => {
    if (!address || !walletClient) return

    const toastId = toast.loading('Listing item...')
    try {
      const result = await listItem(tokenAddress, price, amount, walletClient)
      toast.success(
        `Item listed successfully! Transaction: ${result.transactionHash.slice(0, 10)}...`,
        {
          id: toastId,
          duration: 5000,
        },
      )

      // Refresh seller data
      const data = await getSeller(address)
      setSellerData(data)

      // Refresh items
      await getItems(true)

      return result
    } catch (error: any) {
      console.error('Error listing item directly:', error)
      toast.error(`Failed to list item: ${error.message?.slice(0, 50) || 'Unknown error'}`, {
        id: toastId,
        duration: 5000,
      })
      throw error
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
              <div className="text-sm">
                Balance: {sellerData?.balance ? formatEther(BigInt(sellerData.balance)) : 0} ETH
              </div>
              <div className="text-sm">
                Pending:{' '}
                {sellerData?.pendingWithdrawals
                  ? formatEther(BigInt(sellerData.pendingWithdrawals))
                  : 0}{' '}
                ETH
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">List Item (Signature)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <ListItemModal onSubmit={handleGenerateListSignature} />
                  {showSignatures.list && signatures.list && (
                    <div className="mt-4 p-3 bg-50 rounded-md">
                      <div className="text-xs font-semibold mb-1">Generated Signature:</div>
                      <div className="text-xs break-all mb-2">
                        {JSON.stringify(signatures.list)}...
                      </div>
                      <div className="flex justify-between items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigator.clipboard.writeText(JSON.stringify(signatures.list))
                          }
                        >
                          Copy
                        </Button>
                        <Button size="sm" onClick={handleExecuteListWithSig}>
                          Execute
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Direct List Item</CardTitle>
                </CardHeader>
                <CardContent>
                  <DirectListItemModal onSubmit={handleDirectListItem} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Purchase Item (Signature)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <PurchaseItemModal onSubmit={handleGeneratePurchaseSignature} />
                  {showSignatures.purchase && signatures.purchase && (
                    <div className="mt-4 p-3 bg-50 rounded-md">
                      <div className="text-xs font-semibold mb-1">Generated Signature:</div>
                      <div className="text-xs break-all mb-2">
                        {JSON.stringify(signatures.purchase)}...
                      </div>
                      <div className="flex justify-between items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(signatures.purchase))
                            toast.success('Signature copied to clipboard!')
                          }}
                        >
                          Copy
                        </Button>
                        <Button size="sm" onClick={handleExecutePurchaseWithSig}>
                          Execute
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Withdraw Funds (Signature)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button onClick={handleGenerateWithdrawSignature}>Generate Signature</Button>
                  {showSignatures.withdraw && signatures.withdraw && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                      <div className="text-xs font-semibold mb-1">Generated Signature:</div>
                      <div className="text-xs break-all mb-2">
                        {JSON.stringify(signatures.withdraw)}...
                      </div>
                      <div className="flex justify-between items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigator.clipboard.writeText(JSON.stringify(signatures.withdraw))
                          }
                        >
                          Copy
                        </Button>
                        <Button size="sm" onClick={handleExecuteWithdrawWithSig}>
                          Execute
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Direct Withdraw</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button onClick={handleWithdrawFunds} disabled={!sellerData?.pendingWithdrawals}>
                    Withdraw{' '}
                    {Number(
                      formatEther(BigInt(sellerData?.pendingWithdrawals || 0)),
                    ).toExponential()}
                    ETH
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
