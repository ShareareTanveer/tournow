import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import PublicLayout from '@/components/layout/PublicLayout'
import { CustomerAuthProvider } from '@/lib/customerAuth'
import NotificationListener from '@/components/NotificationListener'

const inter = Inter({ subsets: ['latin'] })

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.metrovoyage.com'

export const metadata: Metadata = {
  title: {
    default: 'Metro Voyage – Your Dream Holiday Starts Here',
    template: '%s | Metro Voyage',
  },
  description:
    'Metro Voyage crafts personalized travel packages from Sri Lanka. Family, honeymoon, solo, squad & corporate packages to 50+ countries. SLTDA licensed.',
  keywords: ['travel packages Sri Lanka', 'holiday packages', 'honeymoon packages', 'family tours', 'Dubai tours Sri Lanka', 'international tours Sri Lanka'],
  metadataBase: new URL(BASE_URL),
  alternates: { canonical: BASE_URL },
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: 'Metro Voyage',
    title: 'Metro Voyage – Your Dream Holiday Starts Here',
    description: 'Personalized travel packages from Sri Lanka to 50+ destinations worldwide.',
    images: [{ url: `${BASE_URL}/og-default.jpg`, width: 1200, height: 630, alt: 'Metro Voyage Travel' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Metro Voyage – Your Dream Holiday Starts Here',
    description: 'Personalized travel packages from Sri Lanka to 50+ destinations worldwide.',
    images: [`${BASE_URL}/og-default.jpg`],
  },
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'TravelAgency',
  name: 'Metro Voyage',
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  description: 'Metro Voyage crafts personalized travel packages from Sri Lanka to 50+ countries worldwide. SLTDA licensed.',
  telephone: '+94704545455',
  email: 'info@metrovoyage.com',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'LK',
  },
  sameAs: [],
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Metro Voyage',
  url: BASE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${BASE_URL}/packages-from-sri-lanka/family?search={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${inter.className} min-h-full flex flex-col bg-white`}>
        <Script id="schema-organization" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <Script id="schema-website" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        <CustomerAuthProvider>
          <PublicLayout>{children}</PublicLayout>
          <NotificationListener />
        </CustomerAuthProvider>
      </body>
    </html>
  )
}
