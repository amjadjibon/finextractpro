import { SignInForm } from "@/components/auth/signin-form"
import { FileText } from "lucide-react"
import Link from "next/link"

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">FinExtractPro</span>
          </Link>
        </div>

        {/* Sign In Form */}
        <SignInForm />

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>© 2024 FinExtractPro. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
