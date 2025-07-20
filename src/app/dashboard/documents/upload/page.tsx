"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, X, CheckCircle, AlertCircle, Clock, FolderOpen, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function UploadDocumentsPage() {
  const [uploadMethod, setUploadMethod] = useState<"single" | "batch">("single")
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [processing, setProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedDocumentType, setSelectedDocumentType] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [description, setDescription] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
  const [uploadErrors, setUploadErrors] = useState<string[]>([])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    console.log('Files dropped:', e.dataTransfer.files)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files)
      console.log('Processing dropped files:', newFiles)
      setFiles((prev) => [...prev, ...newFiles])
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File selection triggered', e.target.files)
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      console.log('Selected files:', newFiles)
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-600" />
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <FileText className="w-5 h-5 text-blue-600" />
      case 'tiff':
      case 'tif':
        return <FileText className="w-5 h-5 text-purple-600" />
      default:
        return <FileText className="w-5 h-5 text-gray-600" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      alert("Please select files to upload")
      return
    }

    setProcessing(true)
    setUploadProgress(0)

    try {
      const uploadPromises = files.map(async (file, index) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('documentType', selectedDocumentType)
        formData.append('template', selectedTemplate)
        formData.append('description', description)

        // Simulate API call - replace with actual API endpoint
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            // Simulate progress
            const progressIncrement = 100 / files.length
            setUploadProgress((prev) => Math.min(prev + progressIncrement, 100))
            
            // Simulate random success/failure for demo
            if (Math.random() > 0.1) {
              resolve({
                id: Date.now() + index,
                name: file.name,
                status: 'completed',
                size: file.size,
                uploadedAt: new Date().toISOString()
              })
            } else {
              reject(new Error(`Failed to upload ${file.name}`))
            }
          }, 1000 + Math.random() * 2000)
        })
      })

      const results = await Promise.allSettled(uploadPromises)
      
      // Handle results
      const successful = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length

      if (successful > 0) {
        setUploadedFiles(prev => [
          ...prev,
          ...results
            .filter(r => r.status === 'fulfilled')
            .map(r => (r as PromiseFulfilledResult<any>).value)
        ])
      }

      if (failed > 0) {
        setUploadErrors(results
          .filter(r => r.status === 'rejected')
          .map(r => (r as PromiseRejectedResult).reason.message)
        )
      }

      // Show success message
      alert(`Upload completed! ${successful} successful, ${failed} failed`)
      
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setProcessing(false)
      setUploadProgress(100)
      // Clear files after upload
      setFiles([])
    }
  }



  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/dashboard/documents">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Documents
            </Button>
          </Link>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upload Documents</h1>
          <p className="text-gray-600 mt-1">Upload and process your financial documents with AI</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Upload Area */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={uploadMethod} onValueChange={(value) => setUploadMethod(value as "single" | "batch")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single">Single Upload</TabsTrigger>
              <TabsTrigger value="batch">Batch Upload</TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Single Document</CardTitle>
                  <CardDescription>Upload and process one document at a time</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Drag and Drop Area */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                      dragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-gray-400"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Drop your document here, or click to browse
                    </h3>
                    <p className="text-gray-500 mb-4">Supports PDF, PNG, JPG, TIFF files up to 10MB</p>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.png,.jpg,.jpeg,.tiff"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label 
                      htmlFor="file-upload"
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer"
                    >
                      Choose Files
                    </label>
                  </div>

                  {/* Document Settings */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="document-type">Document Type</Label>
                      <Select value={selectedDocumentType} onValueChange={setSelectedDocumentType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="invoice">Invoice</SelectItem>
                          <SelectItem value="bank-statement">Bank Statement</SelectItem>
                          <SelectItem value="tax-form">Tax Form</SelectItem>
                          <SelectItem value="expense-report">Expense Report</SelectItem>
                          <SelectItem value="financial-report">Financial Report</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="template">Processing Template</Label>
                      <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                        <SelectTrigger>
                          <SelectValue placeholder="Auto-detect" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Auto-detect</SelectItem>
                          <SelectItem value="invoice-template">Standard Invoice</SelectItem>
                          <SelectItem value="bank-template">Bank Statement Parser</SelectItem>
                          <SelectItem value="tax-template">Tax Form Extractor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea 
                      id="description" 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add notes about this document..." 
                      className="mt-1" 
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="batch" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Batch Upload</CardTitle>
                  <CardDescription>Upload and process multiple documents at once</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Batch Upload Area */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                      dragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-gray-400"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('batch-upload')?.click()}
                  >
                    <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Drop multiple documents here</h3>
                    <p className="text-gray-500 mb-4">Upload up to 50 documents at once (max 100MB total)</p>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.png,.jpg,.jpeg,.tiff"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="batch-upload"
                    />
                    <label 
                      htmlFor="batch-upload"
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer"
                    >
                      Choose Multiple Files
                    </label>
                  </div>

                  {/* Batch Settings */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="batch-template">Default Template</Label>
                      <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                        <SelectTrigger>
                          <SelectValue placeholder="Auto-detect for all" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Auto-detect</SelectItem>
                          <SelectItem value="invoice-template">Standard Invoice</SelectItem>
                          <SelectItem value="mixed">Mixed Document Types</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="batch-priority">Processing Priority</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Normal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High Priority</SelectItem>
                          <SelectItem value="low">Low Priority</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* File List */}
          {files.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Selected Files ({files.length})</CardTitle>
                <CardDescription>Review your files before processing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getFileIcon(file.name)}
                        <div>
                          <p className="font-medium text-sm">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">Ready</Badge>
                        <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {processing && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Processing...</span>
                      <span className="text-sm text-gray-500">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="mb-2" />
                    <p className="text-xs text-gray-500">Uploading and analyzing documents with AI...</p>
                  </div>
                )}

                <div className="flex space-x-3 mt-6">
                  <Button onClick={handleUpload} disabled={processing} className="bg-primary hover:bg-primary/90">
                    {processing ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Start Processing
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setFiles([])}>
                    Clear All
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload Results */}
          {uploadedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">
                  <CheckCircle className="w-5 h-5 inline mr-2" />
                  Successfully Uploaded ({uploadedFiles.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <div>
                          <p className="font-medium text-sm">{file.name}</p>
                          <p className="text-xs text-gray-500">Uploaded successfully</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/dashboard/documents/${file.id}`}>
                          View Document
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload Errors */}
          {uploadErrors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">
                  <AlertCircle className="w-5 h-5 inline mr-2" />
                  Upload Errors ({uploadErrors.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {uploadErrors.map((error, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg bg-red-50">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => setUploadErrors([])}
                >
                  Clear Errors
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Processing Options */}
          <Card>
            <CardHeader>
              <CardTitle>Processing Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm">Auto-detect document type</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm">Extract tables automatically</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Create template from results</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm">Send notification when complete</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Supported Formats */}
          <Card>
            <CardHeader>
              <CardTitle>Supported Formats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-red-600" />
                  <span className="text-sm">PDF documents</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="text-sm">PNG images</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-green-600" />
                  <span className="text-sm">JPG/JPEG images</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span className="text-sm">TIFF images</span>
                </div>
              </div>
                              <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                  <p className="text-xs text-primary">
                    <strong>Tip:</strong> For best results, ensure documents are clear and well-lit with minimal skew.
                  </p>
                </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Uploads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Invoice_Q3_2024.pdf</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Bank_Statement.pdf</p>
                    <p className="text-xs text-gray-500">Processing...</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Tax_Form.pdf</p>
                    <p className="text-xs text-gray-500">Error - retry needed</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
