"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Save,
  Play,
  Plus,
  Edit,
  Trash2,
  GripVertical,
  Target,
} from "lucide-react"
import Link from "next/link"

export default function TemplateBuilder() {
  const [zoomLevel, setZoomLevel] = useState(100)
  const [selectedField, setSelectedField] = useState<string | null>("invoice-number")

  const extractedFields = [
    {
      id: "invoice-number",
      name: "Invoice Number",
      type: "text",
      confidence: 99.2,
      value: "INV-2024-001",
      validation: "Required, Alphanumeric",
      required: true,
    },
    {
      id: "invoice-date",
      name: "Invoice Date",
      type: "date",
      confidence: 98.7,
      value: "2024-01-15",
      validation: "Required, Date format",
      required: true,
    },
    {
      id: "total-amount",
      name: "Total Amount",
      type: "currency",
      confidence: 99.8,
      value: "$1,247.50",
      validation: "Required, Positive number",
      required: true,
    },
    {
      id: "vendor-name",
      name: "Vendor Name",
      type: "text",
      confidence: 97.3,
      value: "ABC Corporation",
      validation: "Required, Min 3 characters",
      required: true,
    },
    {
      id: "line-items",
      name: "Line Items",
      type: "table",
      confidence: 98.1,
      value: "5 rows detected",
      validation: "At least 1 row",
      required: false,
    },
  ]

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 95) return "text-green-600 bg-green-100"
    if (confidence >= 90) return "text-yellow-600 bg-yellow-100"
    return "text-red-600 bg-red-100"
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
            <Link href="/templates" className="hover:text-gray-700">
              Templates
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Template Builder</span>
          </nav>

          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Template Builder</h1>
              <p className="text-gray-600">Create and configure document extraction templates</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-120px)]">
        {/* PDF Preview Panel */}
        <div className="flex-1 bg-white border-r border-gray-200">
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
                <Button variant="outline" size="sm">
                  <RotateCw className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm">Page 1 of 1</span>
                <Button variant="outline" size="sm">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* PDF Viewer */}
          <div className="p-6 overflow-auto h-full">
            <div className="bg-white shadow-lg mx-auto" style={{ width: `${zoomLevel}%` }}>
              {/* Mock PDF Content */}
              <div className="border border-gray-300 p-8 bg-white">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="text-center border-b pb-4">
                    <h2 className="text-2xl font-bold">INVOICE</h2>
                    <p className="text-gray-600">ABC Corporation</p>
                  </div>

                  {/* Invoice Details */}
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-semibold mb-2">Bill To:</h3>
                      <p>XYZ Company</p>
                      <p>123 Business St</p>
                      <p>City, State 12345</p>
                    </div>
                    <div>
                      <div className="space-y-2">
                        <div
                                          className={`inline-block p-1 border-2 border-primary bg-primary/5 ${
                  selectedField === "invoice-number" ? "ring-2 ring-primary/40" : ""
                }`}
                        >
                          <strong>Invoice #:</strong> INV-2024-001
                        </div>
                        <br />
                        <div
                                          className={`inline-block p-1 border-2 border-primary bg-primary/5 ${
                  selectedField === "invoice-date" ? "ring-2 ring-primary/40" : ""
                }`}
                        >
                          <strong>Date:</strong> 2024-01-15
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Line Items Table */}
                  <div
                                    className={`border-2 border-primary bg-primary/5 p-2 ${
                  selectedField === "line-items" ? "ring-2 ring-primary/40" : ""
                }`}
                  >
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Description</th>
                          <th className="text-right py-2">Qty</th>
                          <th className="text-right py-2">Rate</th>
                          <th className="text-right py-2">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="py-1">Consulting Services</td>
                          <td className="text-right py-1">10</td>
                          <td className="text-right py-1">$100.00</td>
                          <td className="text-right py-1">$1,000.00</td>
                        </tr>
                        <tr>
                          <td className="py-1">Software License</td>
                          <td className="text-right py-1">1</td>
                          <td className="text-right py-1">$247.50</td>
                          <td className="text-right py-1">$247.50</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Total */}
                  <div className="text-right">
                    <div
                                      className={`inline-block p-1 border-2 border-primary bg-primary/5 ${
                  selectedField === "total-amount" ? "ring-2 ring-primary/40" : ""
                }`}
                    >
                      <strong>Total: $1,247.50</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Field Mapping Panel */}
        <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-6">
            {/* Template Info */}
            <div className="mb-6">
              <Label htmlFor="template-name">Template Name</Label>
              <Input id="template-name" value="Invoice Processing Template" className="mt-1" />
              <Label htmlFor="document-type" className="mt-4 block">
                Document Type
              </Label>
              <Select defaultValue="invoice">
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="bank-statement">Bank Statement</SelectItem>
                  <SelectItem value="tax-form">Tax Form</SelectItem>
                  <SelectItem value="expense-report">Expense Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Extracted Fields */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Extracted Fields</h3>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-3">
                {extractedFields.map((field) => (
                  <Card
                    key={field.id}
                    className={`cursor-pointer transition-colors ${
                      selectedField === field.id ? "ring-2 ring-primary bg-primary/5" : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedField(field.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <GripVertical className="w-4 h-4 text-gray-400" />
                          <div>
                            <h4 className="font-medium text-sm">{field.name}</h4>
                            <p className="text-xs text-gray-500">{field.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={`text-xs ${getConfidenceColor(field.confidence)}`}>
                            {field.confidence}%
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{field.value}</p>
                        <p className="text-xs text-gray-500">{field.validation}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Field Settings */}
            {selectedField && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Field Settings</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="field-name">Field Name</Label>
                    <Input
                      id="field-name"
                      value={extractedFields.find((f) => f.id === selectedField)?.name || ""}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="field-type">Field Type</Label>
                    <Select defaultValue={extractedFields.find((f) => f.id === selectedField)?.type || "text"}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="currency">Currency</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="table">Table</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="validation">Validation Rules</Label>
                    <Input
                      id="validation"
                      value={extractedFields.find((f) => f.id === selectedField)?.validation || ""}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="border-t border-gray-200 p-6">
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Expected Accuracy: 98.5%</span>
              </div>
            </div>
            <div className="space-y-3">
              <Button variant="outline" className="w-full bg-transparent">
                <Play className="w-4 h-4 mr-2" />
                Test Template
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button className="w-full bg-primary hover:bg-primary/90">
                <Save className="w-4 h-4 mr-2" />
                Save & Activate
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
