'use client'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { parseEther } from 'viem'
import toast from 'react-hot-toast'

interface DirectListItemModalProps {
  onSubmit: (tokenAddress: string, price: string, amount: number) => Promise<any>
}

export function DirectListItemModal({ onSubmit }: DirectListItemModalProps) {
  const [tokenAddress, setTokenAddress] = useState('')
  const [price, setPrice] = useState('')
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTxHash(null)

    try {
      // Convert price from ETH to wei
      const priceInWei = parseEther(price)
      const result = await onSubmit(tokenAddress, priceInWei.toString(), parseInt(amount))
      setTxHash(result?.transactionHash || null)

      // Close the modal on success
      setIsOpen(false)

      // Reset form
      setTokenAddress('')
      setPrice('')
      setAmount('')
    } catch (error: any) {
      // Toast notifications are handled in the parent component
      console.error('Error in modal:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Direct List Item</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Direct List Item (on-chain)</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tokenAddress">Token Address</Label>
            <Input
              id="tokenAddress"
              placeholder="0x..."
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price (ETH)</Label>
            <Input
              id="price"
              type="number"
              step="0.000001"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Processing Transaction...' : 'List Item'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
