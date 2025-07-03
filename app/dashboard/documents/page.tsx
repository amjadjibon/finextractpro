"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  FileText,
  Upload,
  Search,
  Grid3X3,
  List,
  MoreVertical,
  Download,
  Eye,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"

export default function DocumentsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const documents = [
    {
      id: "1",
      name: "Q3_Financial_Report_2024.pdf",
      size: "2.4 MB",
      status: "complete",
      accuracy: "99.2%",
      date: "2 hours ago",
      type: "Financial Report",
    },
    {
      id: "2",
      name: "Invoice_Template_001.pdf",
      size: "1.2 MB",
      status: "complete",
      accuracy: "98.7%",
      date: "4 hours ago",
      type: "Invoice",
    },
    {
      id: "3",
      name: "Bank_Statement_Dec.pdf",
      size: "3.1 MB",
      status: "processing",
      accuracy: "--",
      date: "6 hours ago",
      type: "Bank Statement",
    },
    {
      id: "4",
      name: "Tax_Form_1120.pdf",
      size: "856 KB",
      status: "complete",
      accuracy: "99.4%",
      date: "1 day ago",
      type: "Tax Form",
    },
    {
      id: "5",
      name: "Expense_Report_Q4.pdf",
      size: "2.7 MB",
      status: "error",
      accuracy: "--",
      date: "1 day ago",
      type: "Expense Report",
    },
    {
      id: "6",
      name: "Balance_Sheet_2024.pdf",
      size: "1.8 MB",
      status: "complete",
      accuracy: "99.1%",
      date: "2 days ago",
      type: "Balance Sheet",
    },
    {
      id: "7",
      name: "Payroll_Summary_Jan.pdf",
      size: "1.5 MB",
      status: "complete",
      accuracy: "98.9%",
      date: "3 days ago",
      type: "Payroll",
    },
    {
      id: "8",
      name: "Contract_Agreement_2024.pdf",
      size: "3.2 MB",
      status: "complete",
      accuracy: "97.8%",
      date: "3 days ago",
      type: "Contract",
    },
    {
      id: "9",
      name: "Receipt_Office_Supplies.pdf",
      size: "945 KB",
      status: "processing",
      accuracy: "--",
      date: "4 days ago",
      type: "Receipt",
    },
    {
      id: "10",
      name: "Insurance_Policy_2024.pdf",
      size: "2.1 MB",
      status: "complete",
      accuracy: "99.6%",
      date: "5 days ago",
      type: "Insurance",
    },
    {
      id: "11",
      name: "Audit_Report_Q3.pdf",
      size: "4.2 MB",
      status: "complete",
      accuracy: "98.3%",
      date: "1 week ago",
      type: "Audit Report",
    },
    {
      id: "12",
      name: "Vendor_Invoice_ABC.pdf",
      size: "1.7 MB",
      status: "error",
      accuracy: "--",
      date: "1 week ago",
      type: "Invoice",
    },
  ]

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
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
            <p className="text-gray-600 mt-1">127 documents</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Bulk Actions
                  <MoreVertical className="ml-2 w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Export All</DropdownMenuItem>
                <DropdownMenuItem>Delete Selected</DropdownMenuItem>
                <DropdownMenuItem>Create Template</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/dashboard/documents/upload">
              <Button className="bg-blue-900 hover:bg-blue-800">
                <Upload className="w-4 h-4 mr-2" />
                Upload New Documents
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder="Search documents..." className="pl-10 w-64" />
              </div>
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
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Document Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="bank">Bank Statement</SelectItem>
                  <SelectItem value="tax">Tax Form</SelectItem>
                  <SelectItem value="expense">Expense Report</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="complete">Complete</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Controls */}
            <div className="flex items-center space-x-4">
              <Select>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recent</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="accuracy">Accuracy</SelectItem>
                  <SelectItem value="size">File Size</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex border border-gray-300 rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Grid */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
          {documents.map((doc) => (
            <Card key={doc.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-4">
                {/* Document Preview */}
                <div className="bg-gray-100 rounded-lg p-6 mb-4 flex items-center justify-center h-32">
                  <FileText className="w-12 h-12 text-gray-400" />
                </div>

                {/* Document Info */}
                <div className="space-y-2">
                  <h3 className="font-medium text-sm text-gray-900 truncate" title={doc.name}>
                    {doc.name}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{doc.size}</span>
                    <span>{doc.date}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    {getStatusBadge(doc.status)}
                    {doc.accuracy !== "--" && <span className="text-sm font-medium text-gray-900">{doc.accuracy}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Download</DropdownMenuItem>
                      <DropdownMenuItem>Reprocess</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="mb-6">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Accuracy
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(doc.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doc.accuracy}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.size}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Download</DropdownMenuItem>
                              <DropdownMenuItem>Reprocess</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">Showing 1-12 of 127 documents</div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <Button variant="outline" size="sm" className="bg-blue-900 text-white">
            1
          </Button>
          <Button variant="outline" size="sm">
            2
          </Button>
          <Button variant="outline" size="sm">
            3
          </Button>
          <span className="text-gray-500">...</span>
          <Button variant="outline" size="sm">
            11
          </Button>
          <Button variant="outline" size="sm">
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
