import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { env } from '@/lib/env'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100) // Max 100 items
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const type = searchParams.get('type') || 'all'
    const sortBy = searchParams.get('sortBy') || 'upload_date'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const offset = (page - 1) * limit

    // Build query with template join
    let query = supabase
      .from('documents')
      .select(`
        *,
        template:templates(id, name, document_type)
      `, { count: 'exact' })
    
    // Filter by user_id for security
    query = query.eq('user_id', user.id)

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,original_name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    if (type !== 'all') {
      query = query.eq('document_type', type)
    }

    // Apply sorting
    const validSortFields = ['upload_date', 'processed_date', 'name', 'file_size', 'confidence']
    const validSortOrders = ['asc', 'desc']
    
    if (validSortFields.includes(sortBy) && validSortOrders.includes(sortOrder)) {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: documents, error: dbError, count } = await query

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
    }

    // Transform documents for frontend
    const transformedDocuments = documents?.map((doc: any) => ({
      id: doc.id,
      name: doc.name,
      originalName: doc.original_name,
      type: doc.document_type,
      status: doc.status,
      uploadDate: doc.upload_date,
      processedDate: doc.processed_date,
      size: formatFileSize(doc.file_size),
      sizeBytes: doc.file_size,
      fileType: doc.file_type,
      confidence: doc.confidence,
      pages: doc.pages,
      fieldsExtracted: doc.fields_extracted || 0,
      description: doc.description,
      template: doc.template || 'auto',
      templateId: doc.template_id,
      templateData: doc.template ? {
        id: doc.template.id,
        name: doc.template.name,
        type: doc.template.document_type
      } : null
    })) || []

    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      documents: transformedDocuments,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNextPage,
        hasPrevPage
      },
      filters: {
        search,
        status,
        type,
        sortBy,
        sortOrder
      }
    })

  } catch (error) {
    console.error('Documents list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}