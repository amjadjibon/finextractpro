/**
 * AI Document Parser Service
 * 
 * Handles document parsing using AI providers with template-based extraction
 */

import { generateObject } from 'ai'
import { z } from 'zod'
import { getAIProvider, getAIConfig, PROVIDER_CONFIGS } from './config'

// Base schema for extracted fields
const ExtractedFieldSchema = z.object({
  name: z.string().describe('The name/label of the field'),
  value: z.string().describe('The extracted value as a string'),
  confidence: z.number().min(0).max(100).describe('Confidence score from 0-100'),
  type: z.enum(['text', 'number', 'date', 'currency', 'address', 'email', 'phone']).describe('The data type of the field'),
  position: z.object({
    page: z.number().optional().describe('Page number where found'),
    coordinates: z.object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number()
    }).optional().describe('Bounding box coordinates if available')
  }).optional()
})

// Schema for the complete parsing response
const DocumentParsingSchema = z.object({
  summary: z.string().describe('Brief summary of the document content and type'),
  document_type: z.enum(['invoice', 'receipt', 'bank-statement', 'tax-form', 'contract', 'expense-report', 'other']).describe('Detected document type'),
  confidence: z.number().min(0).max(100).describe('Overall confidence in the extraction'),
  extracted_fields: z.array(ExtractedFieldSchema).describe('All extracted fields from the document'),
  structured_data: z.record(z.string(), z.any()).describe('Key-value pairs of the most important data'),
  metadata: z.object({
    pages: z.number().describe('Number of pages processed'),
    processing_time: z.number().describe('Processing time in milliseconds'),
    provider: z.string().describe('AI provider used'),
    model: z.string().describe('AI model used')
  }).optional()
})

export type ExtractedField = z.infer<typeof ExtractedFieldSchema>
export type DocumentParsingResult = z.infer<typeof DocumentParsingSchema>

// Template interface for structured extraction
export interface DocumentTemplate {
  id: string
  name: string
  document_type: string
  fields: Array<{
    name: string
    type: string
    required: boolean
    description?: string
  }>
  settings: {
    confidence_threshold: number
    auto_approve: boolean
  }
}

// Default template for unknown document types
const DEFAULT_TEMPLATE: DocumentTemplate = {
  id: 'default',
  name: 'Default Document Parser',
  document_type: 'other',
  fields: [
    { name: 'Document Title', type: 'text', required: false, description: 'Main title or header of the document' },
    { name: 'Date', type: 'date', required: false, description: 'Any date mentioned in the document' },
    { name: 'Amount', type: 'currency', required: false, description: 'Any monetary amount found' },
    { name: 'Organization', type: 'text', required: false, description: 'Company or organization name' },
    { name: 'Contact Info', type: 'text', required: false, description: 'Phone, email, or address' },
    { name: 'Reference Number', type: 'text', required: false, description: 'Any reference, ID, or tracking number' }
  ],
  settings: {
    confidence_threshold: 70,
    auto_approve: false
  }
}

// Generate template-specific prompt
function generatePrompt(template: DocumentTemplate, documentText: string): string {
  const fieldDescriptions = template.fields.map(field => 
    `- ${field.name} (${field.type}${field.required ? ', required' : ''}): ${field.description || 'Extract this field if present'}`
  ).join('\n')

  return `
You are an expert document parsing AI. Extract structured data from the following document text.

DOCUMENT TYPE: ${template.document_type}
TEMPLATE: ${template.name}

REQUIRED FIELDS TO EXTRACT:
${fieldDescriptions}

DOCUMENT TEXT:
${documentText}

INSTRUCTIONS:
1. Carefully analyze the document and extract ALL requested fields
2. For each field, provide a confidence score (0-100) based on how certain you are
3. If a field is not found, still include it with an empty value and confidence 0
4. For currency fields, extract the numeric value and currency symbol/code
5. For dates, use ISO format (YYYY-MM-DD) when possible
6. For addresses, include the complete address as a single string
7. Detect and classify the document type accurately
8. Include any additional relevant data in the structured_data object
9. Focus on extracting numbers, amounts, dates, and key identifiers
10. If this looks like tabular data, structure it appropriately

Return the extracted data in the specified JSON schema format.
`
}

// Generate default prompt for unknown document types
function generateDefaultPrompt(documentText: string): string {
  return `
You are an expert document parsing AI. Extract all relevant structured data from this document.

DOCUMENT TEXT:
${documentText}

INSTRUCTIONS:
1. Identify the document type (invoice, receipt, contract, etc.)
2. Extract ALL key information including:
   - Names, organizations, and people
   - Dates (in ISO format YYYY-MM-DD when possible)
   - Numbers, amounts, and currencies
   - Addresses, emails, and phone numbers
   - Reference numbers, IDs, and codes
   - Any tabular data or line items
3. For each extracted field, provide a confidence score (0-100)
4. Structure tabular data as arrays or objects when appropriate
5. Focus on extracting actionable business data
6. If the document contains financial data, prioritize amounts and totals
7. For receipts/invoices, extract line items if present

Provide comprehensive extraction with high accuracy and appropriate confidence scores.
`
}

