"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Download,
  FileSpreadsheet,
  Database,
  Code,
  Send,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  MoreVertical,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function ExportsPage() {
  const exports = [
    {
      id: "1",
      name: "Q3_Financial_Reports_Export",
      type: "Excel",
      documents: 15,
      status: "completed",
      date: "2024-01-15 14:30",
      size: "2.4 MB",
    },
    {
      id: "2",
      name: "Invoice_Batch_January",
      type: "CSV",
      documents: 47,
      status: "completed",
      date: "2024-01-15 13:45",
      size: "1.8 MB",
    },
    {
      id: "3",
      name: "Tax_Documents_2024",
      type: "JSON",
      documents: 8,
      status: "processing",
      date: "2024-01-15 12:20",
      size: "--",
    },
    {
      id: "4",
      name: "Bank_Statements_Q4",
      type: "Excel",
      documents: 23,
      status: "completed",
      date: "2024-01-15 11:15",
      size: "3.2 MB",
    },
    {
      id: "5",
      name: "Expense_Reports_December",
      type: "QuickBooks",
      documents: 31,
      status: "failed",
      date: "2024-01-15 10:30",
      size: "--",
    },
    {
      id: "6",
      name: "Vendor_Invoices_Export",
      type: "CSV",
      documents: 19,
      status: "completed",
      date: "2024-01-14 16:45",
      size: "1.1 MB",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
      case "processing":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Processing</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>
      default:
        return null
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "processing":
        return <Clock className="w-4 h-4 text-blue-500" />
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Excel":
        return <FileSpreadsheet className="w-4 h-4 text-green-600" />
      case "CSV":
        return <Database className="w-4 h-4 text-blue-600" />
      case "JSON":
        return <Code className="w-4 h-4 text-purple-600" />
      case "QuickBooks":
        return <Send className="w-4 h-4 text-orange-600" />
      default:
        return <Download className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Exports</h1>
            <p className="text-gray-600 mt-1">Manage and download your exported data</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button className="bg-blue-900 hover:bg-blue-800">
              <Download className="w-4 h-4 mr-2" />
              New Export
            </Button>
          </div>
        </div>
      </div>

      {/* Export Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exports</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">+8 this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents Exported</CardTitle>
            <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Volume</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.3 GB</div>
            <p className="text-xs text-muted-foreground">Total exported</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.2%</div>
            <p className="text-xs text-muted-foreground">Export success rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Export Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Quick Export</CardTitle>
          <CardDescription>Create a new export from your processed documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col space-y-2 bg-transparent">
              <FileSpreadsheet className="w-6 h-6 text-green-600" />
              <span>Export to Excel</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2 bg-transparent">
              <Database className="w-6 h-6 text-blue-600" />
              <span>Export to CSV</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2 bg-transparent">
              <Code className="w-6 h-6 text-purple-600" />
              <span>Export to JSON</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2 bg-transparent">
              <Send className="w-6 h-6 text-orange-600" />
              <span>Send to QuickBooks</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="Search exports..." className="pl-10" />
            </div>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Export Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="quickbooks">QuickBooks</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Exports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Export History</CardTitle>
          <CardDescription>View and manage your export history</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Export Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exports.map((exportItem) => (
                <TableRow key={exportItem.id}>
                  <TableCell className="font-medium">{exportItem.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(exportItem.type)}
                      <span>{exportItem.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>{exportItem.documents}</TableCell>
                  <TableCell>{getStatusBadge(exportItem.status)}</TableCell>
                  <TableCell>{exportItem.date}</TableCell>
                  <TableCell>{exportItem.size}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {exportItem.status === "completed" && (
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {exportItem.status === "completed" && (
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          {exportItem.status === "failed" && <DropdownMenuItem>Retry Export</DropdownMenuItem>}
                          <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
