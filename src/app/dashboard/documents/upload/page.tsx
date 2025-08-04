"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { templatesAPI } from "@/lib/api"
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
  const searchParams = useSearchParams()
  const [uploadMethod, setUploadMethod] = useState<"single" | "batch">("single")
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [processing, setProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedDocumentType, setSelectedDocumentType] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [description, setDescription] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    id: number;
    name: string;
    status: string;
    size: number;
    uploadedAt: string;
  }>>([])
  const [uploadErrors, setUploadErrors] = useState<string[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(true)

  // Load templates on component mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await templatesAPI.list({ 
          limit: 100, 
          includePublic: true, 
          status: 'active' 
        })
        setTemplates(data.templates || [])
        
        // Pre-select template from URL params
        const templateParam = searchParams.get('template')
        if (templateParam) {
          setSelectedTemplate(templateParam)
        }
      } catch (error) {
        console.error('Error fetching templates:', error)
      } finally {
        setLoadingTemplates(false)
      }
    }

    fetchTemplates()
  }, [searchParams])

  // Supported file types
  const supportedTypes = {
    'application/pdf': { ext: 'pdf', name: 'PDF Document', icon: 'text-red-600', maxSize: 10 },
    'text/plain': { ext: 'txt', name: 'Text Document', icon: 'text-gray-600', maxSize: 5 },
    'application/msword': { ext: 'doc', name: 'Word Document', icon: 'text-blue-600', maxSize: 10 },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { ext: 'docx', name: 'Word Document', icon: 'text-blue-600', maxSize: 10 },
    'image/jpeg': { ext: 'jpg', name: 'JPEG Image', icon: 'text-green-600', maxSize: 5 },
    'image/png': { ext: 'png', name: 'PNG Image', icon: 'text-blue-600', maxSize: 5 },
    'image/tiff': { ext: 'tiff', name: 'TIFF Image', icon: 'text-purple-600', maxSize: 10 }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const validateFiles = (fileList: File[]) => {
    const validFiles: File[] = []
    const errors: string[] = []

    fileList.forEach(file => {
      const fileType = supportedTypes[file.type as keyof typeof supportedTypes]
      
      if (!fileType) {
        errors.push(`${file.name}: Unsupported file type (${file.type})`)
        return
      }

      const maxSizeBytes = fileType.maxSize * 1024 * 1024 // Convert MB to bytes
      if (file.size > maxSizeBytes) {
        errors.push(`${file.name}: File too large (max ${fileType.maxSize}MB)`)
        return
      }

      validFiles.push(file)
    })

    if (errors.length > 0) {
      setUploadErrors(prev => [...prev, ...errors])
    }

    return validFiles
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files)
      const validFiles = validateFiles(newFiles)
      setFiles((prev) => [...prev, ...validFiles])
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      const validFiles = validateFiles(newFiles)
      setFiles((prev) => [...prev, ...validFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const getFileIcon = (file: File) => {
    const fileType = supportedTypes[file.type as keyof typeof supportedTypes]
    const iconClass = fileType?.icon || 'text-gray-600'
    return <FileText className={`w-5 h-5 ${iconClass}`} />
  }

  const getFileTypeName = (file: File) => {
    const fileType = supportedTypes[file.type as keyof typeof supportedTypes]
    return fileType?.name || 'Unknown'
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
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        if (selectedDocumentType) formData.append('documentType', selectedDocumentType)
        if (selectedTemplate && selectedTemplate !== 'auto') {
          formData.append('templateId', selectedTemplate)
        }
        if (description) formData.append('description', description)

        // Call actual API endpoint
        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          body: formData,
        })

        const progressIncrement = 100 / files.length
        setUploadProgress((prev) => Math.min(prev + progressIncrement, 100))

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `Failed to upload ${file.name}`)
        }

        const result = await response.json()
        return {
          id: result.document.id,
          name: result.document.name,
          status: result.document.status,
          size: result.document.size,
          uploadedAt: result.document.uploadedAt
        }
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
            .map(r => (r as PromiseFulfilledResult<{
              id: number;
              name: string;
              status: string;
              size: number;
              uploadedAt: string;
            }>).value)
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
                    <p className="text-gray-500 mb-4">Supports PDF, TXT, DOC/DOCX, PNG, JPG, TIFF files up to 10MB</p>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.txt,.doc,.docx,.png,.jpg,.jpeg,.tiff"
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
                          <SelectValue placeholder={loadingTemplates ? "Loading..." : "Auto-detect"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Auto-detect (Smart extraction)</SelectItem>
                          {templates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name} ({template.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedTemplate && selectedTemplate !== 'auto' && (
                        <p className="text-sm text-gray-500 mt-1">
                          Using template: {templates.find(t => t.id === selectedTemplate)?.name}
                        </p>
                      )}
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
                    <p className="text-gray-500 mb-4">Upload up to 50 documents at once (PDF, TXT, DOC/DOCX, images)</p>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.txt,.doc,.docx,.png,.jpg,.jpeg,.tiff"
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
                          <SelectValue placeholder={loadingTemplates ? "Loading..." : "Auto-detect for all"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Auto-detect (Smart extraction)</SelectItem>
                          {templates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name} ({template.type})
                            </SelectItem>
                          ))}
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
                        {getFileIcon(file)}
                        <div>
                          <p className="font-medium text-sm">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)} • {getFileTypeName(file)}</p>
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
                  <span className="text-sm">PDF documents (up to 10MB)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-600" />
                  <span className="text-sm">Text files (.txt, up to 5MB)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Word documents (.doc/.docx, up to 10MB)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-green-600" />
                  <span className="text-sm">JPEG images (up to 5MB)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">PNG images (up to 5MB)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span className="text-sm">TIFF images (up to 10MB)</span>
                </div>
              </div>
                              <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                  <p className="text-xs text-primary">
                    <strong>Tip:</strong> For best results, ensure documents are clear and well-lit with minimal skew.
                  </p>
                </div>
            </CardContent>
          </Card>

          {/* Recent Activity - TODO: Replace with real recent uploads */}
        </div>
      </div>
    </div>
  )
}
