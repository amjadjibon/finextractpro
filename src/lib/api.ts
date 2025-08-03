/**
 * API utility functions for making HTTP requests
 */

export class APIError extends Error {
  status: number
  
  constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.name = 'APIError'
  }
}

export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`
    
    try {
      const errorData = await response.json()
      errorMessage = errorData.error || errorMessage
    } catch {
      // If response is not JSON, use default message
    }
    
    throw new APIError(errorMessage, response.status)
  }

  return response.json()
}

export async function uploadFile(
  file: File,
  metadata: {
    documentType?: string
    template?: string
    description?: string
  } = {}
): Promise<{
  document: {
    id: string
    name: string
    status: string
    size: number
    uploadedAt: string
  }
}> {
  const formData = new FormData()
  formData.append('file', file)
  
  if (metadata.documentType) formData.append('documentType', metadata.documentType)
  if (metadata.template) formData.append('template', metadata.template)  
  if (metadata.description) formData.append('description', metadata.description)

  const response = await fetch('/api/documents/upload', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    let errorMessage = `Upload failed: ${response.statusText}`
    
    try {
      const errorData = await response.json()
      errorMessage = errorData.error || errorMessage
    } catch {
      // If response is not JSON, use default message
    }
    
    throw new APIError(errorMessage, response.status)
  }

  return response.json()
}

export const documentsAPI = {
  list: (params: {
    page?: number
    limit?: number
    search?: string
    status?: string
    type?: string
    sortBy?: string
    sortOrder?: string
  } = {}) => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString())
      }
    })
    
    return apiRequest<{
      documents: any[]
      pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
        hasNextPage: boolean
        hasPrevPage: boolean
      }
    }>(`/api/documents?${searchParams}`)
  },

  get: (id: string) => {
    return apiRequest(`/api/documents/${id}`)
  },

  update: (id: string, data: {
    description?: string
    document_type?: string
    template?: string
  }) => {
    return apiRequest(`/api/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete: (id: string) => {
    return apiRequest(`/api/documents/${id}`, {
      method: 'DELETE',
    })
  },

  upload: uploadFile,
}

export const templatesAPI = {
  list: (params: {
    page?: number
    limit?: number
    search?: string
    status?: string
    type?: string
    sortBy?: string
    sortOrder?: string
    includePublic?: boolean
  } = {}) => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString())
      }
    })
    
    return apiRequest<{
      templates: any[]
      pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
        hasNextPage: boolean
        hasPrevPage: boolean
      }
    }>(`/api/templates?${searchParams}`)
  },

  get: (id: string) => {
    return apiRequest(`/api/templates/${id}`)
  },

  create: (data: {
    name: string
    description?: string
    document_type: string
    status?: string
    fields?: any[]
    settings?: any
    is_public?: boolean
    is_favorite?: boolean
    tags?: string[]
  }) => {
    return apiRequest(`/api/templates`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: (id: string, data: {
    name?: string
    description?: string
    document_type?: string
    status?: string
    fields?: any[]
    settings?: any
    is_public?: boolean
    is_favorite?: boolean
    tags?: string[]
  }) => {
    return apiRequest(`/api/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete: (id: string) => {
    return apiRequest(`/api/templates/${id}`, {
      method: 'DELETE',
    })
  },
}