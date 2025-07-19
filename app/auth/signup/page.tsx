"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { FileText } from "lucide-react"

export default function SignUpPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to sign-in page since we only support Google OAuth
    router.replace("/auth/signin")
  }, [router])

  return (
    <div className="min-h-screen bg-linear-to-br from-primary/5 via-white to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Logo */}
        <div className="inline-flex items-center space-x-2">
          <div className="w-10 h-10 bg-linear-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-gray-900">FinExtractPro</span>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Redirecting...</h1>
          <p className="text-gray-600">
            We now use Google sign-in for all accounts. Redirecting you to the sign-in page.
          </p>
        </div>
      </div>
    </div>
  )
}
