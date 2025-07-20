"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Download,
  Plus,
  Search,
  Filter,
  Calendar,
  FileText,
  FileSpreadsheet,
  Database,
  Archive,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  RefreshCw,
  Settings,
  Trash2,
  Eye,
  Share,
  Copy,
} from "lucide-react"

// Mock data - replace with real API data
const mockExports = [
  {
    id: 1,
    name: "Invoice_Data_Q1_2024.xlsx",
    type: "spreadsheet",
    format: "xlsx",
    status: "completed",
    size: "2.4 MB",
    records: 124,
    createdDate: "2024-01-15",
    completedDate: "2024-01-15",
    downloadCount: 3,
    expiresDate: "2024-02-15",
    includeFields: ["Invoice Number", "Date", "Amount", "Vendor"],
    filters: "Status: Completed, Date: Jan 2024",
  },
  {
    id: 2,
    name: "Bank_Transactions_Export.csv",
    type: "csv",
    format: "csv",
    status: "processing",
    size: "0 MB",
    records: 0,
    createdDate: "2024-01-14",
    completedDate: null,
    downloadCount: 0,
    expiresDate: "2024-02-14",
    includeFields: ["Date", "Amount", "Description", "Category"],
    filters: "Type: Bank Statement",
  },
  {
    id: 3,
    name: "Tax_Documents_Archive.zip",
    type: "archive",
    format: "zip",
    status: "completed",
    size: "15.7 MB",
    records: 23,
    createdDate: "2024-01-12",
    completedDate: "2024-01-12",
    downloadCount: 1,
    expiresDate: "2024-02-12",
    includeFields: ["All Fields", "Original Files"],
    filters: "Type: Tax Form",
  },
  {
    id: 4,
    name: "Receipts_Summary_Report.pdf",
    type: "report",
    format: "pdf",
    status: "failed",
    size: "0 MB",
    records: 0,
    createdDate: "2024-01-10",
    completedDate: null,
    downloadCount: 0,
    expiresDate: "2024-02-10",
    includeFields: ["Summary Statistics"],
    filters: "Type: Receipt, Date: Last 30 days",
  },
  {
    id: 5,
    name: "Financial_Data_Complete.json",
    type: "api",
    format: "json",
    status: "completed",
    size: "8.3 MB",
    records: 567,
    createdDate: "2024-01-08",
    completedDate: "2024-01-08",
    downloadCount: 7,
    expiresDate: "2024-02-08",
    includeFields: ["All Available Fields"],
    filters: "All Documents",
  },
]

