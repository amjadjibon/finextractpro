/**
 * Exports API Routes
 * 
 * Handles CRUD operations for export jobs
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

// POST /api/exports - Create new export job
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
      settings = {}
    } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'Export name is required' }, { status: 400 })
    }

    // Validate type and format
    const validTypes = ['document_export', 'template_export', 'bulk_export']
    const validFormats = ['json', 'csv', 'excel', 'pdf', 'zip']

    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid export type' }, { status: 400 })
    }

    if (!validFormats.includes(format)) {
      return NextResponse.json({ error: 'Invalid export format' }, { status: 400 })
    }

    // Create new export job
    const newExport = {
      user_id: user.id,
      name,
      description,
      type,
      format,
      filters,
      include_fields,
      settings,
      status: 'pending',
      file_size: 0,
      records_count: 0,
      download_count: 0,
      retry_count: 0
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

    // TODO: Queue the export job for background processing
    // For now, we'll just return the created job
    
    return NextResponse.json({ export: exportJob }, { status: 201 })

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