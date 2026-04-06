import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'onFORMAT - Production Operating System',
  description: 'Production planning and organization for photographers, videographers, and creative professionals.',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';

import { ThemeProvider } from '@/components/ThemeProvider';
import { BetaFeedbackTrigger } from '@/components/feedback/BetaFeedbackTrigger';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body suppressHydrationWarning className="font-sans antialiased bg-zinc-50 text-zinc-900 w-full max-w-[100vw] overflow-x-hidden">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
