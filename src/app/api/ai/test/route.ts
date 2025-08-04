import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { documentParser } from '@/lib/ai/parser'
import { dataFormatter } from '@/lib/ai/formatter'
import { validateAIConfig } from '@/lib/ai/config'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate AI configuration
    const aiValidation = validateAIConfig()
    if (!aiValidation.isValid) {
      return NextResponse.json({ 
        error: 'AI configuration invalid', 
        details: aiValidation.error 
      }, { status: 400 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const templateId = formData.get('templateId') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Get template if specified
    let template = null
    if (templateId) {
      const { data: templateData } = await supabase
        .from('templates')
        .select('*')
        .eq('id', templateId)
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

    // Parse document with AI
    console.log(`🧪 Testing AI parsing for: ${file.name}`)
    const parsingResult = await documentParser.parseDocumentWithFile(file, template)

    // Generate different export formats
    const jsonExport = dataFormatter.toJSON(parsingResult)
    const csvExport = dataFormatter.toCSV(parsingResult)
    const structuredExport = dataFormatter.toStructured(parsingResult)

    return NextResponse.json({
      success: true,
      test: true,
      parsing: {
        summary: parsingResult.summary,
        document_type: parsingResult.document_type,
        confidence: parsingResult.confidence,
        fields_count: parsingResult.extracted_fields.length,
        provider: parsingResult.metadata?.provider,
        model: parsingResult.metadata?.model,
        processing_time: parsingResult.metadata?.processing_time
      },
      extracted_fields: parsingResult.extracted_fields,
      structured_data: parsingResult.structured_data,
      exports: {
        json: {
          filename: jsonExport.filename,
          size: new Blob([jsonExport.data as string]).size,
          preview: typeof jsonExport.data === 'string' 
            ? jsonExport.data.slice(0, 500) + '...'
            : 'Binary data'
        },
        csv: {
          filename: csvExport.filename,
          size: new Blob([csvExport.data as string]).size,
          rows: parsingResult.extracted_fields.length,
          preview: typeof csvExport.data === 'string' 
            ? csvExport.data.split('\n').slice(0, 5).join('\n') + '\n...'
            : 'Binary data'
        },
        structured: {
          filename: structuredExport.filename,
          size: new Blob([structuredExport.data as string]).size,
          fields: parsingResult.extracted_fields.length
        }
      }
    })

  } catch (error) {
    console.error('AI test error:', error)
    return NextResponse.json({ 
      error: 'AI parsing test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const aiValidation = validateAIConfig()
    
    return NextResponse.json({
      ai_status: aiValidation.isValid ? 'configured' : 'not_configured',
      error: aiValidation.error || null,
      message: aiValidation.isValid 
        ? 'AI services are properly configured and ready for use'
        : 'AI services require configuration',
      instructions: {
        setup: 'Set AI_PROVIDER (openai/google/groq) and appropriate API key',
        test: 'POST file to this endpoint to test AI parsing',
        providers: {
          openai: 'Supports text and images, high accuracy',
          google: 'Supports text and images, fast processing', 
          groq: 'Text only, very fast and cost-effective'
        }
      }
    })
  } catch (error) {
    return NextResponse.json({
      ai_status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}