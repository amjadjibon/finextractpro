import { SignUpForm } from "@/components/auth/signup-form"
import { FileText } from "lucide-react"
import Link from "next/link"

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="w-8 h-8 bg-linear-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-md">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-gray-900">FinExtractPro</span>
          </Link>
        </div>

        {/* Sign Up Form */}
        <SignUpForm />

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>© 2024 FinExtractPro. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}