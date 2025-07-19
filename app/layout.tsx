import "@/app/globals.css"
import type { ReactNode } from "react"

export const metadata = {
  title: "FinanceExtract Pro",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
