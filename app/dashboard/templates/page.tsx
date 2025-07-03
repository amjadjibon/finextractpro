"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FileText, Plus, Upload, MoreVertical, Edit, Copy, Trash2, Play, Users, Clock } from "lucide-react"
import Link from "next/link"

export default function TemplatesPage() {
  const templates = [
    {
      id: "1",
      name: "Standard Invoice Template",
      type: "Invoice",
      usage: 47,
      accuracy: "99.3%",
      created: "2 weeks ago",
      status: "active",
      description: "Extract invoice number, date, amount, and vendor details",
    },
    {
      id: "2",
      name: "Bank Statement Parser",
      type: "Bank Statement",
      usage: 23,
      accuracy: "98.9%",
      created: "1 month ago",
      status: "active",
      description: "Parse transaction details, balances, and account information",
    },
    {
      id: "3",
      name: "Tax Form 1120 Extractor",
      type: "Tax Document",
      usage: 12,
      accuracy: "99.7%",
      created: "3 weeks ago",
      status: "draft",
      description: "Extract corporate tax form data and calculations",
    },
    {
      id: "4",
      name: "Expense Report Template",
      type: "Expense Report",
      usage: 31,
      accuracy: "98.2%",
      created: "1 week ago",
      status: "active",
      description: "Process employee expense reports and receipts",
    },
    {
      id: "5",
      name: "Purchase Order Parser",
      type: "Purchase Order",
      usage: 18,
      accuracy: "99.1%",
      created: "2 weeks ago",
      status: "active",
      description: "Extract PO numbers, items, quantities, and pricing",
    },
    {
      id: "6",
      name: "Financial Statement Analyzer",
      type: "Financial Report",
      usage: 8,
      accuracy: "98.8%",
      created: "1 month ago",
      status: "active",
      description: "Parse balance sheets, income statements, and cash flow",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case "draft":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Draft</Badge>
      case "archived":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Archived</Badge>
      default:
        return null
    }
  }

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      Invoice: "bg-blue-100 text-blue-800",
      "Bank Statement": "bg-green-100 text-green-800",
      "Tax Document": "bg-purple-100 text-purple-800",
      "Expense Report": "bg-orange-100 text-orange-800",
      "Purchase Order": "bg-indigo-100 text-indigo-800",
      "Financial Report": "bg-red-100 text-red-800",
    }
    return colors[type] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Document Templates</h1>
            <p className="text-gray-600 mt-1">15 templates with 234 total uses this month</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Import Template
            </Button>
            <Link href="/dashboard/templates/create">
              <Button className="bg-blue-900 hover:bg-blue-800">
                <Plus className="w-4 h-4 mr-2" />
                Create New Template
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Templates (15)</TabsTrigger>
              <TabsTrigger value="my">My Templates (8)</TabsTrigger>
              <TabsTrigger value="public">Public Library (7)</TabsTrigger>
              <TabsTrigger value="recent">Recently Used (5)</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <Card key={template.id} className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="bg-gray-100 rounded-lg p-3 mb-3">
                          <FileText className="w-6 h-6 text-gray-600" />
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Play className="w-4 h-4 mr-2" />
                              Apply to Batch
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="text-sm">{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge className={`${getTypeColor(template.type)} hover:${getTypeColor(template.type)}`}>
                          {template.type}
                        </Badge>
                        {getStatusBadge(template.status)}
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Usage this month:</span>
                          <span className="font-medium">{template.usage} times</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Accuracy rate:</span>
                          <span className="font-medium text-green-600">{template.accuracy}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Created:</span>
                          <span className="font-medium">{template.created}</span>
                        </div>
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <Button size="sm" className="flex-1 bg-blue-900 hover:bg-blue-800">
                          Use Template
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="my">
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your Templates</h3>
                <p className="text-gray-500 mb-4">Templates you've created will appear here</p>
                <Link href="/dashboard/templates/create">
                  <Button className="bg-blue-900 hover:bg-blue-800">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Template
                  </Button>
                </Link>
              </div>
            </TabsContent>

            <TabsContent value="public">
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Public Template Library</h3>
                <p className="text-gray-500 mb-4">Browse community-created templates</p>
                <Button variant="outline">Browse Library</Button>
              </div>
            </TabsContent>

            <TabsContent value="recent">
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Recently Used Templates</h3>
                <p className="text-gray-500">Templates you've used recently will appear here</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Template Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Most Used Template</span>
                </div>
                <p className="font-medium">Standard Invoice Template</p>
                <p className="text-xs text-gray-500">47 uses this month</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Highest Accuracy</span>
                </div>
                <p className="font-medium">Tax Form 1120 Extractor</p>
                <p className="text-xs text-green-600">99.7% accuracy</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Templates Created</span>
                </div>
                <p className="font-medium">3 this month</p>
                <p className="text-xs text-gray-500">15 total</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Documents Processed</span>
                </div>
                <p className="font-medium">1,247 this month</p>
                <p className="text-xs text-green-600">+12% from last month</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/dashboard/templates/create">
                <Button className="w-full justify-start bg-blue-900 hover:bg-blue-800">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Template
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Upload className="w-4 h-4 mr-2" />
                Import Template
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Users className="w-4 h-4 mr-2" />
                Browse Public Library
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
