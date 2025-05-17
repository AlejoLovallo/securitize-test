import './globals.css'

import { Inter } from 'next/font/google'

import { Sidebar } from './components/sidebar'
import { Providers } from '@/wallet/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Fonder Admin',
  description: 'Admin interface for Fonder - Financial Management System',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-foreground`}>
        <Providers>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
