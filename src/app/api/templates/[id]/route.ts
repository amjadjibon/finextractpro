import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Get user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const templateId = id

    if (!templateId) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 })
    }

    // Get template from database
    let query = supabase
      .from('templates')
      .select('*')
      .eq('id', templateId)
    
    // Filter by user_id or public templates for security
    query = query.or(`user_id.eq.${user.id},is_public.eq.true`)

    const { data: template, error: dbError } = await query.single()

    if (dbError) {
      if (dbError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 })
      }
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 })
    }

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Transform template data for frontend
    const responseData = {
      id: template.id,
      name: template.name,
      description: template.description,
      type: template.document_type,
      status: template.status,
      fields: template.fields || [],
      fieldsCount: template.fields?.length || 0,
      settings: template.settings || {},
      accuracy: template.accuracy,
      documents: template.documents_processed || 0,
      createdDate: template.created_date,
      lastUsed: template.last_used,
      isPublic: template.is_public,
      isFavorite: template.is_favorite,
      tags: template.tags || [],
      userId: template.user_id,
      isOwner: user?.id === template.user_id
    }

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Template fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Get user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const templateId = id
    const body = await request.json()

    // Validate request body
    const allowedFields = [
      'name', 'description', 'document_type', 'status', 'fields', 
      'settings', 'is_public', 'is_favorite', 'tags'
    ]
    const updateData: any = {}
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    // Validate fields structure if provided
    if (updateData.fields && !Array.isArray(updateData.fields)) {
      return NextResponse.json({ 
        error: 'Fields must be an array' 
      }, { status: 400 })
    }

    // Update template
    let query = supabase
      .from('templates')
      .update(updateData)
      .eq('id', templateId)
    
    // Filter by user_id for security (only owner can update)
    query = query.eq('user_id', user.id)

    const { data, error: updateError } = await query.select().single()

    if (updateError) {
      if (updateError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Template not found or access denied' }, { status: 404 })
      }
      console.error('Update error:', updateError)
      return NextResponse.json({ error: 'Failed to update template' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      template: {
        id: data.id,
        name: data.name,
        description: data.description,
        type: data.document_type,
        status: data.status,
        fields: data.fields?.length || 0,
        fieldsData: data.fields,
        lastUpdated: data.updated_at
      }
    })

  } catch (error) {
    console.error('Template update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Get user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const templateId = id

    // Check if template is being used by documents
    const { data: documentsUsingTemplate, error: docsError } = await supabase
      .from('documents')
      .select('id')
      .eq('template_id', templateId)
      .limit(1)

    if (docsError) {
      console.error('Error checking template usage:', docsError)
      return NextResponse.json({ error: 'Failed to check template usage' }, { status: 500 })
    }

    if (documentsUsingTemplate && documentsUsingTemplate.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete template that is being used by documents' 
      }, { status: 400 })
    }

    // Delete template
    let deleteQuery = supabase
      .from('templates')
      .delete()
      .eq('id', templateId)
    
    // Filter by user_id for security (only owner can delete)
    deleteQuery = deleteQuery.eq('user_id', user.id)

    const { error: deleteError } = await deleteQuery

    if (deleteError) {
      if (deleteError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Template not found or access denied' }, { status: 404 })
      }
      console.error('Database deletion error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Template deleted successfully' })

  } catch (error) {
    console.error('Template deletion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}