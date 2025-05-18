'use client'
import { Building2, Users, Link as LinkIcon, Database } from 'lucide-react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ConnectWallet } from '@/components/connectWallet'
import { getItems } from '@/services/marketplace'
import { createPublicClient, http, formatEther } from 'viem'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

const Tokens = dynamic(() => import('./tokens/page'))

export default function Marketplace() {
  const [isLoading, setIsLoading] = useState(true)
  const [items, setItems] = useState<any>(null)
  const [showTokens, setShowTokens] = useState(false)
  const [blockchainData, setBlockchainData] = useState<{
    blockNumber?: bigint
    gasPrice?: bigint
    timestamp?: number
  }>({})

  useEffect(() => {
    const fetchData = async () => {
      const newData = await getItems()
      setItems(newData)
      setIsLoading(false)

      // Get blockchain data
      const client = createPublicClient({
        transport: http(process.env.NEXT_PUBLIC_BLOCKCHAIN_RPC),
      })

      try {
        const [blockNumber, gasPrice] = await Promise.all([
          client.getBlockNumber(),
          client.getGasPrice(),
        ])

        const block = await client.getBlock({ blockNumber })

        setBlockchainData({
          blockNumber,
          gasPrice,
          timestamp: Number(block.timestamp),
        })
      } catch (error) {
        console.error('Error fetching blockchain data:', error)
      }
    }

    fetchData()
  }, [])

  const handleNavigateToTokens = () => {
    setShowTokens(true)
  }

  if (showTokens && items) {
    return <Tokens tokens={items} />
  }

  // Format timestamp to readable date
  const formattedDate = blockchainData.timestamp
    ? new Date(blockchainData.timestamp * 1000).toLocaleString()
    : 'Loading...'

  // Get contract address and explorer URL
  const contractAddress = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS
  const explorerBaseUrl =
    process.env.NEXT_PUBLIC_EXPLORER_URL || 'https://sepolia.etherscan.io/address/'
  const explorerUrl = contractAddress ? `${explorerBaseUrl}${contractAddress}` : '#'

  return (
    <div className="space-y-6 container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Securitize Marketplace</h1>
      <div className="flex justify-end">
        <div className="flex items-center space-x-2">
          <ConnectWallet />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

        {/* Contract Address Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contract Address</CardTitle>
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline break-all flex items-center"
            >
              {contractAddress ? contractAddress : 'Loading...'}
              <LinkIcon className="h-3 w-3 ml-1 inline" />
            </a>
            <CardDescription className="mt-2 text-xs">Click to view on explorer</CardDescription>
          </CardContent>
        </Card>

        {/* Blockchain Data Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blockchain Data</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-xs text-muted-foreground">Block:</div>
              <div className="text-xs font-medium text-right">
                {blockchainData.blockNumber?.toString() || 'Loading...'}
              </div>

              <div className="text-xs text-muted-foreground">Gas Price:</div>
              <div className="text-xs font-medium text-right">
                {blockchainData.gasPrice
                  ? `${Number(formatEther(blockchainData.gasPrice)).toFixed(9)} ETH`
                  : 'Loading...'}
              </div>

              <div className="text-xs text-muted-foreground">Last Updated:</div>
              <div className="text-xs font-medium text-right">{formattedDate}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
