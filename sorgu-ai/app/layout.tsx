import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Teazer Sorgu AI',
  description: 'Created with TeazerEngine',
  generator: 'TeazerEngine',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