export default function ExportsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  
  // New export form state
  const [exportConfig, setExportConfig] = useState({
    name: "",
    format: "xlsx",
    includeOriginals: false,
    dateRange: "all",
    documentTypes: ["all"],
    fields: ["all"],
    compression: false,
  })

  const filteredExports = mockExports.filter((exp) => {
    const matchesSearch = exp.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || exp.status === statusFilter
    const matchesType = typeFilter === "all" || exp.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "processing":
        return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "default",
      processing: "secondary",
      failed: "destructive"
    } as const
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status}
      </Badge>
    )
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "spreadsheet":
        return <FileSpreadsheet className="w-4 h-4 text-green-600" />
      case "csv":
        return <FileText className="w-4 h-4 text-blue-600" />
      case "archive":
        return <Archive className="w-4 h-4 text-purple-600" />
      case "report":
        return <FileText className="w-4 h-4 text-red-600" />
      case "api":
        return <Database className="w-4 h-4 text-orange-600" />
      default:
        return <FileText className="w-4 h-4 text-gray-600" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const handleCreateExport = () => {
    console.log("Creating export:", exportConfig)
    setIsCreateDialogOpen(false)
    // Add export creation logic here
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Exports</h1>
            <p className="text-gray-600 mt-1">
              Download and manage your document data exports
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Create Export
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Export</DialogTitle>
                <DialogDescription>
                  Configure your data export settings and format preferences
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="export-name">Export Name</Label>
                    <Input
                      id="export-name"
                      value={exportConfig.name}
                      onChange={(e) => setExportConfig({...exportConfig, name: e.target.value})}
                      placeholder="My Export"
                    />
                  </div>
                  <div>
                    <Label htmlFor="export-format">Format</Label>
                    <Select value={exportConfig.format} onValueChange={(value) => setExportConfig({...exportConfig, format: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="xlsx">Excel Spreadsheet (.xlsx)</SelectItem>
                        <SelectItem value="csv">CSV File (.csv)</SelectItem>
                        <SelectItem value="json">JSON Data (.json)</SelectItem>
                        <SelectItem value="pdf">PDF Report (.pdf)</SelectItem>
                        <SelectItem value="zip">Archive with Originals (.zip)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date-range">Date Range</Label>
                    <Select value={exportConfig.dateRange} onValueChange={(value) => setExportConfig({...exportConfig, dateRange: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">Last 7 Days</SelectItem>
                        <SelectItem value="month">Last 30 Days</SelectItem>
                        <SelectItem value="quarter">Last 3 Months</SelectItem>
                        <SelectItem value="year">Last Year</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="document-types">Document Types</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="invoice">Invoices</SelectItem>
                        <SelectItem value="receipt">Receipts</SelectItem>
                        <SelectItem value="bank-statement">Bank Statements</SelectItem>
                        <SelectItem value="tax-form">Tax Forms</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Fields to Include</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-sm">Document Name</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-sm">Upload Date</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-sm">Document Type</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-sm">Processing Status</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-sm">Extracted Fields</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Confidence Scores</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Include Original Files</Label>
                      <p className="text-sm text-gray-500">Include original uploaded files in export</p>
                    </div>
                    <Switch
                      checked={exportConfig.includeOriginals}
                      onCheckedChange={(checked) => setExportConfig({...exportConfig, includeOriginals: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Compress Export</Label>
                      <p className="text-sm text-gray-500">Create a compressed archive</p>
                    </div>
                    <Switch
                      checked={exportConfig.compression}
                      onCheckedChange={(checked) => setExportConfig({...exportConfig, compression: checked})}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateExport}>
                  Create Export
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Exports</p>
                <p className="text-2xl font-bold">{mockExports.length}</p>
              </div>
              <Download className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {mockExports.filter(e => e.status === "completed").length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {mockExports.filter(e => e.status === "processing").length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Downloads</p>
                <p className="text-2xl font-bold text-blue-600">
                  {mockExports.reduce((sum, e) => sum + e.downloadCount, 0)}
                </p>
              </div>
              <RefreshCw className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="exports" className="space-y-6">
        <TabsList>
          <TabsTrigger value="exports">Export History</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Exports</TabsTrigger>
          <TabsTrigger value="templates">Export Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="exports" className="space-y-6">
          {/* Filters and Search */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4 items-center">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder="Search exports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" />
                        Status: {statusFilter === "all" ? "All" : statusFilter}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                        All Statuses
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter("completed")}>
                        Completed
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter("processing")}>
                        Processing
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter("failed")}>
                        Failed
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" />
                        Type: {typeFilter === "all" ? "All" : typeFilter}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setTypeFilter("all")}>
                        All Types
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTypeFilter("spreadsheet")}>
                        Spreadsheet
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTypeFilter("csv")}>
                        CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTypeFilter("archive")}>
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTypeFilter("report")}>
                        Report
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTypeFilter("api")}>
                        JSON/API
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exports Table */}
          <Card>
            <CardHeader>
              <CardTitle>Export History ({filteredExports.length})</CardTitle>
              <CardDescription>
                View and download your exported data files
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Export</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Records</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Downloads</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExports.map((exp) => (
                    <TableRow key={exp.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {getTypeIcon(exp.type)}
                          <div>
                            <div className="font-medium">{exp.name}</div>
                            <div className="text-xs text-gray-500">{exp.format.toUpperCase()}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {exp.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(exp.status)}
                          {getStatusBadge(exp.status)}
                        </div>
                      </TableCell>
                      <TableCell>{exp.records > 0 ? exp.records.toLocaleString() : "-"}</TableCell>
                      <TableCell>{exp.size}</TableCell>
                      <TableCell>{formatDate(exp.createdDate)}</TableCell>
                      <TableCell>{exp.downloadCount}</TableCell>
                      <TableCell>{formatDate(exp.expiresDate)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {exp.status === "completed" && (
                              <>
                                <DropdownMenuItem>
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Share className="w-4 h-4 mr-2" />
                                  Share Link
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate Export
                            </DropdownMenuItem>
                            {exp.status === "processing" && (
                              <DropdownMenuItem>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Cancel
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredExports.length === 0 && (
                <div className="text-center py-12">
                  <Download className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No exports found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                      ? "Try adjusting your search or filters"
                      : "Create your first export to get started"}
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Export
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Exports</CardTitle>
              <CardDescription>
                Automate your data exports with recurring schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No scheduled exports</h3>
                <p className="text-gray-500 mb-4">
                  Set up automated exports to run daily, weekly, or monthly
                </p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Export
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Export Templates</CardTitle>
              <CardDescription>
                Save export configurations as reusable templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No export templates</h3>
                <p className="text-gray-500 mb-4">
                  Create templates to quickly export data with consistent settings
                </p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
