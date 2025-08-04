import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { documentParser } from '@/lib/ai/parser'
import { dataFormatter, ExportFormat } from '@/lib/ai/formatter'

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

    // Get export format from query params
    const { searchParams } = new URL(request.url)
    const format = (searchParams.get('format') || 'json') as ExportFormat
    const download = searchParams.get('download') === 'true'

    // Get document from database
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', user.id) // Ensure user owns the document
      .single()

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

    // Check if document has been processed
    if (document.status !== 'completed') {
      return NextResponse.json({ 
        error: `Document is not ready for export. Status: ${document.status}` 
      }, { status: 400 })
    }

    // Re-create parsing result from stored data
    // In a real implementation, you might store the full parsing result
    // For now, we'll create a minimal result from what we have
    const parsingResult = {
      summary: `Processed ${document.document_type} document`,
      document_type: document.document_type,
      confidence: document.confidence || 0,
      extracted_fields: document.extracted_fields || [],
      structured_data: document.structured_data || {},
      metadata: {
        pages: document.pages || 1,
        processing_time: 0,
        provider: 'stored',
        model: 'stored'
      }
    }

    // If we don't have extracted fields stored, we might need to re-process
    if (!document.extracted_fields || document.extracted_fields.length === 0) {
      // Get the file from storage and re-process if needed
      try {
        const { data: fileData } = await supabase.storage
          .from('documents')
          .download(document.file_path)
        
        if (fileData) {
          // Convert blob to file-like object
          const file = new File([fileData], document.name, { type: document.file_type })
          
          // Get template if used
          let template = null
          if (document.template_id) {
            const { data: templateData } = await supabase
              .from('templates')
              .select('*')
              .eq('id', document.template_id)
              .single()
            
            if (templateData) {
              template = {
                id: templateData.id,
                name: templateData.name,
                document_type: templateData.document_type,
                fields: templateData.fields,
                settings: templateData.settings
              }
            }
          }
          
          // Re-process the document
          const freshParsingResult = await documentParser.parseDocumentWithFile(file, template)
          
          // Use fresh results
          Object.assign(parsingResult, freshParsingResult)
          
          // Update document with fresh results
          await supabase
            .from('documents')
            .update({
              confidence: freshParsingResult.confidence,
              fields_extracted: freshParsingResult.extracted_fields.length,
              processed_date: new Date().toISOString()
            })
            .eq('id', documentId)
        }
      } catch (reprocessError) {
        console.warn('Failed to re-process document for export:', reprocessError)
        // Continue with stored data
      }
    }

    // Format data according to requested format
    let formattedData
    
    try {
      switch (format) {
        case 'csv':
          formattedData = dataFormatter.toCSV(parsingResult)
          break
        case 'structured':
          formattedData = dataFormatter.toStructured(parsingResult)
          break
        case 'json':
        default:
          formattedData = dataFormatter.toJSON(parsingResult)
          break
      }
    } catch (formatError) {
      console.error('Data formatting error:', formatError)
      return NextResponse.json({ error: 'Failed to format data' }, { status: 500 })
    }

    // Return data for download or preview
    if (download) {
      const headers = new Headers({
        'Content-Type': formattedData.mimeType,
        'Content-Disposition': `attachment; filename="${formattedData.filename}"`
      })
      
      return new NextResponse(formattedData.data as string, {
        status: 200,
        headers
      })
    } else {
      // Return metadata and preview
      return NextResponse.json({
        success: true,
        export: {
          format: formattedData.format,
          filename: formattedData.filename,
          size: new Blob([formattedData.data as string]).size,
          mimeType: formattedData.mimeType,
          preview: typeof formattedData.data === 'string' 
            ? formattedData.data.slice(0, 1000) + (formattedData.data.length > 1000 ? '...' : '')
            : JSON.stringify(formattedData.data).slice(0, 1000) + '...'
        },
        document: {
          id: document.id,
          name: document.name,
          type: document.document_type,
          confidence: parsingResult.confidence,
          fieldsExtracted: parsingResult.extracted_fields.length
        }
      })
    }

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}