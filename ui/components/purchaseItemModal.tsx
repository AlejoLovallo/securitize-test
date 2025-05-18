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
import toast from 'react-hot-toast'

interface PurchaseItemModalProps {
  onSubmit: (itemId: number) => Promise<void>
  buttonLabel?: string
}

export function PurchaseItemModal({
  onSubmit,
  buttonLabel = 'Purchase Item',
}: PurchaseItemModalProps) {
  const [itemId, setItemId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onSubmit(parseInt(itemId))
      setIsOpen(false) // Close modal on success
      setItemId('') // Reset form
    } catch (error: any) {
      console.error('Error in purchase modal:', error)
      toast.error(
        `Failed to generate purchase signature: ${error.message?.slice(0, 50) || 'Unknown error'}`,
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>{buttonLabel}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Purchase Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="itemId">Item ID</Label>
            <Input
              id="itemId"
              type="number"
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Generate Signature'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
