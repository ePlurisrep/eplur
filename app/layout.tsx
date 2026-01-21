import './globals.css'
import NavBar from '@/components/NavBar'

export const metadata = {
  title: 'ePluris',
  description: 'United States public record search',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NavBar />

        {/* PAGE CONTENT */}
        <main>{children}</main>
      </body>
    </html>
  )
}
