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

    const documentId = id

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 })
    }

    // Get document from database
    let query = supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
    
    // Filter by user_id for security
    query = query.eq('user_id', user.id)

    const { data: document, error: dbError } = await query.single()

    if (dbError) {
      if (dbError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 })
      }
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 })
    }

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Get file URL from Supabase Storage
    const { data: urlData } = await supabase.storage
      .from('documents')
      .createSignedUrl(document.file_path, 3600) // 1 hour expiration

    // Transform document data for frontend
    const responseData = {
      id: document.id,
      name: document.name,
      originalName: document.original_name,
      type: document.document_type,
      status: document.status,
      uploadDate: document.upload_date,
      processedDate: document.processed_date,
      size: formatFileSize(document.file_size),
      sizeBytes: document.file_size,
      fileType: document.file_type,
      template: document.template,
      description: document.description,
      confidence: document.confidence,
      pages: document.pages,
      fieldsExtracted: document.fields_extracted || 0,
      processingHistory: document.processing_history || [],
      fileUrl: urlData?.signedUrl,
      tags: [], // Could be added later
      extractedFields: document.extracted_fields || []
    }

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Document fetch error:', error)
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

    const documentId = id
    const body = await request.json()

    // Validate request body
    const allowedFields = ['description', 'document_type', 'template']
    const updateData: any = {}
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    // Update document
    let query = supabase
      .from('documents')
      .update(updateData)
      .eq('id', documentId)
    
    // Filter by user_id for security
    query = query.eq('user_id', user.id)

    const { data, error: updateError } = await query.select().single()

    if (updateError) {
      if (updateError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 })
      }
      console.error('Update error:', updateError)
      return NextResponse.json({ error: 'Failed to update document' }, { status: 500 })
    }

    return NextResponse.json({ success: true, document: data })

  } catch (error) {
    console.error('Document update error:', error)
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

    const documentId = id

    // Get document first to get file path
    let query = supabase
      .from('documents')
      .select('file_path')
      .eq('id', documentId)
    
    // Filter by user_id for security
    query = query.eq('user_id', user.id)

    const { data: document, error: fetchError } = await query.single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 })
    }

    // Delete from storage
    if (document.file_path) {
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.file_path])
      
      if (storageError) {
        console.error('Storage deletion error:', storageError)
        // Continue with database deletion even if storage fails
      }
    }

    // Delete from database
    let deleteQuery = supabase
      .from('documents')
      .delete()
      .eq('id', documentId)
    
    // Filter by user_id for security
    deleteQuery = deleteQuery.eq('user_id', user.id)

    const { error: deleteError } = await deleteQuery

    if (deleteError) {
      console.error('Database deletion error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Document deleted successfully' })

  } catch (error) {
    console.error('Document deletion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper functions
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// TODO: Add real field extraction logic