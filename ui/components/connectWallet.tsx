'use client'
import { useEffect, useState } from 'react'
import { Connector, useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'

export function ConnectWallet() {
  const [mounted, setMounted] = useState(false)
  const { connectors, connect } = useConnect()
  const { disconnect } = useDisconnect()
  const { isConnected, address } = useAccount()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <Button variant="outline">Connect Wallet</Button>
  }

  if (isConnected && address) {
    return (
      <Button variant="outline" onClick={() => disconnect()}>
        {`${address.slice(0, 6)}...${address.slice(-4)}`}
      </Button>
    )
  }

  return connectors.map((connector) => (
    <WalletOption
      key={connector.uid}
      connector={connector}
      onClick={() => connect({ connector })}
    />
  ))
}

function WalletOption({ connector, onClick }: { connector: Connector; onClick: () => void }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    ;(async () => {
      const provider = await connector.getProvider()
      setReady(!!provider)
    })()
  }, [connector])

  return (
    <Button variant="outline" disabled={!ready} onClick={onClick}>
      {connector.name}
    </Button>
  )
}
