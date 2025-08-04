"use client"

import React, { useState, useEffect, useCallback } from "react"
import { templatesAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
  LayoutTemplateIcon as Template,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Copy,
  Trash2,
  Eye,
  Star,
  Download,
  Upload,
  Users,
  Calendar,
  Target,
  Zap,
  Brain,
  Settings,
  Play,
} from "lucide-react"
import Link from "next/link"

// Templates will be loaded from the API

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  })

  // Fetch templates from API
  const fetchTemplates = useCallback(async () => {
    setLoading(true)
    try {
      const data = await templatesAPI.list({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        status: statusFilter,
        type: typeFilter,
        sortBy: 'created_date',
        sortOrder: 'desc',
        includePublic: true
      })
      
      setTemplates(data.templates)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching templates:', error)
      setTemplates([])
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, searchTerm, statusFilter, typeFilter])

  // Fetch templates on component mount and when filters change
  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const filteredTemplates = templates.filter((template) => {
    const matchesFavorites = !favoritesOnly || template.isFavorite
    return matchesFavorites
  })

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      draft: "secondary",
      testing: "outline",
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
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Templates</h1>
            <p className="text-gray-600 mt-1">
              Create and manage document processing templates
            </p>
          </div>
          <Link href="/dashboard/templates/create">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Templates</p>
                <p className="text-2xl font-bold">{templates.length}</p>
              </div>
              <Template className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {templates.filter(t => t.status === "active").length}
                </p>
              </div>
              <Zap className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Documents Processed</p>
                <p className="text-2xl font-bold text-blue-600">
                  {templates.reduce((sum, t) => sum + t.documents, 0)}
                </p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Accuracy</p>
                <p className="text-2xl font-bold text-purple-600">
                  {templates.filter(t => t.accuracy > 0).length > 0 ? Math.round(templates.filter(t => t.accuracy > 0).reduce((sum, t, _, arr) => sum + t.accuracy / arr.length, 0)) : 0}%
                </p>
              </div>
              <Brain className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Status: {statusFilter === "all" ? "All" : statusFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                    All Statuses
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("active")}>
                    Active
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("draft")}>
                    Draft
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("testing")}>
                    Testing
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>
                    Inactive
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Type: {typeFilter === "all" ? "All" : getTypeLabel(typeFilter)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setTypeFilter("all")}>
                    All Types
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTypeFilter("invoice")}>
                    Invoice
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTypeFilter("bank-statement")}>
                    Bank Statement
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTypeFilter("receipt")}>
                    Receipt
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTypeFilter("tax-form")}>
                    Tax Form
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTypeFilter("contract")}>
                    Contract
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant={favoritesOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setFavoritesOnly(!favoritesOnly)}
              >
                <Star className={`w-4 h-4 mr-2 ${favoritesOnly ? "fill-current" : ""}`} />
                Favorites
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Template className="w-5 h-5 text-primary" />
                  {template.isFavorite && (
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  )}
                  {template.isPublic && (
                    <Users className="w-4 h-4 text-blue-500" />
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Template
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Play className="w-4 h-4 mr-2" />
                      Test Template
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
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
                          <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription className="mt-1">
                  {template.description}
                </CardDescription>
              </div>

              <div className="flex items-center gap-2 mt-2">
                {getStatusBadge(template.status)}
                <Badge variant="outline">{getTypeLabel(template.type)}</Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Fields:</span>
                    <span className="font-medium">{template.fields}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Documents:</span>
                    <span className="font-medium">{template.documents}</span>
                  </div>
                  {template.accuracy > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Accuracy:</span>
                      <span className="font-medium text-green-600">{template.accuracy}%</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created:</span>
                    <span className="font-medium">{formatDate(template.createdDate)}</span>
                  </div>
                  {template.lastUsed && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Last Used:</span>
                      <span className="font-medium">{formatDate(template.lastUsed)}</span>
                    </div>
                  )}
                </div>
              </div>

              {template.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-4">
                  {template.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {template.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{template.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex space-x-2 mt-4">
                <Button size="sm" className="flex-1" asChild>
                  <Link href={`/dashboard/templates/${template.id}`}>
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Link>
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Settings className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Template className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== "all" || typeFilter !== "all" || favoritesOnly
                ? "Try adjusting your search or filters"
                : "Create your first template to get started with document processing"}
            </p>
            <Link href="/dashboard/templates/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common template management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Upload className="w-6 h-6" />
              Import Template
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Download className="w-6 h-6" />
              Export Templates
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Users className="w-6 h-6" />
              Browse Public Templates
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
