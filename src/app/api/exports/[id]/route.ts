/**
 * Individual Export API Routes
 * 
 * Handles CRUD operations for specific export jobs
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { documentsStorage } from '@/lib/storage/s3-client'

// GET /api/exports/[id] - Get specific export job
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    const { data: exportJob, error } = await supabase
      .from('exports')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Export not found' }, { status: 404 })
      }
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch export' }, { status: 500 })
    }

    return NextResponse.json({ export: exportJob })

  } catch (error) {
    console.error('Export fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/exports/[id] - Update export job
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()

    // Only allow updating certain fields
    const allowedFields = ['name', 'description', 'status', 'file_path', 'file_size', 'records_count', 'error_message', 'started_at', 'completed_at']
    const updateData: any = {}

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const { data: exportJob, error } = await supabase
      .from('exports')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Export not found' }, { status: 404 })
      }
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to update export' }, { status: 500 })
    }

    return NextResponse.json({ export: exportJob })

  } catch (error) {
    console.error('Export update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/exports/[id] - Delete specific export job
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Get export info first to clean up files
    const { data: exportJob, error: fetchError } = await supabase
      .from('exports')
      .select('file_path')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Database error:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch export' }, { status: 500 })
    }

    // Delete the file from storage if it exists
    if (exportJob?.file_path) {
      try {
        await documentsStorage.delete(exportJob.file_path)
      } catch (storageError) {
        console.warn('Failed to delete export file:', storageError)
        // Continue with database deletion even if file deletion fails
      }
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('exports')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Database error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete export' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Export deleted successfully' })

  } catch (error) {
    console.error('Export deletion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}