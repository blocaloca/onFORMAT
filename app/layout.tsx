import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'onFORMAT - Production Operating System',
  description: 'Production planning and organization for photographers, videographers, and creative professionals.',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    viewportFit: 'cover',
  },
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
      <body className="font-sans antialiased">
        <ThemeProvider>
          {children}
          <BetaFeedbackTrigger />
        </ThemeProvider>
      </body>
    </html>
  )
}
