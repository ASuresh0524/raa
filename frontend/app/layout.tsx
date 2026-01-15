import '../styles/globals.css'

export const metadata = {
  title: 'Credentialing Passport',
  description: 'Universal clinician credentialing & enrollment platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}


