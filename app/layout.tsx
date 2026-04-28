import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { Toaster } from '@/components/ui/toaster'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ServiceWorkerRegistrar } from '@/components/ServiceWorkerRegistrar'

export const metadata: Metadata = {
  title: {
    default: 'ChessMaster Pro — Chess for Technical Interview Prep',
    template: '%s | ChessMaster Pro',
  },
  description:
    'Gamified chess platform for FAANG technical interview preparation. Learn algorithms and problem-solving through chess puzzles.',
  keywords: ['chess', 'technical interview', 'algorithm', 'FAANG', 'LeetCode', 'coding interview'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'ChessMaster Pro',
    description: 'LeetCode meets Chess. Master technical interviews through chess puzzles.',
    siteName: 'ChessMaster Pro',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
        <ServiceWorkerRegistrar />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
