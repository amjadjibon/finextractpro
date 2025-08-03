import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { env } from '@/lib/env'

// Supported file types
const SUPPORTED_TYPES = {
  'application/pdf': { ext: 'pdf', maxSize: 10 * 1024 * 1024 }, // 10MB
  'text/plain': { ext: 'txt', maxSize: 5 * 1024 * 1024 }, // 5MB
  'application/msword': { ext: 'doc', maxSize: 10 * 1024 * 1024 }, // 10MB
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { ext: 'docx', maxSize: 10 * 1024 * 1024 }, // 10MB
  'image/jpeg': { ext: 'jpg', maxSize: 5 * 1024 * 1024 }, // 5MB
  'image/png': { ext: 'png', maxSize: 5 * 1024 * 1024 }, // 5MB
  'image/tiff': { ext: 'tiff', maxSize: 10 * 1024 * 1024 }, // 10MB
}

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client
    const supabase = await createClient()
    
    // Get user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const documentType = formData.get('documentType') as string
    const template = formData.get('template') as string
    const templateId = formData.get('templateId') as string
    const description = formData.get('description') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const fileType = SUPPORTED_TYPES[file.type as keyof typeof SUPPORTED_TYPES]
    if (!fileType) {
      return NextResponse.json({ 
        error: `Unsupported file type: ${file.type}` 
      }, { status: 400 })
    }

    // Validate file size
    if (file.size > fileType.maxSize) {
      return NextResponse.json({ 
        error: `File too large. Maximum size is ${fileType.maxSize / (1024 * 1024)}MB` 
      }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const userId = user.id
    const fileExtension = file.name.split('.').pop() || fileType.ext
    const fileName = `${userId}_${timestamp}.${fileExtension}`
    const filePath = `documents/${userId}/${fileName}`

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ 
        error: 'Failed to upload file to storage' 
      }, { status: 500 })
    }

    // Validate template if provided
    let validatedTemplateId = null
    if (templateId && templateId !== 'auto') {
      const { data: templateData, error: templateError } = await supabase
        .from('templates')
        .select('id, user_id, is_public')
        .eq('id', templateId)
        .single()

      if (!templateError && templateData) {
        // Check if user has access to this template (owner or public)
        if (templateData.user_id === userId || templateData.is_public) {
          validatedTemplateId = templateId
        }
      }
    }

    // Create document record in database
    const documentData = {
      id: crypto.randomUUID(),
      name: file.name,
      original_name: file.name,
      file_path: uploadData.path,
      file_size: file.size,
      file_type: file.type,
      document_type: documentType || 'unknown',
      template: template || 'auto',
      template_id: validatedTemplateId,
      description: description || null,
      status: 'uploaded',
      user_id: userId,
      upload_date: new Date().toISOString(),
      processed_date: null,
      confidence: null,
      pages: null,
      fields_extracted: 0,
      processing_history: []
    }

    // TODO: Add real document processing logic here

    // Insert document record
    const { data: dbData, error: dbError } = await supabase
      .from('documents')
      .insert(documentData)
      .select()
      .single()

    if (dbError) {
      console.error('Database insert error:', dbError)
      
      // Clean up uploaded file if database insert fails
      await supabase.storage
        .from('documents')
        .remove([uploadData.path])
        
      return NextResponse.json({ 
        error: 'Failed to save document record' 
      }, { status: 500 })
    }

    // Return success response
    return NextResponse.json({
      success: true,
      document: {
        id: dbData.id,
        name: dbData.name,
        status: dbData.status,
        size: dbData.file_size,
        type: dbData.document_type,
        uploadedAt: dbData.upload_date
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Document upload error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    error: 'Method not allowed' 
  }, { status: 405 })
}