/**
 * Exports API Routes
 * 
 * Handles CRUD operations for export jobs
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { aiExporter, type ExportRequest, type DocumentExportData } from '@/lib/exports/ai-exporter'

export interface ExportJob {
  id: string
  user_id: string
  name: string
  description?: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired'
  type: 'document_export' | 'template_export' | 'bulk_export'
  format: 'json' | 'csv' | 'excel' | 'pdf' | 'zip'
  filters: Record<string, any>
  include_fields: string[]
  settings: Record<string, any>
  file_path?: string
  file_size: number
  records_count: number
  download_count: number
  created_at: string
  updated_at: string
  started_at?: string
  completed_at?: string
  expires_at: string
  error_message?: string
  retry_count: number
}

// GET /api/exports - List user's exports
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const format = searchParams.get('format')

    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from('exports')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }
    if (type) {
      query = query.eq('type', type)
    }
    if (format) {
      query = query.eq('format', format)
    }

    const { data: exports, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch exports' }, { status: 500 })
    }

    // Calculate pagination
    const totalPages = Math.ceil((count || 0) / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      exports: exports || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    })

  } catch (error) {
    console.error('Exports API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/exports - Create new export job with AI processing
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      description,
      type = 'document_export',
      format = 'json',
      filters = {},
      include_fields = [],
      settings = {},
      document_ids = [] // New: specify which documents to export
    } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'Export name is required' }, { status: 400 })
    }

    // Validate type and format
    const validTypes = ['document_export', 'template_export', 'bulk_export']
    const validFormats = ['json', 'csv', 'excel']

    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid export type' }, { status: 400 })
    }

    if (!validFormats.includes(format)) {
      return NextResponse.json({ error: 'Invalid export format' }, { status: 400 })
    }

    // Create export job in database first
    const newExport = {
      user_id: user.id,
      name,
      description,
      type,
      format,
      filters,
      include_fields,
      settings,
      status: 'processing',
      file_size: 0,
      records_count: 0,
      download_count: 0,
      retry_count: 0,
      started_at: new Date().toISOString()
    }

    const { data: exportJob, error: insertError } = await supabase
      .from('exports')
      .insert(newExport)
      .select()
      .single()

    if (insertError) {
      console.error('Error creating export:', insertError)
      return NextResponse.json({ error: 'Failed to create export' }, { status: 500 })
    }

    try {
      // Fetch documents to export
      let documentsQuery = supabase
        .from('documents')
        .select('id, name, document_type, status, extracted_fields, confidence, pages, processed_date, template')
        .eq('user_id', user.id)

      // Apply document ID filter if specified
      if (document_ids.length > 0) {
        documentsQuery = documentsQuery.in('id', document_ids)
      }

      // Apply filters
      if (filters.documentType) {
        documentsQuery = documentsQuery.eq('document_type', filters.documentType)
      }
      if (filters.status) {
        documentsQuery = documentsQuery.eq('status', filters.status)
      }

      const { data: documents, error: fetchError } = await documentsQuery

      if (fetchError) {
        throw new Error(`Failed to fetch documents: ${fetchError.message}`)
      }

      if (!documents || documents.length === 0) {
        throw new Error('No documents found matching the export criteria')
      }

      // Transform documents for AI processing
      const documentsForExport: DocumentExportData[] = documents.map(doc => ({
        id: doc.id,
        name: doc.name,
        type: doc.document_type || 'unknown',
        status: doc.status,
        extractedFields: doc.extracted_fields || [],
        metadata: {
          confidence: doc.confidence,
          processingDate: doc.processed_date,
          pages: doc.pages,
          template: doc.template
        }
      }))

      // Create AI export request
      const exportRequest: ExportRequest = {
        userId: user.id,
        name,
        description,
        format: format as 'json' | 'csv' | 'excel',
        documents: documentsForExport,
        filters,
        includeFields: include_fields,
        settings
      }

      // Generate export using AI
      console.log(`🚀 Starting AI export generation for user ${user.id}`)
      const exportResult = await aiExporter.generateExport(exportRequest)

      if (!exportResult.success) {
        throw new Error(exportResult.error || 'Export generation failed')
      }

      // Update export job with results
      const updateData = {
        status: 'completed',
        file_path: exportResult.filePath,
        file_size: exportResult.fileSize || 0,
        records_count: exportResult.recordsCount || 0,
        completed_at: new Date().toISOString()
      }

      const { data: updatedExport, error: updateError } = await supabase
        .from('exports')
        .update(updateData)
        .eq('id', exportJob.id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating export job:', updateError)
        // Don't fail the request since the export was generated successfully
      }

      console.log(`✅ Export completed successfully: ${exportResult.fileName}`)

      return NextResponse.json({ 
        export: updatedExport || exportJob,
        file_url: exportResult.fileUrl,
        message: 'Export generated successfully'
      }, { status: 201 })

    } catch (processingError) {
      console.error('Export processing error:', processingError)
      
      // Update export job status to failed
      await supabase
        .from('exports')
        .update({
          status: 'failed',
          error_message: processingError instanceof Error ? processingError.message : 'Unknown error',
          completed_at: new Date().toISOString()
        })
        .eq('id', exportJob.id)
        .eq('user_id', user.id)

      return NextResponse.json({ 
        error: 'Export processing failed',
        details: processingError instanceof Error ? processingError.message : 'Unknown error'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Export creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/exports - Bulk delete exports
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const idsParam = searchParams.get('ids')
    
    if (!idsParam) {
      return NextResponse.json({ error: 'Export IDs are required' }, { status: 400 })
    }

    const ids = idsParam.split(',').filter(id => id.trim())
    
    if (ids.length === 0) {
      return NextResponse.json({ error: 'No valid export IDs provided' }, { status: 400 })
    }

    // Delete exports (RLS will ensure user can only delete their own)
    const { error: deleteError } = await supabase
      .from('exports')
      .delete()
      .in('id', ids)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting exports:', deleteError)
      return NextResponse.json({ error: 'Failed to delete exports' }, { status: 500 })
    }

    return NextResponse.json({ message: `Successfully deleted ${ids.length} exports` })

  } catch (error) {
    console.error('Bulk delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}