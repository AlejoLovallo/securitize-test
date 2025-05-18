'use client'
import { Building2, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConnectWallet } from '@/components/connectWallet'
import { getItems } from '@/services/marketplace'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

const Tokens = dynamic(() => import('./tokens/page'))

export default function Marketplace() {
  const [isLoading, setIsLoading] = useState(true)
  const [items, setItems] = useState<any>(null)
  const [showTokens, setShowTokens] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const newData = await getItems()
      setItems(newData)
      setIsLoading(false)
    }

    fetchData()
  }, [])

  const handleNavigateToTokens = () => {
    setShowTokens(true)
  }

  if (showTokens && items) {
    return <Tokens tokens={items} />
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Securitize Marketplace</h1>
      <div className="flex justify-end">
        <div className="flex items-center space-x-2">
          <ConnectWallet />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card
          className="cursor-pointer hover:opacity-90 transition-opacity"
          onClick={handleNavigateToTokens}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? 'Loading...' : (items?.length ?? 0)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
