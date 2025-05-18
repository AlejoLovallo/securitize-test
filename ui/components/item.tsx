'use client'
import { useEffect, useState } from 'react'
import { Item as ListItem } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'
import { getTokenData } from '@/services/web3'
import { formatEther } from 'viem'

interface TokenInfo {
  name: string
  symbol: string
  decimals: number
}

interface ItemProps {
  token: ListItem
  onPurchase: () => void
  isLoading?: boolean
}

export default function Item({ token, onPurchase, isLoading: purchaseLoading }: ItemProps) {
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadTokenInfo = async () => {
      try {
        const data = await getTokenData(token.token)
        console.log('Token data:', data)
        setTokenInfo(data)
      } catch (error) {
        console.error('Error loading token info:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTokenInfo()
  }, [token.token])

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted flex items-center justify-center">
            {tokenInfo?.symbol?.[0]}
          </div>
          <div>
            <h3 className="text-lg font-semibold">
              {isLoading ? 'Loading...' : tokenInfo?.name || 'Unknown Token'}
            </h3>
            <p className="text-sm text-muted-foreground">{tokenInfo?.symbol}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-2">Available: {token.amount}</p>
        <p className="text-xl font-medium text-primary mb-4">
          {token?.price ? Number(formatEther(BigInt(token.price))).toExponential() : 0} ETH
        </p>
        <Button className="w-full" onClick={onPurchase} disabled={purchaseLoading}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          {purchaseLoading ? 'Processing...' : 'Buy'}
        </Button>
      </CardContent>
    </Card>
  )
}
