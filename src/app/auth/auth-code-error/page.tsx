import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, FileText } from 'lucide-react'

export default function AuthCodeError() {
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

        {/* Error Card */}
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-900">Authentication Error</CardTitle>
            <CardDescription>
              Sorry, we couldn&apos;t complete your authentication. This could be due to an expired or invalid link.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              Please try signing in again. If the problem persists, contact support.
            </p>
            <div className="space-y-2">
              <Link href="/auth/signin" className="block">
                <Button className="w-full">
                  Try Again
                </Button>
              </Link>
              <Link href="/" className="block">
                <Button variant="outline" className="w-full">
                  Go Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>© 2024 FinExtractPro. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}