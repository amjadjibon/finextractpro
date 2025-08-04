/**
 * Export Download API Route
 * 
 * Handles downloading of completed export files
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { exportsStorage } from '@/lib/storage/s3-client'

// GET /api/exports/[id]/download - Download export file
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get export job details
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

    // Check if export is completed
    if (exportJob.status !== 'completed') {
      return NextResponse.json({ 
        error: 'Export is not ready for download', 
        status: exportJob.status 
      }, { status: 400 })
    }

    // Check if export has expired
    if (new Date(exportJob.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Export has expired' }, { status: 410 })
    }

    // Check if file exists
    if (!exportJob.file_path) {
      return NextResponse.json({ error: 'Export file not found' }, { status: 404 })
    }

    try {
      // Get file from storage
      const { data: fileBlob, error: downloadError } = await exportsStorage.download(exportJob.file_path)

      if (downloadError || !fileBlob) {
        console.error('Storage download error:', downloadError)
        return NextResponse.json({ error: 'Failed to download export file' }, { status: 500 })
      }

      // Update download count
      await supabase
        .from('exports')
        .update({ download_count: exportJob.download_count + 1 })
        .eq('id', id)

      // Determine content type based on format
      const contentTypes = {
        json: 'application/json',
        csv: 'text/csv',
        excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        pdf: 'application/pdf',
        zip: 'application/zip'
      }

      const contentType = contentTypes[exportJob.format as keyof typeof contentTypes] || 'application/octet-stream'

      // Create response with file
      const response = new NextResponse(fileBlob, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${exportJob.name}"`,
          'Content-Length': exportJob.file_size.toString(),
          'Cache-Control': 'private, no-cache'
        }
      })

      return response

    } catch (downloadError) {
      console.error('File download error:', downloadError)
      return NextResponse.json({ error: 'Failed to download export file' }, { status: 500 })
    }

  } catch (error) {
    console.error('Export download error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}