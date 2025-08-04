"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ArrowLeft,
  FileText,
  Download,
  Edit,
  Trash2,
  Share,
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Save,
  RefreshCw,
  Calendar,
  User,
  Tag,
  Settings,
  FileSpreadsheet,
  FileJson,
  Archive,
  Loader2,
} from "lucide-react"
import Link from "next/link"

// Document Preview Component
interface DocumentPreviewProps {
  fileUrl: string
  fileType: string
  fileName: string
  zoom: number
  rotation: number
}

function DocumentPreview({ fileUrl, fileType, fileName, zoom, rotation }: DocumentPreviewProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  
  const isPDF = fileType === 'application/pdf'
  const isImage = fileType.startsWith('image/')
  const isText = fileType === 'text/plain'
  const isWord = fileType.includes('word') || fileType.includes('document')
  
  const previewStyle = {
    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
    transformOrigin: "center",
    transition: "transform 0.2s ease"
  }

  if (isPDF) {
    return (
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading PDF...</p>
            </div>
          </div>
        )}
        <div style={previewStyle} className="bg-white shadow-lg border rounded max-w-full max-h-full">
          <iframe
            src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
            width="800"
            height="600"
            className="border-0 rounded"
            title={`Preview of ${fileName}`}
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false)
              setError(true)
            }}
          />
        </div>
        {error && (
          <div className="mt-4 text-center">
            <p className="text-red-600 mb-2">Unable to preview PDF</p>
            <Button 
              variant="outline" 
              onClick={() => window.open(fileUrl, '_blank')}
            >
              <Download className="w-4 h-4 mr-2" />
              Open PDF in New Tab
            </Button>
          </div>
        )}
      </div>
    )
  }

  if (isImage) {
    return (
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading image...</p>
            </div>
          </div>
        )}
        <div style={previewStyle} className="bg-white shadow-lg border rounded p-4 max-w-full max-h-full">
          <img
            src={fileUrl}
            alt={`Preview of ${fileName}`}
            className="max-w-full max-h-[600px] object-contain"
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false)
              setError(true)
            }}
            style={{ display: error ? 'none' : 'block' }}
          />
          {error && (
            <div className="text-center text-gray-500 p-8">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="mb-4">Unable to load image preview</p>
              <Button 
                variant="outline" 
                onClick={() => window.open(fileUrl, '_blank')}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Image
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (isText) {
    return (
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading text file...</p>
            </div>
          </div>
        )}
        <div style={previewStyle} className="bg-white shadow-lg border rounded p-6 max-w-full max-h-[600px] overflow-auto">
          <iframe
            src={fileUrl}
            width="700"
            height="500"
            className="border-0 w-full h-full"
            title={`Preview of ${fileName}`}
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false)
              setError(true)
            }}
          />
          {error && (
            <div className="text-center text-gray-500 p-8">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="mb-4">Unable to preview text file</p>
              <Button 
                variant="outline" 
                onClick={() => window.open(fileUrl, '_blank')}
              >
                <Download className="w-4 h-4 mr-2" />
                Download File
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (isWord) {
    return (
      <div style={previewStyle} className="bg-white shadow-lg border rounded p-8 text-center">
        <FileText className="w-16 h-16 mx-auto mb-4 text-blue-500" />
        <p className="text-gray-700 mb-2 font-medium">Word Document</p>
        <p className="text-gray-500 mb-4">Preview not available - Word documents require downloading</p>
        <p className="text-sm text-gray-400 mb-4">{fileType}</p>
        <div className="space-y-2">
          <Button 
            variant="default" 
            className="w-full"
            onClick={() => window.open(fileUrl, '_blank')}
          >
            <Download className="w-4 h-4 mr-2" />
            Download & Open
          </Button>
          <p className="text-xs text-gray-400">File will open in your default application</p>
        </div>
      </div>
    )
  }

  // For unsupported file types
  return (
    <div style={previewStyle} className="bg-white shadow-lg border rounded p-8 text-center">
      <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
      <p className="text-gray-700 mb-2 font-medium">File Preview</p>
      <p className="text-gray-500 mb-2">Preview not available for this file type</p>
      <p className="text-sm text-gray-400 mb-4">{fileType}</p>
      <div className="space-y-2">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => window.open(fileUrl, '_blank')}
        >
          <Download className="w-4 h-4 mr-2" />
          Download File
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => window.open(fileUrl, '_blank')}
        >
          Open in New Tab
        </Button>
      </div>
    </div>
  )
}

