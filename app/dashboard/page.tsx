/* --------------------------------------------
   ORIGINAL DASHBOARD IMPLEMENTATION (CLIENT)
---------------------------------------------*/
"use client"

import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Upload, 
  Download, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Plus,
  Eye
} from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  const { user } = useAuth()

  // Mock data - replace with real data from your API
  const stats = {
    totalDocuments: 24,
    processedToday: 8,
    pendingReview: 3,
    totalExports: 12
  }

  const recentActivity = [
    {
      id: 1,
      type: "upload",
      document: "Invoice_2024_001.pdf",
      status: "completed",
      timestamp: "2 hours ago"
    },
    {
      id: 2,
      type: "export",
      document: "Financial_Report_Q1.xlsx",
      status: "completed",
      timestamp: "4 hours ago"
    },
    {
      id: 3,
      type: "processing",
      document: "Receipt_Store_ABC.jpg",
      status: "pending",
      timestamp: "6 hours ago"
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "default",
      pending: "secondary",
      error: "destructive"
    } as const
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status}
      </Badge>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening with your financial documents today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDocuments}</div>
            <p className="text-xs text-muted-foreground">+2 from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processed Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.processedToday}</div>
            <p className="text-xs text-muted-foreground">+12% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReview}</div>
            <p className="text-xs text-muted-foreground">-1 from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exports</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalExports}</div>
            <p className="text-xs text-muted-foreground">+4 from last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with your most common tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/dashboard/documents/upload">
              <Button className="w-full h-24 flex flex-col gap-2 bg-blue-600 hover:bg-blue-700">
                <Upload className="w-6 h-6" />
                Upload Documents
              </Button>
            </Link>
            <Link href="/dashboard/templates/create">
              <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                <Plus className="w-6 h-6" />
                Create Template
              </Button>
            </Link>
            <Link href="/dashboard/exports">
              <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                <Download className="w-6 h-6" />
                View Exports
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest document processing activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(activity.status)}
                  <div>
                    <p className="font-medium">{activity.document}</p>
                    <p className="text-sm text-gray-500 capitalize">{activity.type} • {activity.timestamp}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(activity.status)}
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link href="/dashboard/documents">
              <Button variant="outline" className="w-full">
                View All Documents
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
