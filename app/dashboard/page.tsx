"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Upload,
  Plus,
  HelpCircle,
  TrendingUp,
  Clock,
  Target,
  LayoutTemplateIcon as Template,
  Download,
  Eye,
  CheckCircle,
  AlertCircle,
  Loader,
  FileText,
} from "lucide-react"

export default function Dashboard() {
  const recentDocuments = [
    { name: "Invoice_Q3_2024.pdf", status: "complete", date: "2 hours ago" },
    { name: "Bank_Statement_Dec.pdf", status: "processing", date: "4 hours ago" },
    { name: "Tax_Form_1120.pdf", status: "complete", date: "1 day ago" },
    { name: "Expense_Report_Q4.pdf", status: "error", date: "2 days ago" },
    { name: "Balance_Sheet_2024.pdf", status: "complete", date: "3 days ago" },
  ]

  const recentActivity = [
    {
      name: "Q3_Financial_Report_2024.pdf",
      date: "2024-01-15 14:30",
      status: "complete",
      accuracy: "99.2%",
    },
    {
      name: "Invoice_Template_001.pdf",
      date: "2024-01-15 13:45",
      status: "complete",
      accuracy: "98.7%",
    },
    {
      name: "Bank_Statement_Dec.pdf",
      date: "2024-01-15 12:20",
      status: "processing",
      accuracy: "--",
    },
    {
      name: "Tax_Form_1120.pdf",
      date: "2024-01-15 11:15",
      status: "complete",
      accuracy: "99.4%",
    },
    {
      name: "Expense_Report_Q4.pdf",
      date: "2024-01-15 10:30",
      status: "error",
      accuracy: "--",
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "complete":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "processing":
        return <Loader className="w-4 h-4 text-blue-500 animate-spin" />
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "complete":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Complete</Badge>
      case "processing":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Processing</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Error</Badge>
      default:
        return null
    }
  }

  return (
    <div className="p-6">
      {/* Welcome Message */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, John!</h1>
        <p className="text-gray-600 mt-2">Here's what's happening with your document processing today.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents Processed</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.2%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline w-3 h-3 mr-1 text-green-600" />
              trending up
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156 hrs</div>
            <p className="text-xs text-muted-foreground">$5,460 value saved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates Created</CardTitle>
            <Template className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">23 total uses</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest document processing results</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Name</TableHead>
                    <TableHead>Date Processed</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentActivity.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>{item.accuracy}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Stats */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-blue-900 hover:bg-blue-800">
                <Upload className="w-4 h-4 mr-2" />
                Upload Documents
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Plus className="w-4 h-4 mr-2" />
                New Batch
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Template className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </CardContent>
          </Card>

          {/* Recent Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                      <p className="text-xs text-gray-500">{doc.date}</p>
                    </div>
                    {getStatusIcon(doc.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Storage Usage */}
          <Card>
            <CardHeader>
              <CardTitle>Storage Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={68} className="mb-2" />
              <p className="text-sm text-gray-600">6.8 GB of 10 GB used</p>
            </CardContent>
          </Card>

          {/* Quick Start */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Start</CardTitle>
              <CardDescription>Get started with FinExtractPro</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Account setup complete</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">First document uploaded</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                  <span className="text-sm text-gray-500">Create your first template</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                  <span className="text-sm text-gray-500">Set up batch processing</span>
                </div>
              </div>
              <Button className="w-full bg-blue-900 hover:bg-blue-800">Continue Tutorial</Button>
            </CardContent>
          </Card>

          {/* Help Widget */}
          <Card>
            <CardContent className="p-4">
              <Button variant="ghost" className="w-full justify-start text-gray-600">
                <HelpCircle className="w-4 h-4 mr-2" />
                Help & Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
