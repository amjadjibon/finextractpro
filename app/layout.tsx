import "@/app/globals.css"
import type { ReactNode } from "react"
import { AuthProvider } from "@/components/providers/auth-provider"

export const metadata = {
  title: "FinanceExtract Pro",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
