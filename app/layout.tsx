import '../styles/globals.css'

export const metadata = {
  title: 'ePluris',
  description: 'Search U.S. Government Data & Policy',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
