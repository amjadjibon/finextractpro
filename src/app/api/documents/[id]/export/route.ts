/**
 * Single Document Export API Route
 * 
 * Handles exporting individual documents with AI-powered formatting
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { aiExporter, type ExportRequest, type DocumentExportData } from '@/lib/exports/ai-exporter'

// POST /api/documents/[id]/export - Export single document
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Get user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      format = 'json',
      exportName,
      description,
      includeFields = [],
      settings = {}
    } = body

    // Validate format
    const validFormats = ['json', 'csv', 'excel']
    if (!validFormats.includes(format)) {
      return NextResponse.json({ error: 'Invalid export format' }, { status: 400 })
    }

    // Get the document from database
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('id, name, document_type, status, extracted_fields, confidence, pages, processed_date, template, description')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 })
      }
      console.error('Database error:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 })
    }

    // Check if document is processed
    if (document.status !== 'completed') {
      return NextResponse.json({ 
        error: 'Document is not fully processed yet',
        status: document.status 
      }, { status: 400 })
    }

    // Transform document for AI processing
    const documentForExport: DocumentExportData = {
      id: document.id,
      name: document.name,
      type: document.document_type || 'unknown',
      status: document.status,
      extractedFields: document.extracted_fields || [],
      metadata: {
        confidence: document.confidence,
        processingDate: document.processed_date,
        pages: document.pages,
        template: document.template
      }
    }

    // Create export name if not provided
    const finalExportName = exportName || `${document.name}_export_${Date.now()}`
    const finalDescription = description || `${format.toUpperCase()} export of ${document.name}`

    // Create AI export request
    const exportRequest: ExportRequest = {
      userId: user.id,
      name: finalExportName,
      description: finalDescription,
      format: format as 'json' | 'csv' | 'excel',
      documents: [documentForExport], // Single document
      filters: {
        documentType: document.document_type
      },
      includeFields: includeFields.length > 0 ? includeFields : undefined,
      settings: {
        groupByType: false, // Single document, no grouping needed
        includeMetadata: true,
        ...settings
      }
    }

    console.log(`🚀 Starting single document export: ${document.name} (${format})`)

    // Generate export using AI
    const exportResult = await aiExporter.generateExport(exportRequest)

    if (!exportResult.success) {
      console.error('Export generation failed:', exportResult.error)
      return NextResponse.json({ 
        error: 'Export generation failed',
        details: exportResult.error 
      }, { status: 500 })
    }

    // Create export job record in database for tracking
    const exportJob = {
      user_id: user.id,
      name: finalExportName,
      description: finalDescription,
      type: 'document_export',
      format: format,
      filters: { document_id: id },
      include_fields: includeFields,
      settings: settings,
      status: 'completed',
      file_path: exportResult.filePath,
      file_size: exportResult.fileSize || 0,
      records_count: 1, // Single document
      download_count: 0,
      retry_count: 0,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString()
    }

    const { data: createdExport, error: insertError } = await supabase
      .from('exports')
      .insert(exportJob)
      .select()
      .single()

    if (insertError) {
      console.error('Error creating export record:', insertError)
      return NextResponse.json({ 
        error: 'Failed to create export record',
        details: insertError.message 
      }, { status: 500 })
    }

    console.log(`✅ Single document export completed: ${exportResult.fileName}`)

    return NextResponse.json({
      success: true,
      export: {
        id: createdExport.id,
        name: createdExport.name,
        description: createdExport.description,
        status: createdExport.status,
        type: createdExport.type,
        format: createdExport.format,
        file_size: createdExport.file_size,
        records_count: createdExport.records_count,
        created_at: createdExport.created_at,
        completed_at: createdExport.completed_at
      },
      message: `Document "${document.name}" exported successfully as ${format.toUpperCase()}. You can download it from the Exports page.`
    }, { status: 200 })

  } catch (error) {
    console.error('Single document export error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET /api/documents/[id]/export - Get export options for document
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Get user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the document from database
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('id, name, document_type, status, extracted_fields, confidence, pages, template')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 })
      }
      console.error('Database error:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 })
    }

    // Extract available fields for selection
    const availableFields = document.extracted_fields?.map((field: {
      name: string
      type: string
      confidence: number
      value: string
    }) => ({
      name: field.name,
      type: field.type,
      confidence: field.confidence,
      hasValue: !!field.value
    })) || []

    return NextResponse.json({
      document: {
        id: document.id,
        name: document.name,
        type: document.document_type,
        status: document.status,
        confidence: document.confidence,
        pages: document.pages,
        template: document.template,
        fieldsCount: availableFields.length
      },
      exportOptions: {
        availableFormats: ['json', 'csv', 'excel'],
        availableFields: availableFields,
        suggestedName: `${document.name}_export`,
        canExport: document.status === 'completed' && availableFields.length > 0
      }
    })

  } catch (error) {
    console.error('Document export options error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}