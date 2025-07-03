"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Database,
  Code,
  Send,
  Save,
  RotateCcw,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Edit,
} from "lucide-react"
import Link from "next/link"

export default function ProcessingResults() {
  const [zoomLevel, setZoomLevel] = useState(100)
  const [activeTab, setActiveTab] = useState("structured")

  const extractedData = [
    { field: "Company Name", value: "ABC Corp", confidence: 99.8 },
    { field: "Report Date", value: "Q3 2024", confidence: 99.1 },
    { field: "Revenue", value: "$2,847,392", confidence: 99.9 },
    { field: "Expenses", value: "$1,923,481", confidence: 98.7 },
    { field: "Net Income", value: "$923,911", confidence: 99.2 },
    { field: "Total Assets", value: "$5,234,567", confidence: 98.9 },
    { field: "Total Liabilities", value: "$2,456,789", confidence: 99.3 },
    { field: "Shareholders Equity", value: "$2,777,778", confidence: 98.8 },
  ]

  const financialTables = [
    { name: "Income Statement", rows: 15, confidence: 98.5 },
    { name: "Balance Sheet", rows: 22, confidence: 99.1 },
    { name: "Cash Flow Statement", rows: 18, confidence: 97.8 },
  ]

  const errorCorrections = [
    {
      id: 1,
      field: "Report Date",
      issue: "Date format uncertain",
      confidence: 92.3,
      originalValue: "Q3 2024",
      suggestedValue: "2024-Q3",
    },
    {
      id: 2,
      field: "Operating Expenses",
      issue: "Amount partially obscured",
      confidence: 87.9,
      originalValue: "$1,923,481",
      suggestedValue: "$1,923,481",
    },
  ]

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 95) return "text-green-600"
    if (confidence >= 90) return "text-yellow-600"
    return "text-red-600"
  }

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 95) return "bg-green-100 text-green-800"
    if (confidence >= 90) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <Link href="/dashboard" className="hover:text-gray-700">
              Dashboard
            </Link>
            <span>/</span>
            <Link href="/documents" className="hover:text-gray-700">
              Documents
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Processing Results</span>
          </nav>

          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Q3_Financial_Report_2024.pdf</h1>
              <div className="flex items-center space-x-4 mt-2">
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Complete
                </Badge>
                <span className="text-sm text-gray-600">Overall accuracy: 99.2%</span>
                <span className="text-sm text-gray-600">Completed in 23 seconds</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-140px)]">
        {/* PDF Preview Panel */}
        <div className="w-2/5 bg-white border-r border-gray-200">
          {/* PDF Toolbar */}
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setZoomLevel(Math.max(50, zoomLevel - 25))}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium">{zoomLevel}%</span>
                <Button variant="outline" size="sm" onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm">Page 1 of 8</span>
                <Button variant="outline" size="sm">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* PDF Viewer */}
          <div className="p-4 overflow-auto h-full bg-gray-100">
            <div className="bg-white shadow-lg mx-auto" style={{ width: `${zoomLevel}%` }}>
              {/* Mock PDF Content with highlighted regions */}
              <div className="border border-gray-300 p-8 bg-white">
                <div className="space-y-6">
                  {/* Header with highlighted extraction */}
                  <div className="text-center border-b pb-4">
                    <div className="border-2 border-blue-500 bg-blue-50 p-2 inline-block">
                      <h2 className="text-2xl font-bold">Q3 FINANCIAL REPORT 2024</h2>
                      <p className="text-gray-600">ABC Corp</p>
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="border-2 border-blue-500 bg-blue-50 p-4">
                      <h3 className="font-semibold mb-3">Revenue Summary</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total Revenue:</span>
                          <span className="font-bold">$2,847,392</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Operating Expenses:</span>
                          <span>$1,923,481</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span>Net Income:</span>
                          <span className="font-bold">$923,911</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-2 border-blue-500 bg-blue-50 p-4">
                      <h3 className="font-semibold mb-3">Balance Sheet</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total Assets:</span>
                          <span className="font-bold">$5,234,567</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Liabilities:</span>
                          <span>$2,456,789</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span>Equity:</span>
                          <span className="font-bold">$2,777,778</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Table with highlighted extraction */}
                  <div className="border-2 border-blue-500 bg-blue-50 p-4">
                    <h3 className="font-semibold mb-3">Quarterly Performance</h3>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Metric</th>
                          <th className="text-right py-2">Q1</th>
                          <th className="text-right py-2">Q2</th>
                          <th className="text-right py-2">Q3</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="py-1">Revenue</td>
                          <td className="text-right py-1">$850,000</td>
                          <td className="text-right py-1">$920,000</td>
                          <td className="text-right py-1">$1,077,392</td>
                        </tr>
                        <tr>
                          <td className="py-1">Expenses</td>
                          <td className="text-right py-1">$580,000</td>
                          <td className="text-right py-1">$620,000</td>
                          <td className="text-right py-1">$723,481</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Extracted Data Panel */}
        <div className="flex-1 bg-white overflow-y-auto">
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="structured">Structured Data</TabsTrigger>
                <TabsTrigger value="tables">Financial Tables</TabsTrigger>
                <TabsTrigger value="export">Export Options</TabsTrigger>
              </TabsList>

              <TabsContent value="structured" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Extracted Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Field</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Confidence</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {extractedData.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.field}</TableCell>
                            <TableCell>{item.value}</TableCell>
                            <TableCell>
                              <Badge
                                className={`${getConfidenceBadge(item.confidence)} hover:${getConfidenceBadge(item.confidence)}`}
                              >
                                {item.confidence}%
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Error Corrections */}
                {errorCorrections.length > 0 && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
                        Items Requiring Attention ({errorCorrections.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {errorCorrections.map((error) => (
                          <div key={error.id} className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{error.field}</h4>
                                <p className="text-sm text-gray-600 mt-1">{error.issue}</p>
                                <div className="mt-2 space-y-1">
                                  <p className="text-sm">
                                    <span className="text-gray-500">Original:</span> {error.originalValue}
                                  </p>
                                  <p className="text-sm">
                                    <span className="text-gray-500">Suggested:</span> {error.suggestedValue}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                                <Badge
                                  className={`${getConfidenceBadge(error.confidence)} hover:${getConfidenceBadge(error.confidence)}`}
                                >
                                  {error.confidence}%
                                </Badge>
                                <Button size="sm" variant="outline">
                                  Edit
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="tables" className="mt-6">
                <div className="space-y-6">
                  {financialTables.map((table, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>{table.name}</CardTitle>
                          <div className="flex items-center space-x-2">
                            <Badge
                              className={`${getConfidenceBadge(table.confidence)} hover:${getConfidenceBadge(table.confidence)}`}
                            >
                              {table.confidence}%
                            </Badge>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-4">{table.rows} rows extracted</p>
                        {/* Mock table preview */}
                        <div className="border rounded-lg overflow-hidden">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="text-left p-3 border-b">Account</th>
                                <th className="text-right p-3 border-b">Current Period</th>
                                <th className="text-right p-3 border-b">Previous Period</th>
                                <th className="text-right p-3 border-b">Change</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="p-3 border-b">Revenue</td>
                                <td className="text-right p-3 border-b">$2,847,392</td>
                                <td className="text-right p-3 border-b">$2,654,123</td>
                                <td className="text-right p-3 border-b text-green-600">+7.3%</td>
                              </tr>
                              <tr>
                                <td className="p-3 border-b">Operating Expenses</td>
                                <td className="text-right p-3 border-b">$1,923,481</td>
                                <td className="text-right p-3 border-b">$1,876,543</td>
                                <td className="text-right p-3 border-b text-red-600">+2.5%</td>
                              </tr>
                              <tr>
                                <td className="p-3 font-medium">Net Income</td>
                                <td className="text-right p-3 font-medium">$923,911</td>
                                <td className="text-right p-3 font-medium">$777,580</td>
                                <td className="text-right p-3 font-medium text-green-600">+18.8%</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="export" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Export Formats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button className="w-full justify-start bg-green-600 hover:bg-green-700">
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Download Excel
                      </Button>
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <Database className="w-4 h-4 mr-2" />
                        Download CSV
                      </Button>
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <Code className="w-4 h-4 mr-2" />
                        Download JSON
                      </Button>
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <Send className="w-4 h-4 mr-2" />
                        Send to QuickBooks
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Export Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" defaultChecked />
                          <span className="text-sm">Include confidence scores</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" defaultChecked />
                          <span className="text-sm">Include original field names</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">Include extraction metadata</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" defaultChecked />
                          <span className="text-sm">Format currency values</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" defaultChecked />
                          <span className="text-sm">Normalize date formats</span>
                        </label>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Bottom Actions */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex flex-wrap gap-3">
              <Button className="bg-blue-900 hover:bg-blue-800">
                <Save className="w-4 h-4 mr-2" />
                Save as Template
              </Button>
              <Button variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reprocess Document
              </Button>
              <Button variant="outline">
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark as Reviewed
              </Button>
              <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 bg-transparent">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Results
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
