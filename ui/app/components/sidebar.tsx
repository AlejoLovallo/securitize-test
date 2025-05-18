import { Building2, Home, Users } from 'lucide-react'
import Link from 'next/link'

export function Sidebar() {
  return (
    <div className="w-64 bg-card text-card-foreground p-4 space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div className="text-2xl font-bold">Securitize Marketplace</div>
      </div>
      <nav className="space-y-2">
        <Link href="/" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent">
          <Home className="w-5 h-5" />
          <span>Dashboard</span>
        </Link>
        <Link href="/tokens" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent">
          <Building2 className="w-5 h-5" />
          <span>Tokens</span>
        </Link>
        <Link href="/seller" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent">
          <Users className="w-5 h-5" />
          <span>Seller</span>
        </Link>
      </nav>
    </div>
  )
}
