import './globals.css'
import { Providers } from './providers'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Wallet2FA - Decentralized Authentication',
  description: 'Replace SMS/email 2FA with secure crypto wallet signatures using SIWE',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}