interface ExtractedField {
  name: string
  value: string
  confidence: number
  type: string
}

interface ProcessingHistoryItem {
  id: number
  action: string
  timestamp: string
  user: string
  details: string
}

interface DocumentData {
  id: string
  name: string
  type: string
  status: string
  uploadDate: string
  processedDate?: string
  size: string
  confidence?: number
  pages?: number
  template?: string
  description?: string
  tags?: string[]
  fileUrl?: string
  fileType?: string
  extractedFields: ExtractedField[]
  processingHistory: ProcessingHistoryItem[]
  fieldsExtracted: number
}

export default function DocumentViewPage() {
  const params = useParams()
  const router = useRouter()
  const [document, setDocument] = useState<DocumentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editedValues, setEditedValues] = useState<{[key: string]: string}>({})
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  
  // Export dialog state
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'excel'>('json')
  const [exportName, setExportName] = useState('')
  const [exportDescription, setExportDescription] = useState('')
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [isExporting, setIsExporting] = useState(false)
  const [exportOptions, setExportOptions] = useState<any>(null)

  useEffect(() => {
    const fetchDocument = async () => {
      setLoading(true)
      
      // Fetch from API
        try {
          const response = await fetch(`/api/documents/${params.id}`)
          
          if (!response.ok) {
            if (response.status === 404) {
              router.push("/dashboard/documents")
              return
            }
            throw new Error('Failed to fetch document')
          }
          
          const documentData = await response.json()
          setDocument(documentData)
        } catch (error) {
          console.error('Error fetching document:', error)
          router.push("/dashboard/documents")
        } finally {
          setLoading(false)
        }
    }

    fetchDocument()
  }, [params.id, router])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "processing":
        return <Clock className="w-5 h-5 text-yellow-500" />
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "default",
      processing: "secondary",
      error: "destructive"
    } as const
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status}
      </Badge>
    )
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 95) return "text-green-600"
    if (confidence >= 90) return "text-yellow-600"
    return "text-red-600"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const handleFieldEdit = (fieldName: string, value: string) => {
    setEditedValues(prev => ({ ...prev, [fieldName]: value }))
  }

  const saveFieldEdit = async (fieldName: string) => {
    const editedValue = editedValues[fieldName]
    if (editedValue !== undefined && document) {
      // Update local state immediately for better UX
      setDocument(prev => {
        if (!prev) return prev
        return {
          ...prev,
          extractedFields: prev.extractedFields.map(field =>
            field.name === fieldName
              ? { ...field, value: editedValue, confidence: 100 } // Reset confidence when manually edited
              : field
          )
        }
      })
      
      // TODO: Send API request to save the edited field
      try {
        const response = await fetch(`/api/documents/${document.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            extractedFields: document.extractedFields.map(field =>
              field.name === fieldName
                ? { ...field, value: editedValue, confidence: 100 }
                : field
            )
          })
        })
        
        if (!response.ok) {
          console.error('Failed to save field edit')
        }
      } catch (error) {
        console.error('Error saving field edit:', error)
      }
    }
    
    setEditingField(null)
    setEditedValues(prev => {
      const newValues = { ...prev }
      delete newValues[fieldName]
      return newValues
    })
  }

  const cancelFieldEdit = (fieldName: string) => {
    setEditingField(null)
    setEditedValues(prev => {
      const newValues = { ...prev }
      delete newValues[fieldName]
      return newValues
    })
  }

  const handleDeleteDocument = async () => {
    if (!document) return
    
    try {
      const response = await fetch(`/api/documents/${document.id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete document')
      }
      
      router.push("/dashboard/documents")
    } catch (error) {
      console.error('Error deleting document:', error)
      alert('Failed to delete document. Please try again.')
    }
  }

  const handleReprocess = async () => {
    if (!document) return
    
    try {
      // Update UI immediately
      setDocument(prev => prev ? { ...prev, status: "processing" } : prev)
      
      // TODO: Call reprocess API
      const response = await fetch(`/api/documents/${document.id}/reprocess`, {
        method: 'POST',
      })
      
      if (!response.ok) {
        throw new Error('Failed to reprocess document')
      }
      
      // Refresh document data
      const updatedResponse = await fetch(`/api/documents/${document.id}`)
      if (updatedResponse.ok) {
        const updatedDocument = await updatedResponse.json()
        setDocument(updatedDocument)
      }
    } catch (error) {
      console.error('Error reprocessing document:', error)
      // Revert status on error
      setDocument(prev => prev ? { ...prev, status: "error" } : prev)
    }
  }

  const handleDownload = () => {
    if (document?.fileUrl) {
      window.open(document.fileUrl, '_blank')
    }
  }

  // Export handlers
  const fetchExportOptions = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/export`)
      if (!response.ok) {
        throw new Error('Failed to fetch export options')
      }
      const data = await response.json()
      setExportOptions(data)
      setExportName(data.exportOptions.suggestedName)
      setExportDescription(`${exportFormat.toUpperCase()} export of ${data.document.name}`)
      setSelectedFields(data.exportOptions.availableFields.map((field: any) => field.name))
    } catch (error) {
      console.error('Error fetching export options:', error)
    }
  }

  const handleExportClick = () => {
    if (document) {
      fetchExportOptions(document.id)
      setIsExportDialogOpen(true)
    }
  }

  const handleExport = async () => {
    if (!document) return

    setIsExporting(true)
    
    try {
      const response = await fetch(`/api/documents/${document.id}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format: exportFormat,
          exportName,
          description: exportDescription,
          includeFields: selectedFields,
          settings: {
            includeMetadata: true
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Export failed')
      }

      const result = await response.json()
      
      // Close dialog
      setIsExportDialogOpen(false)
      
      // Show success message
      alert(`Export completed successfully! File: ${result.file_name}`)
      
      // Download the file immediately
      if (result.download_url) {
        window.open(result.download_url, '_blank')
      }
      
    } catch (error) {
      console.error('Export error:', error)
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsExporting(false)
    }
  }

  const handleFieldToggle = (fieldName: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldName) 
        ? prev.filter(f => f !== fieldName)
        : [...prev, fieldName]
    )
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'json':
        return <FileJson className="w-4 h-4" />
      case 'csv':
        return <FileSpreadsheet className="w-4 h-4" />
      case 'excel':
        return <Archive className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/dashboard/documents">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Documents
            </Button>
          </Link>
        </div>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
            <div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/dashboard/documents">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Documents
            </Button>
          </Link>
        </div>
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Document Not Found</h1>
          <p className="text-gray-600">The requested document could not be found.</p>
        </div>
      </div>
    )
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
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <FileText className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">{document.name}</h1>
              {getStatusIcon(document.status)}
              {getStatusBadge(document.status)}
            </div>
            <p className="text-gray-600">
              {document.description || "No description available"}
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleReprocess}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reprocess
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Metadata
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Document
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Document</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{document.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        className="bg-red-600 hover:bg-red-700"
                        onClick={handleDeleteDocument}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="preview">Document Preview</TabsTrigger>
              <TabsTrigger value="extracted">Extracted Data</TabsTrigger>
              <TabsTrigger value="history">Processing History</TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Document Preview</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(50, zoom - 25))}>
                        <ZoomOut className="w-4 h-4" />
                      </Button>
                      <span className="text-sm font-medium">{zoom}%</span>
                      <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(200, zoom + 25))}>
                        <ZoomIn className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setRotation((rotation + 90) % 360)}>
                        <RotateCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4 bg-gray-50 min-h-96 flex items-center justify-center">
                    {document.fileUrl ? (
                      <DocumentPreview
                        fileUrl={document.fileUrl}
                        fileType={document.fileType}
                        fileName={document.name}
                        zoom={zoom}
                        rotation={rotation}
                      />
                    ) : (
                      <div className="text-center text-gray-500">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p>Document preview not available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="extracted" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Extracted Data</CardTitle>
                  <CardDescription>
                    Review and edit the extracted field values
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Field Name</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Confidence</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {document.extractedFields && document.extractedFields.length > 0 ? (
                        document.extractedFields.map((field, index) => (
                          <TableRow key={`${field.name}-${index}`}>
                            <TableCell className="font-medium">{field.name}</TableCell>
                            <TableCell>
                              {editingField === field.name ? (
                                <Input
                                  value={editedValues[field.name] ?? field.value}
                                  onChange={(e) => handleFieldEdit(field.name, e.target.value)}
                                  className="max-w-xs"
                                  autoFocus
                                />
                              ) : (
                                <span>{field.value || 'N/A'}</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className={getConfidenceColor(field.confidence || 0)}>
                                {field.confidence ? field.confidence.toFixed(1) : '0.0'}%
                              </span>
                            </TableCell>
                            <TableCell>
                              {editingField === field.name ? (
                                <div className="flex space-x-2">
                                  <Button 
                                    size="sm" 
                                    onClick={() => saveFieldEdit(field.name)}
                                  >
                                    <Save className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => cancelFieldEdit(field.name)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              ) : (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    setEditingField(field.name)
                                    setEditedValues(prev => ({ ...prev, [field.name]: field.value }))
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                            No extracted fields available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Processing History</CardTitle>
                  <CardDescription>
                    Timeline of document processing activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {document.processingHistory.map((event) => (
                      <div key={event.id} className="flex items-start space-x-4 p-3 border rounded-lg">
                        <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{event.action}</h4>
                            <span className="text-sm text-gray-500">
                              {formatDate(event.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{event.details}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-500">{event.user}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Document Info */}
          <Card>
            <CardHeader>
              <CardTitle>Document Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-gray-500">Type</Label>
                  <p className="font-medium capitalize">{document.type || 'Unknown'}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Size</Label>
                  <p className="font-medium">{document.size || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Pages</Label>
                  <p className="font-medium">{document.pages || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Confidence</Label>
                  <p className={`font-medium ${getConfidenceColor(document.confidence || 0)}`}>
                    {document.confidence ? `${document.confidence}%` : 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500">Uploaded</Label>
                  <p className="font-medium">{formatDate(document.uploadDate)}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Processed</Label>
                  <p className="font-medium">
                    {document.processedDate ? formatDate(document.processedDate) : 'Not processed'}
                  </p>
                </div>
              </div>
              
              <div>
                <Label className="text-gray-500">Template</Label>
                <p className="font-medium">{document.template || 'Auto-detect'}</p>
              </div>

              {document.tags && document.tags.length > 0 && (
                <div>
                  <Label className="text-gray-500">Tags</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {document.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download Original
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={handleExportClick}>
                <FileText className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reprocess Document
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-2" />
                Change Template
              </Button>
            </CardContent>
          </Card>

          {/* Processing Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Extraction Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Fields Extracted:</span>
                  <span className="font-medium">{document.extractedFields?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">High Confidence:</span>
                  <span className="font-medium text-green-600">
                    {document.extractedFields?.filter(f => (f.confidence || 0) >= 95).length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Medium Confidence:</span>
                  <span className="font-medium text-yellow-600">
                    {document.extractedFields?.filter(f => (f.confidence || 0) >= 90 && (f.confidence || 0) < 95).length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Low Confidence:</span>
                  <span className="font-medium text-red-600">
                    {document.extractedFields?.filter(f => (f.confidence || 0) < 90).length || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Export Document</DialogTitle>
            <DialogDescription>
              Export "{document?.name}" in your preferred format with AI-powered data structuring
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Export Format Selection */}
            <div>
              <Label className="text-sm font-medium">Export Format</Label>
              <Select value={exportFormat} onValueChange={(value: 'json' | 'csv' | 'excel') => setExportFormat(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose export format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">
                    <div className="flex items-center">
                      <FileJson className="w-4 h-4 mr-2" />
                      JSON - Structured data format
                    </div>
                  </SelectItem>
                  <SelectItem value="csv">
                    <div className="flex items-center">
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                      CSV - Spreadsheet compatible
                    </div>
                  </SelectItem>
                  <SelectItem value="excel">
                    <div className="flex items-center">
                      <Archive className="w-4 h-4 mr-2" />
                      Excel - Advanced worksheets
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Export Name */}
            <div>
              <Label htmlFor="export-name" className="text-sm font-medium">Export Name</Label>
              <Input
                id="export-name"
                value={exportName}
                onChange={(e) => setExportName(e.target.value)}
                placeholder="Enter export name"
              />
            </div>

            {/* Export Description */}
            <div>
              <Label htmlFor="export-description" className="text-sm font-medium">Description (Optional)</Label>
              <Textarea
                id="export-description"
                value={exportDescription}
                onChange={(e) => setExportDescription(e.target.value)}
                placeholder="Describe this export..."
                rows={2}
              />
            </div>

            {/* Field Selection */}
            {exportOptions?.exportOptions?.availableFields && (
              <div>
                <Label className="text-sm font-medium">Select Fields to Include</Label>
                <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded p-3">
                  <div className="flex items-center space-x-2 pb-2 border-b">
                    <Checkbox
                      id="select-all"
                      checked={selectedFields.length === exportOptions.exportOptions.availableFields.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedFields(exportOptions.exportOptions.availableFields.map((f: any) => f.name))
                        } else {
                          setSelectedFields([])
                        }
                      }}
                    />
                    <Label htmlFor="select-all" className="text-sm font-medium">
                      Select All ({exportOptions.exportOptions.availableFields.length} fields)
                    </Label>
                  </div>
                  {exportOptions.exportOptions.availableFields.map((field: any) => (
                    <div key={field.name} className="flex items-center space-x-2">
                      <Checkbox
                        id={field.name}
                        checked={selectedFields.includes(field.name)}
                        onCheckedChange={() => handleFieldToggle(field.name)}
                      />
                      <Label htmlFor={field.name} className="text-sm flex-1">
                        {field.name}
                      </Label>
                      <Badge variant={field.confidence >= 90 ? "default" : field.confidence >= 70 ? "secondary" : "outline"}>
                        {field.confidence}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Export Summary */}
            {exportOptions && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-sm mb-2">Export Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Document:</span>
                    <span className="ml-2 font-medium">{exportOptions.document.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <span className="ml-2 font-medium capitalize">{exportOptions.document.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Fields:</span>
                    <span className="ml-2 font-medium">{selectedFields.length} selected</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Format:</span>
                    <div className="ml-2 flex items-center">
                      {getFormatIcon(exportFormat)}
                      <span className="ml-1 font-medium">{exportFormat.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleExport} 
              disabled={isExporting || !exportName || selectedFields.length === 0}
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Export...
                </>
              ) : (
                <>
                  {getFormatIcon(exportFormat)}
                  <span className="ml-2">Export as {exportFormat.toUpperCase()}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 