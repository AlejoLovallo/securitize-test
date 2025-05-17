'use client'
import { Building2, Users } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConnectWallet } from '@/components/connectWallet'
import { getItems } from '@/services/marketplace'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

export default function Marketplace() {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      const newData = await getItems()
      console.log('newData', newData)
      setData({ ...newData })
      setIsLoading(false)
    }

    fetchData()
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Securitize Marketplace</h1>
      <div className="flex justify-end">
        <div className="flex items-center space-x-2">
          <ConnectWallet />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? 'Loading...' : (data?.length ?? 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sellers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
