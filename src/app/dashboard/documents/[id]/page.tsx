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
} from "lucide-react"
import Link from "next/link"

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
                    <div 
                      className="bg-white shadow-lg border rounded"
                      style={{ 
                        transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                        transformOrigin: "center",
                        transition: "transform 0.2s ease"
                      }}
                    >
                      {/* Simulated document preview */}
                      <div className="w-96 h-[500px] p-6 text-sm">
                        <div className="text-center mb-4">
                          <h2 className="text-xl font-bold">INVOICE</h2>
                          <p className="text-gray-600">INV-2024-001</p>
                        </div>
                        
                        <div className="mb-4">
                          <h3 className="font-semibold">From:</h3>
                          <p>Acme Services Ltd</p>
                          <p>123 Business St</p>
                          <p>City, State 12345</p>
                        </div>

                        <div className="mb-4">
                          <p><strong>Date:</strong> January 15, 2024</p>
                          <p><strong>Due Date:</strong> February 15, 2024</p>
                          <p><strong>Terms:</strong> Net 30</p>
                        </div>

                        <div className="border-t pt-4">
                          <h3 className="font-semibold mb-2">Services:</h3>
                          <p>Monthly consulting services</p>
                        </div>

                        <div className="border-t pt-4 mt-8">
                          <div className="flex justify-between mb-1">
                            <span>Subtotal:</span>
                            <span>$1,250.00</span>
                          </div>
                          <div className="flex justify-between mb-1">
                            <span>Tax:</span>
                            <span>$125.00</span>
                          </div>
                          <div className="flex justify-between font-bold text-lg border-t pt-1">
                            <span>Total:</span>
                            <span>$1,375.00</span>
                          </div>
                        </div>
                      </div>
                    </div>
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
              <Button variant="outline" className="w-full justify-start">
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
    </div>
  )
} 