export class DocumentParser {
  private startTime: number = 0

  async parseDocument(
    documentText: string, 
    template?: DocumentTemplate | null
  ): Promise<DocumentParsingResult> {
    this.startTime = Date.now()
    
    try {
      const config = getAIConfig()
      const provider = getAIProvider()
      const selectedTemplate = template || DEFAULT_TEMPLATE
      
      // Generate the appropriate prompt
      const prompt = template 
        ? generatePrompt(selectedTemplate, documentText)
        : generateDefaultPrompt(documentText)
      
      console.log(`🤖 Starting AI parsing with ${config.provider}/${config.model}`)
      console.log(`📄 Document length: ${documentText.length} characters`)
      
      // Generate structured response using AI SDK
      const result = await generateObject({
        model: provider,
        schema: DocumentParsingSchema,
        prompt,
        temperature: 0.1, // Low temperature for consistent extraction
      })
      
      const processingTime = Date.now() - this.startTime
      
      // Enhance the result with metadata
      const enhancedResult: DocumentParsingResult = {
        ...result.object,
        metadata: {
          pages: this.estimatePageCount(documentText),
          processing_time: processingTime,
          provider: config.provider,
          model: config.model
        }
      }
      
      console.log(`✅ Parsing completed in ${processingTime}ms`)
      console.log(`📊 Extracted ${enhancedResult.extracted_fields.length} fields`)
      console.log(`🎯 Overall confidence: ${enhancedResult.confidence}%`)
      
      return enhancedResult
      
    } catch (error) {
      console.error('❌ Document parsing failed:', error)
      
      // Return a fallback result
      return {
        summary: 'Failed to parse document due to AI service error',
        document_type: 'other',
        confidence: 0,
        extracted_fields: [],
        structured_data: {},
        metadata: {
          pages: 1,
          processing_time: Date.now() - this.startTime,
          provider: getAIConfig().provider,
          model: getAIConfig().model
        }
      }
    }
  }

  // Enhanced parsing with file input (for image documents)
  async parseDocumentWithFile(
    file: File,
    template?: DocumentTemplate | null
  ): Promise<DocumentParsingResult> {
    try {
      const config = getAIConfig()
      const providerConfig = PROVIDER_CONFIGS[config.provider]
      
      // Check if provider supports vision
      if (this.isImageFile(file) && !providerConfig.supportsVision) {
        throw new Error(`Provider ${config.provider} does not support image processing. Please use OpenAI or Google.`)
      }
      
      if (this.isImageFile(file)) {
        return await this.parseImageDocument(file, template)
      } else {
        // For text files, extract text first
        const text = await this.extractTextFromFile(file)
        return await this.parseDocument(text, template)
      }
      
    } catch (error) {
      console.error('❌ File parsing failed:', error)
      throw error
    }
  }
  
  // Parse image documents using vision capabilities
  private async parseImageDocument(
    file: File,
    template?: DocumentTemplate | null
  ): Promise<DocumentParsingResult> {
    this.startTime = Date.now()
    
    const config = getAIConfig()
    const provider = getAIProvider()
    const selectedTemplate = template || DEFAULT_TEMPLATE
    
    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const mimeType = file.type
    
    const prompt = template 
      ? `Extract data according to this template for ${selectedTemplate.document_type}: ${JSON.stringify(selectedTemplate.fields, null, 2)}`
      : 'Extract all structured data from this document image'
    
    try {
      const result = await generateObject({
        model: provider,
        schema: DocumentParsingSchema,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { 
                type: 'image', 
                image: `data:${mimeType};base64,${base64}`
              }
            ]
          }
        ],
        temperature: 0.1,
      })
      
      const processingTime = Date.now() - this.startTime
      
      return {
        ...result.object,
        metadata: {
          pages: 1,
          processing_time: processingTime,
          provider: config.provider,
          model: config.model
        }
      }
      
    } catch (error) {
      console.error('❌ Image parsing failed:', error)
      throw error
    }
  }
  
  // Extract text from various file types
  private async extractTextFromFile(file: File): Promise<string> {
    const text = await file.text()
    return text
  }
  
  // Helper methods
  private isImageFile(file: File): boolean {
    return file.type.startsWith('image/')
  }
  
  private estimatePageCount(text: string): number {
    // Rough estimation: ~500 words per page
    const wordCount = text.split(/\s+/).length
    return Math.max(1, Math.ceil(wordCount / 500))
  }
}

// Export singleton instance
export const documentParser = new DocumentParser()