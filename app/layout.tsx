import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SongShowcase',
  description: 'Your Spotify top artists, tracks and playlists.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
      {children}
        </body>
    </html>
  )
}
