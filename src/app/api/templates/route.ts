import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    const sortBy = searchParams.get('sortBy') || 'created_date'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const includePublic = searchParams.get('includePublic') === 'true'

    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from('templates')
      .select('*', { count: 'exact' })
    
    // Filter by user_id or public templates
    if (includePublic) {
      query = query.or(`user_id.eq.${user.id},is_public.eq.true`)
    } else {
      query = query.eq('user_id', user.id)
    }

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    if (type !== 'all') {
      query = query.eq('document_type', type)
    }

    // Apply sorting
    const validSortFields = ['created_date', 'last_used', 'name', 'accuracy', 'documents_processed']
    const validSortOrders = ['asc', 'desc']
    
    if (validSortFields.includes(sortBy) && validSortOrders.includes(sortOrder)) {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: templates, error: dbError, count } = await query

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
    }

    // Transform templates for frontend
    const transformedTemplates = templates?.map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
      type: template.document_type,
      status: template.status,
      fields: template.fields?.length || 0,
      fieldsData: template.fields,
      documents: template.documents_processed || 0,
      accuracy: template.accuracy,
      createdDate: template.created_date,
      lastUsed: template.last_used,
      isPublic: template.is_public,
      isFavorite: template.is_favorite,
      tags: template.tags || [],
      settings: template.settings || {},
      userId: template.user_id
    })) || []

    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      templates: transformedTemplates,
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
        sortOrder,
        includePublic
      }
    })

  } catch (error) {
    console.error('Templates list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.document_type) {
      return NextResponse.json({ 
        error: 'Name and document type are required' 
      }, { status: 400 })
    }

    // Validate fields structure
    if (body.fields && !Array.isArray(body.fields)) {
      return NextResponse.json({ 
        error: 'Fields must be an array' 
      }, { status: 400 })
    }

    const templateData = {
      id: crypto.randomUUID(),
      name: body.name,
      description: body.description || null,
      document_type: body.document_type,
      status: body.status || 'draft',
      fields: body.fields || [],
      settings: body.settings || {},
      is_public: body.is_public || false,
      is_favorite: body.is_favorite || false,
      tags: body.tags || [],
      user_id: user?.id || 'anonymous',
      created_date: new Date().toISOString(),
      accuracy: null,
      documents_processed: 0,
      last_used: null
    }

    // Insert template record
    const { data: dbData, error: dbError } = await supabase
      .from('templates')
      .insert(templateData)
      .select()
      .single()

    if (dbError) {
      console.error('Database insert error:', dbError)
      return NextResponse.json({ 
        error: 'Failed to create template' 
      }, { status: 500 })
    }

    // Return success response
    return NextResponse.json({
      success: true,
      template: {
        id: dbData.id,
        name: dbData.name,
        description: dbData.description,
        type: dbData.document_type,
        status: dbData.status,
        fields: dbData.fields?.length || 0,
        fieldsData: dbData.fields,
        createdDate: dbData.created_date
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Template creation error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}