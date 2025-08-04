"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { templatesAPI } from "@/lib/api"
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
  LayoutTemplateIcon as Template,
  Edit,
  Trash2,
  Share,
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Save,
  Plus,
  Minus,
  Settings,
  Play,
  Download,
  Users,
  Star,
  Target,
  Calendar
} from "lucide-react"
import Link from "next/link"

interface TemplateField {
  name: string
  type: string
  required: boolean
  description?: string
}

interface TemplateData {
  id: string
  name: string
  description?: string
  type: string
  status: string
  fields: TemplateField[]
  fieldsCount: number
  settings: any
  accuracy?: number
  documents: number
  createdDate: string
  lastUsed?: string
  isPublic: boolean
  isFavorite: boolean
  tags: string[]
  userId: string
  isOwner: boolean
}

export default function TemplateViewPage() {
  const params = useParams()
  const router = useRouter()
  const [template, setTemplate] = useState<TemplateData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editedTemplate, setEditedTemplate] = useState<Partial<TemplateData>>({})

  useEffect(() => {
    const fetchTemplate = async () => {
      setLoading(true)
      try {
        const templateData = await templatesAPI.get(params.id as string)
        setTemplate(templateData)
        setEditedTemplate(templateData)
      } catch (error) {
        console.error('Error fetching template:', error)
        router.push("/dashboard/templates")
      } finally {
        setLoading(false)
      }
    }

    fetchTemplate()
  }, [params.id, router])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "draft":
        return <Clock className="w-5 h-5 text-yellow-500" />
      case "inactive":
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      draft: "secondary",
      inactive: "destructive"
    } as const
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status}
      </Badge>
    )
  }

  const getTypeLabel = (type: string) => {
    const labels = {
      "invoice": "Invoice",
      "bank-statement": "Bank Statement",
      "receipt": "Receipt",
      "tax-form": "Tax Form",
      "contract": "Contract",
      "expense-report": "Expense Report"
    } as const
    
    return labels[type as keyof typeof labels] || type
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const handleSave = async () => {
    if (!template) return
    
    try {
      const updatedTemplate = await templatesAPI.update(template.id, editedTemplate)
      setTemplate({ ...template, ...updatedTemplate.template })
      setEditing(false)
    } catch (error) {
      console.error('Error updating template:', error)
      alert('Failed to update template. Please try again.')
    }
  }

  const handleDeleteTemplate = async () => {
    if (!template) return
    
    try {
      await templatesAPI.delete(template.id)
      router.push("/dashboard/templates")
    } catch (error) {
      console.error('Error deleting template:', error)
      alert('Failed to delete template. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/dashboard/templates">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Templates
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

  if (!template) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/dashboard/templates">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Templates
            </Button>
          </Link>
        </div>
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Template Not Found</h1>
          <p className="text-gray-600">The requested template could not be found.</p>
        </div>
      </div>
    )
  }

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
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Template className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">{template.name}</h1>
              {getStatusIcon(template.status)}
              {getStatusBadge(template.status)}
              {template.isFavorite && (
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
              )}
              {template.isPublic && (
                <Users className="w-5 h-5 text-blue-500" />
              )}
            </div>
            <p className="text-gray-600">
              {template.description || "No description available"}
            </p>
          </div>
          
          <div className="flex space-x-2">
            {template.isOwner && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setEditing(!editing)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {editing ? 'Cancel' : 'Edit'}
                </Button>
                {editing && (
                  <Button size="sm" onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                )}
              </>
            )}
            <Button variant="outline" size="sm">
              <Play className="w-4 h-4 mr-2" />
              Test
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Download className="w-4 h-4 mr-2" />
                  Export Template
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share className="w-4 h-4 mr-2" />
                  Share Template
                </DropdownMenuItem>
                {template.isOwner && (
                  <>
                    <DropdownMenuSeparator />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Template
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Template</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{template.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            className="bg-red-600 hover:bg-red-700"
                            onClick={handleDeleteTemplate}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="fields" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="fields">Template Fields</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="usage">Usage Stats</TabsTrigger>
            </TabsList>

            <TabsContent value="fields" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Template Fields ({template.fieldsCount})</CardTitle>
                  <CardDescription>
                    Define the fields that will be extracted from documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {editing ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Edit Fields</h3>
                        <Button size="sm" variant="outline">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Field
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {template.fields.map((field, index) => (
                          <div key={index} className="flex gap-3 items-center p-3 border rounded">
                            <Input 
                              value={field.name}
                              placeholder="Field name"
                              className="flex-1"
                            />
                            <select className="border rounded px-3 py-2">
                              <option value="text">Text</option>
                              <option value="number">Number</option>
                              <option value="date">Date</option>
                              <option value="currency">Currency</option>
                              <option value="email">Email</option>
                              <option value="phone">Phone</option>
                            </select>
                            <label className="flex items-center">
                              <input type="checkbox" checked={field.required} className="mr-2" />
                              Required
                            </label>
                            <Button size="sm" variant="ghost">
                              <Minus className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Field Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Required</TableHead>
                          <TableHead>Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {template.fields.map((field, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{field.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{field.type}</Badge>
                            </TableCell>
                            <TableCell>
                              {field.required ? (
                                <Badge variant="default">Required</Badge>
                              ) : (
                                <Badge variant="secondary">Optional</Badge>
                              )}
                            </TableCell>
                            <TableCell>{field.description || "N/A"}</TableCell>
                          </TableRow>
                        ))}
                        {template.fields.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                              No fields defined for this template
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Template Settings</CardTitle>
                  <CardDescription>
                    Configure template behavior and processing options
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="confidence-threshold">Confidence Threshold</Label>
                      <Input 
                        id="confidence-threshold"
                        type="number"
                        min="0"
                        max="100"
                        value={template.settings?.confidence_threshold || 70}
                        disabled={!editing}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Minimum confidence score required for field extraction
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="auto-approve">
                        <input 
                          id="auto-approve"
                          type="checkbox"
                          checked={template.settings?.auto_approve || false}
                          disabled={!editing}
                          className="mr-2"
                        />
                        Auto-approve high confidence extractions
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="usage" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Usage Statistics</CardTitle>
                  <CardDescription>
                    Performance and usage metrics for this template
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded">
                      <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold">{template.documents}</p>
                      <p className="text-sm text-gray-500">Documents Processed</p>
                    </div>
                    <div className="text-center p-4 border rounded">
                      <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold">{template.accuracy || 0}%</p>
                      <p className="text-sm text-gray-500">Average Accuracy</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Template Info */}
          <Card>
            <CardHeader>
              <CardTitle>Template Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 text-sm">
                <div>
                  <Label className="text-gray-500">Type</Label>
                  <p className="font-medium">{getTypeLabel(template.type)}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Status</Label>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(template.status)}
                    {getStatusBadge(template.status)}
                  </div>
                </div>
                <div>
                  <Label className="text-gray-500">Fields</Label>
                  <p className="font-medium">{template.fieldsCount}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Created</Label>
                  <p className="font-medium">{formatDate(template.createdDate)}</p>
                </div>
                {template.lastUsed && (
                  <div>
                    <Label className="text-gray-500">Last Used</Label>
                    <p className="font-medium">{formatDate(template.lastUsed)}</p>
                  </div>
                )}
              </div>

              {template.tags && template.tags.length > 0 && (
                <div>
                  <Label className="text-gray-500">Tags</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {template.tags.map((tag, index) => (
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
              <Link href={`/dashboard/documents/upload?template=${template.id}`}>
                <Button variant="outline" className="w-full justify-start">
                  <Eye className="w-4 h-4 mr-2" />
                  Use Template
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start">
                <Play className="w-4 h-4 mr-2" />
                Test Template
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Export Template
              </Button>
              {template.isOwner && (
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Advanced Settings
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}