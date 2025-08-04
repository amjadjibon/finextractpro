"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/providers/auth-provider"
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

interface DashboardStats {
  totalDocuments: number
  processedToday: number
  pendingReview: number
  totalExports: number
}

interface RecentActivity {
  id: string
  type: string
  document: string
  status: string
  timestamp: string
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalDocuments: 0,
    processedToday: 0,
    pendingReview: 0,
    totalExports: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch documents statistics
        const documentsResponse = await fetch('/api/documents?limit=100')
        if (documentsResponse.ok) {
          const documentsData = await documentsResponse.json()
          const documents = documentsData.documents || []
          
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          
          const processedToday = documents.filter((doc: any) => {
            if (!doc.processedDate) return false
            const processedDate = new Date(doc.processedDate)
            processedDate.setHours(0, 0, 0, 0)
            return processedDate.getTime() === today.getTime()
          }).length
          
          const pendingReview = documents.filter((doc: any) => 
            doc.status === 'processing' || doc.status === 'uploaded'
          ).length

          // Fetch exports statistics
          const exportsResponse = await fetch('/api/exports?limit=100')
          let totalExports = 0
          if (exportsResponse.ok) {
            const exportsData = await exportsResponse.json()
            totalExports = exportsData.pagination?.total || 0
          }

          setStats({
            totalDocuments: documentsData.pagination?.total || documents.length,
            processedToday,
            pendingReview,
            totalExports
          })

          // Create recent activity from documents
          const recentDocs = documents
            .sort((a: any, b: any) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
            .slice(0, 5)
            .map((doc: any) => ({
              id: doc.id,
              type: doc.status === 'completed' ? 'processing' : 'upload',
              document: doc.name,
              status: doc.status,
              timestamp: formatTimeAgo(doc.uploadDate)
            }))

          setRecentActivity(recentDocs)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days} day${days === 1 ? '' : 's'} ago`
    if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'} ago`
    return 'Just now'
  }

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

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
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
            <p className="text-xs text-muted-foreground">Documents in your library</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processed Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.processedToday}</div>
            <p className="text-xs text-muted-foreground">Documents processed today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReview}</div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exports</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalExports}</div>
            <p className="text-xs text-muted-foreground">Export jobs created</p>
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
              <Button className="w-full h-24 flex flex-col gap-2 bg-primary hover:bg-primary/90">
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
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
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
                    <Link href={`/dashboard/documents/${activity.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No recent activity</p>
                <p className="text-sm">Upload your first document to get started</p>
              </div>
            )}
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
