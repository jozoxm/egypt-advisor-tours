import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Egypt Advisor Tours — Admin',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
