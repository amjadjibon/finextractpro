import "@/app/globals.css"
import type { ReactNode } from "react"
import type { Metadata } from "next"
import { Analytics } from '@vercel/analytics/react'
import { AuthProvider } from "@/components/providers/auth-provider"

export const metadata: Metadata = {
  title: {
    default: "FinExtractPro - AI-Powered Financial Document Processing",
    template: "%s | FinExtractPro"
  },
  description: "Transform your financial document processing with AI. Extract data from PDFs with 99% accuracy, automate manual tasks, and save hours of work. 14-day free trial.",
  keywords: [
    "financial document processing",
    "AI PDF extraction",
    "automated data entry",
    "financial document automation",
    "PDF to Excel conversion",
    "document processing software",
    "AI financial tools",
    "financial data extraction",
    "invoice processing",
    "financial statement processing"
  ],
  authors: [{ name: "FinExtractPro Team" }],
  creator: "FinExtractPro",
  publisher: "FinExtractPro",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://finextractpro.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://finextractpro.vercel.app',
    title: 'FinExtractPro - AI-Powered Financial Document Processing',
    description: 'Transform your financial document processing with AI. Extract data from PDFs with 99% accuracy, automate manual tasks, and save hours of work.',
    siteName: 'FinExtractPro',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FinExtractPro - AI-Powered Financial Document Processing',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FinExtractPro - AI-Powered Financial Document Processing',
    description: 'Transform your financial document processing with AI. Extract data from PDFs with 99% accuracy in minutes.',
    images: ['/twitter-image.png'],
    creator: '@finextractpro',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'nAznJaBX9gUiuYApLspFkjK1hkTj3KiQZk6Q9dc2JBw',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
