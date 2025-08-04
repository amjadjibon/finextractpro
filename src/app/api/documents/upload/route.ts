import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { env } from '@/lib/env'
import { documentParser, DocumentParsingResult } from '@/lib/ai/parser'
import { dataFormatter } from '@/lib/ai/formatter'
import { validateAIConfig } from '@/lib/ai/config'

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
    const documentData: any = {
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
      processing_history: [] as any[]
    }

    // Process document with AI
    let parsingResult: DocumentParsingResult | null = null
    let processingError: string | null = null
    
    try {
      // Validate AI configuration
      const aiValidation = validateAIConfig()
      if (!aiValidation.isValid) {
        console.warn('⚠️ AI processing disabled:', aiValidation.error)
        processingError = aiValidation.error || 'AI configuration invalid'
      } else {
        console.log('🤖 Starting AI document processing...')
        
        // Get template data if specified
        let templateData = null
        if (validatedTemplateId) {
          const { data } = await supabase
            .from('templates')
            .select('*')
            .eq('id', validatedTemplateId)
            .single()
          
          if (data) {
            templateData = {
              id: data.id,
              name: data.name,
              document_type: data.document_type,
              fields: data.fields,
              settings: data.settings
            }
          }
        }
        
        // Process document with AI
        parsingResult = await documentParser.parseDocumentWithFile(file, templateData)
        
        console.log(`✅ AI processing completed with ${parsingResult.confidence}% confidence`)
        console.log(`📊 Extracted ${parsingResult.extracted_fields.length} fields`)
        
        // Update document data with AI results
        documentData.status = 'completed'
        documentData.confidence = parsingResult.confidence
        documentData.pages = parsingResult.metadata?.pages || 1
        documentData.fields_extracted = parsingResult.extracted_fields.length
        documentData.processed_date = new Date().toISOString()
        documentData.document_type = parsingResult.document_type
        
        // Store AI extraction results
        ;(documentData as any).extracted_fields = parsingResult.extracted_fields
        ;(documentData as any).structured_data = parsingResult.structured_data
        ;(documentData as any).ai_provider = parsingResult.metadata?.provider
        ;(documentData as any).ai_model = parsingResult.metadata?.model
        ;(documentData as any).processing_time_ms = parsingResult.metadata?.processing_time
        
        // Add processing history
        documentData.processing_history = [
          {
            id: 1,
            action: 'Document uploaded',
            timestamp: documentData.upload_date,
            user: 'User',
            details: `File uploaded: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`
          },
          {
            id: 2,
            action: 'AI processing started',
            timestamp: new Date().toISOString(),
            user: 'System',
            details: `Processing with ${parsingResult.metadata?.provider}/${parsingResult.metadata?.model}`
          },
          {
            id: 3,
            action: 'AI processing completed',
            timestamp: new Date().toISOString(),
            user: 'System',
            details: `Extracted ${parsingResult.extracted_fields.length} fields with ${parsingResult.confidence}% confidence in ${parsingResult.metadata?.processing_time}ms`
          }
        ]
      }
    } catch (error) {
      console.error('❌ AI processing failed:', error)
      processingError = error instanceof Error ? error.message : 'Unknown processing error'
      
      // Set document to processing failed state
      documentData.status = 'error'
      documentData.processing_history = [
        {
          id: 1,
          action: 'Document uploaded',
          timestamp: documentData.upload_date,
          user: 'User',
          details: `File uploaded: ${file.name}`
        },
        {
          id: 2,
          action: 'Processing failed',
          timestamp: new Date().toISOString(),
          user: 'System',
          details: `AI processing failed: ${processingError}`
        }
      ]
    }

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

    // Prepare response data
    const responseData: any = {
      success: true,
      document: {
        id: dbData.id,
        name: dbData.name,
        status: dbData.status,
        size: dbData.file_size,
        type: dbData.document_type,
        uploadedAt: dbData.upload_date,
        confidence: dbData.confidence,
        pages: dbData.pages,
        fieldsExtracted: dbData.fields_extracted,
        processedAt: dbData.processed_date
      }
    }
    
    // Add AI parsing results if available
    if (parsingResult) {
      responseData.parsing = {
        summary: parsingResult.summary,
        confidence: parsingResult.confidence,
        extractedFields: parsingResult.extracted_fields,
        structuredData: parsingResult.structured_data,
        provider: parsingResult.metadata?.provider,
        model: parsingResult.metadata?.model,
        processingTime: parsingResult.metadata?.processing_time
      }
      
      // Generate formatted exports
      try {
        const jsonExport = dataFormatter.toJSON(parsingResult)
        const csvExport = dataFormatter.toCSV(parsingResult)
        const structuredExport = dataFormatter.toStructured(parsingResult)
        
        responseData.exports = {
          json: {
            filename: jsonExport.filename,
            size: new Blob([jsonExport.data as string]).size,
            preview: JSON.stringify(parsingResult.structured_data, null, 2).slice(0, 500) + '...'
          },
          csv: {
            filename: csvExport.filename,
            size: new Blob([csvExport.data as string]).size,
            rows: parsingResult.extracted_fields.length
          },
          structured: {
            filename: structuredExport.filename,
            size: new Blob([structuredExport.data as string]).size,
            fields: parsingResult.extracted_fields.length
          }
        }
      } catch (formatError) {
        console.warn('Failed to generate export previews:', formatError)
      }
    }
    
    // Add processing error if occurred
    if (processingError) {
      responseData.processingError = processingError
    }
    
    return NextResponse.json(responseData, { status: 201 })

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