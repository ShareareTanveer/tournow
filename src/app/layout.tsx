import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import PublicLayout from '@/components/layout/PublicLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Metro Voyage – Your Dream Holiday Starts Here',
    template: '%s | Metro Voyage',
  },
  description:
    'Metro Voyage crafts personalized travel packages from Sri Lanka. Family, honeymoon, solo, squad & corporate packages to 50+ countries. SLTDA licensed.',
  keywords: ['travel packages Sri Lanka', 'holiday packages', 'honeymoon packages', 'family tours', 'Dubai tours Sri Lanka'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.metrovoyage.com',
    siteName: 'Metro Voyage',
    title: 'Metro Voyage – Your Dream Holiday Starts Here',
    description: 'Personalized travel packages from Sri Lanka to 50+ destinations worldwide.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${inter.className} min-h-full flex flex-col bg-white`}>
        <PublicLayout>{children}</PublicLayout>
      </body>
    </html>
  )
}
