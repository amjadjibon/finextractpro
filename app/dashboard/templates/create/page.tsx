"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Upload, FileText, Plus, Trash2, Save, Play, Settings, Target, Brain, Zap } from "lucide-react"
import Link from "next/link"

export default function CreateTemplatePage() {
  const [templateName, setTemplateName] = useState("")
  const [documentType, setDocumentType] = useState("")
  const [fields, setFields] = useState([
    { id: 1, name: "Invoice Number", type: "text", required: true, validation: "Required, Alphanumeric" },
    { id: 2, name: "Invoice Date", type: "date", required: true, validation: "Required, Date format" },
    { id: 3, name: "Total Amount", type: "currency", required: true, validation: "Required, Positive number" },
  ])

  const addField = () => {
    const newField = {
      id: Date.now(),
      name: "",
      type: "text",
      required: false,
      validation: "",
    }
    setFields([...fields, newField])
  }

  const removeField = (id: number) => {
    setFields(fields.filter((field) => field.id !== id))
  }

  const updateField = (id: number, key: string, value: any) => {
    setFields(fields.map((field) => (field.id === id ? { ...field, [key]: value } : field)))
  }

  const fieldTypes = [
    { value: "text", label: "Text" },
    { value: "number", label: "Number" },
    { value: "currency", label: "Currency" },
    { value: "date", label: "Date" },
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone" },
    { value: "table", label: "Table" },
    { value: "address", label: "Address" },
  ]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/dashboard/templates">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Templates
            </Button>
          </Link>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Template</h1>
          <p className="text-gray-600 mt-1">Design a custom template for document processing</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="fields">Field Mapping</TabsTrigger>
              <TabsTrigger value="validation">Validation</TabsTrigger>
              <TabsTrigger value="testing">Testing</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Template Information</CardTitle>
                  <CardDescription>Set up the basic details for your template</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="template-name">Template Name</Label>
                      <Input
                        id="template-name"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        placeholder="e.g., Standard Invoice Template"
                      />
                    </div>
                    <div>
                      <Label htmlFor="document-type">Document Type</Label>
                      <Select value={documentType} onValueChange={setDocumentType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="invoice">Invoice</SelectItem>
                          <SelectItem value="bank-statement">Bank Statement</SelectItem>
                          <SelectItem value="tax-form">Tax Form</SelectItem>
                          <SelectItem value="expense-report">Expense Report</SelectItem>
                          <SelectItem value="financial-report">Financial Report</SelectItem>
                          <SelectItem value="receipt">Receipt</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what this template extracts and how it should be used..."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags (Optional)</Label>
                    <Input id="tags" placeholder="invoice, accounting, finance (comma separated)" />
                  </div>

                  {/* Sample Document Upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-sm font-medium text-gray-900 mb-1">Upload Sample Document</h3>
                      <p className="text-xs text-gray-500 mb-3">Upload a sample document to help train the AI</p>
                      <Button variant="outline" size="sm">
                        Choose File
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fields" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Field Configuration</CardTitle>
                  <CardDescription>Define the fields you want to extract from documents</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {fields.map((field) => (
                      <div key={field.id} className="border rounded-lg p-4">
                        <div className="grid grid-cols-12 gap-4 items-end">
                          <div className="col-span-3">
                            <Label htmlFor={`field-name-${field.id}`}>Field Name</Label>
                            <Input
                              id={`field-name-${field.id}`}
                              value={field.name}
                              onChange={(e) => updateField(field.id, "name", e.target.value)}
                              placeholder="Field name"
                            />
                          </div>
                          <div className="col-span-2">
                            <Label htmlFor={`field-type-${field.id}`}>Type</Label>
                            <Select value={field.type} onValueChange={(value) => updateField(field.id, "type", value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {fieldTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-4">
                            <Label htmlFor={`field-validation-${field.id}`}>Validation Rules</Label>
                            <Input
                              id={`field-validation-${field.id}`}
                              value={field.validation}
                              onChange={(e) => updateField(field.id, "validation", e.target.value)}
                              placeholder="e.g., Required, Min 3 characters"
                            />
                          </div>
                          <div className="col-span-2 flex items-center space-x-2">
                            <Switch
                              checked={field.required}
                              onCheckedChange={(checked) => updateField(field.id, "required", checked)}
                            />
                            <Label className="text-xs">Required</Label>
                          </div>
                          <div className="col-span-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeField(field.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button onClick={addField} variant="outline" className="w-full bg-transparent">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Field
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="validation" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Validation & Quality Settings</CardTitle>
                  <CardDescription>Configure validation rules and quality thresholds</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="confidence-threshold">Minimum Confidence Threshold</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="95%" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="90">90%</SelectItem>
                          <SelectItem value="95">95%</SelectItem>
                          <SelectItem value="98">98%</SelectItem>
                          <SelectItem value="99">99%</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 mt-1">
                        Fields below this confidence will be flagged for review
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="error-handling">Error Handling</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Flag for review" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flag">Flag for review</SelectItem>
                          <SelectItem value="skip">Skip field</SelectItem>
                          <SelectItem value="default">Use default value</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Processing Options</h4>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span className="text-sm">Auto-correct common OCR errors</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span className="text-sm">Validate field formats automatically</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Allow manual field corrections</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span className="text-sm">Learn from corrections to improve accuracy</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="post-processing">Post-Processing Rules</Label>
                    <Textarea
                      id="post-processing"
                      placeholder="Define custom rules for data transformation, formatting, or validation..."
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="testing" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Test Your Template</CardTitle>
                  <CardDescription>Upload test documents to validate your template configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Test Documents</h3>
                    <p className="text-gray-500 mb-4">Test your template with sample documents to ensure accuracy</p>
                    <Button variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Test Files
                    </Button>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Target className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">Testing Tips</h4>
                        <ul className="text-sm text-blue-800 mt-2 space-y-1">
                          <li>• Upload 3-5 representative documents</li>
                          <li>• Include documents with different layouts</li>
                          <li>• Test with both high and low quality scans</li>
                          <li>• Verify all required fields are extracted correctly</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full bg-blue-900 hover:bg-blue-800">
                    <Play className="w-4 h-4 mr-2" />
                    Run Test Extraction
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Template Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Template Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Name:</span>
                  <span className="font-medium">{templateName || "Untitled Template"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Type:</span>
                  <span className="font-medium">{documentType || "Not selected"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Fields:</span>
                  <span className="font-medium">{fields.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Required Fields:</span>
                  <span className="font-medium">{fields.filter((f) => f.required).length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Features */}
          <Card>
            <CardHeader>
              <CardTitle>AI Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Brain className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium text-sm">Smart Field Detection</p>
                  <p className="text-xs text-gray-500">AI automatically identifies field locations</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Zap className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-sm">Adaptive Learning</p>
                  <p className="text-xs text-gray-500">Template improves with each use</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Target className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-sm">Quality Validation</p>
                  <p className="text-xs text-gray-500">Automatic accuracy checking</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-blue-900 hover:bg-blue-800">
                <Save className="w-4 h-4 mr-2" />
                Save Template
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                <Play className="w-4 h-4 mr-2" />
                Save & Test
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                <Settings className="w-4 h-4 mr-2" />
                Advanced Settings
              </Button>
            </CardContent>
          </Card>

          {/* Help */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start text-sm p-2">
                  📖 Template Guide
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm p-2">
                  🎥 Video Tutorial
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm p-2">
                  💬 Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
