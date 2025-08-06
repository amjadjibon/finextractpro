/**
 * AI Document Parser Service
 * 
 * Handles document parsing using AI providers with template-based extraction
 */

import { generateObject } from 'ai'
import { z } from 'zod'
import { getAIProvider, getAIConfig, PROVIDER_CONFIGS } from './config'
import { pdfParser } from '@/lib/pdf/parser'

// Base schema for extracted fields
const ExtractedFieldSchema = z.object({
  name: z.string().describe('The name/label of the field'),
  value: z.string().describe('The extracted value as a string'),
  confidence: z.number().int().min(0).max(100).describe('Confidence score from 0-100 as integer'),
  type: z.enum(['text', 'number', 'date', 'currency', 'address', 'email', 'phone', 'list', 'table']).describe('The data type of the field'),
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

// Schema for table/list data items - Gemini compatible
const TableRowSchema = z.object({
  id: z.string().optional().describe('Row identifier or sequence number'),
  values: z.array(z.string()).describe('Array of column values in the same order as headers'),
  confidence: z.number().int().min(0).max(100).describe('Confidence score for this row')
})

// Schema for structured table data - Gemini compatible
const TableDataSchema = z.object({
  name: z.string().describe('Name/title of the table or list'),
  headers: z.array(z.string()).describe('Column headers or field names'),
  rows: z.array(TableRowSchema).describe('Array of data rows with values matching header order'),
  summary: z.object({
    total_rows: z.number().describe('Total number of rows'),
    total_amount: z.string().optional().describe('Sum of monetary values if applicable'),
    date_range: z.object({
      start: z.string().optional().describe('Earliest date found'),
      end: z.string().optional().describe('Latest date found')
    }).optional()
  }).optional().describe('Summary statistics for the table')
})

// Schema for structured data - Enhanced with table support
const StructuredDataSchema = z.object({
  document_id: z.string().optional().describe('Document reference number or ID'),
  document_title: z.string().optional().describe('Document title or name'),
  primary_date: z.string().optional().describe('Main date from document (ISO format)'),
  secondary_date: z.string().optional().describe('Additional relevant date (ISO format)'),
  primary_entity: z.string().optional().describe('Main organization or person'),
  secondary_entity: z.string().optional().describe('Client, customer, or other party'),
  primary_amount: z.string().optional().describe('Main monetary value'),
  secondary_amount: z.string().optional().describe('Additional monetary value'),
  contact_info: z.string().optional().describe('Contact information found'),
  location: z.string().optional().describe('Address or location information'),
  status: z.string().optional().describe('Document status or category'),
  additional_data: z.string().optional().describe('Other important information as JSON string'),
  tables: z.array(TableDataSchema).optional().describe('Structured table/list data extracted from the document')
}).describe('Key-value pairs of the most important structured data including tabular information')

// Schema for the complete parsing response
const DocumentParsingSchema = z.object({
  summary: z.string().describe('Brief summary of the document content and type'),
  document_type: z.enum(['invoice', 'receipt', 'bank-statement', 'tax-form', 'contract', 'expense-report', 'other']).describe('Detected document type'),
  confidence: z.number().int().min(0).max(100).describe('Overall confidence in the extraction as integer'),
  extracted_fields: z.array(ExtractedFieldSchema).describe('All extracted fields from the document'),
  structured_data: StructuredDataSchema,
  metadata: z.object({
    pages: z.number().describe('Number of pages processed'),
    processing_time: z.number().describe('Processing time in milliseconds'),
    provider: z.string().describe('AI provider used'),
    model: z.string().describe('AI model used'),
    parsing_mode: z.string().optional().describe('Parsing mode used (template-based, smart auto-detection, etc.)'),
    template_used: z.string().optional().describe('Name of the template used for parsing'),
    pdf_info: z.object({
      title: z.string().optional(),
      author: z.string().optional(),
      creator: z.string().optional(),
      pages: z.number().optional(),
      text_length: z.number().optional()
    }).optional().describe('PDF metadata if document is PDF')
  }).optional()
})

export type ExtractedField = z.infer<typeof ExtractedFieldSchema>
export type TableRow = z.infer<typeof TableRowSchema>
export type TableData = z.infer<typeof TableDataSchema>
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

// Default template for unknown document types - Generic Smart Parser
const DEFAULT_TEMPLATE: DocumentTemplate = {
  id: 'default',
  name: 'Smart Document Parser',
  document_type: 'other',
  fields: [
    { name: 'Document Type', type: 'text', required: true, description: 'Automatically classify document type (invoice, resume, contract, receipt, form, report, etc.)' },
    { name: 'Document Title', type: 'text', required: false, description: 'Main title, header, subject, or document name' },
    { name: 'Document ID/Number', type: 'text', required: false, description: 'Any reference number, ID, or tracking code' },
    { name: 'Primary Date', type: 'date', required: false, description: 'Most important date (creation, transaction, due date, etc.)' },
    { name: 'Secondary Date', type: 'date', required: false, description: 'Additional relevant date if present' },
    { name: 'Primary Entity', type: 'text', required: false, description: 'Main organization, company, or person name' },
    { name: 'Secondary Entity', type: 'text', required: false, description: 'Client, customer, recipient, or other party' },
    { name: 'Primary Amount', type: 'currency', required: false, description: 'Main monetary value, total, or amount' },
    { name: 'Secondary Amount', type: 'currency', required: false, description: 'Subtotal, tax, or other financial value' },
    { name: 'Contact Information', type: 'text', required: false, description: 'Phone, email, address, or other contact details' },
    { name: 'Key-Value Pairs', type: 'text', required: false, description: 'Important field-value relationships found in document' },
    { name: 'Named Entities', type: 'text', required: false, description: 'People, places, organizations, or specific identifiers' },
    { name: 'Transaction List', type: 'table', required: true, description: 'Bank transactions with Date, Description, Type, Money Out, Money In, Balance columns - MANDATORY for bank statements' },
    { name: 'Table Data', type: 'table', required: false, description: 'Any other structured tabular information (line items, schedules, etc.)' },
    { name: 'Status/Category', type: 'text', required: false, description: 'Document status, priority, or classification' },
    { name: 'Summary/Description', type: 'text', required: false, description: 'Brief overview or main content description' }
  ],
  settings: {
    confidence_threshold: 60,
    auto_approve: false
  }
}

// Generate template-specific prompt
function generatePrompt(template: DocumentTemplate, documentText: string): string {
  const fieldDescriptions = template.fields.map(field => 
    `- ${field.name} (${field.type}${field.required ? ', REQUIRED' : ', optional'}): ${field.description || 'Extract this field value if present in the document'}`
  ).join('\n')

  const confidenceThreshold = template.settings?.confidence_threshold || 70

  // Check if this is the default smart parser template
  const isGenericParser = template.id === 'default'

  if (isGenericParser) {
    return `
You are an expert AI document parser designed to extract structured information from unstructured documents. You support OCR processing, key-value extraction, table parsing, and automatic document classification.

SMART DOCUMENT PARSER - GENERIC EXTRACTION MODE
CONFIDENCE THRESHOLD: ${confidenceThreshold}%

DOCUMENT CONTENT:
${documentText}

PRIMARY OBJECTIVES:
1. DOCUMENT CLASSIFICATION: Automatically detect document type (invoice, resume, contract, receipt, form, report, etc.)
2. OCR PROCESSING: Handle scanned documents, handwritten text, and image-based content
3. STRUCTURED EXTRACTION: Extract all meaningful data in a structured format
4. TABLE PARSING: Identify and extract tabular data with proper structure
5. KEY-VALUE EXTRACTION: Find field-value relationships throughout the document

EXTRACTION TARGETS:
${fieldDescriptions}

COMPREHENSIVE EXTRACTION INSTRUCTIONS:

1. DOCUMENT TYPE DETECTION:
   - Analyze headers, footers, layout, and content patterns
   - Identify document purpose and category
   - Look for identifying elements (logos, forms, signatures, etc.)

2. NAMED ENTITY RECOGNITION:
   - Extract all person names, organization names, locations
   - Identify dates, numbers, IDs, and reference codes
   - Find contact information (emails, phones, addresses)

3. KEY-VALUE PAIR EXTRACTION:
   - Identify field labels and their corresponding values
   - Extract form fields, invoice line items, contract terms
   - Capture metadata like "Invoice Number: 12345", "Due Date: 2024-01-15"

4. TABLE AND TABULAR DATA EXTRACTION:
   - **CRITICAL**: Detect ALL tables, lists, and structured data sections
   - **BANK STATEMENTS**: Look for transaction lists with columns like:
     * Date (various formats: 1 February, 01/02, Feb 1, etc.)
     * Description (transaction details, merchant names, payment types)
     * Money Out/Debit (negative amounts, withdrawals, payments)
     * Money In/Credit (positive amounts, deposits, income)
     * Balance (running balance after each transaction)
   - **TRANSACTION PATTERNS**: Identify patterns like:
     * "Card payment - [merchant]"
     * "Direct debit - [company]"
     * "Cash withdrawal - [location]"
     * "[Company] BiWeekly Payment"
     * "Direct Deposit - [source]"
   - Extract table headers and identify column types (date, amount, description, etc.)
   - Extract EVERY row of data with proper column mapping
   - For invoices: Item, Quantity, Price, Amount
   - For receipts: Item, Quantity, Unit Price, Total
   - Calculate totals and validate mathematical relationships
   - Handle complex tables with merged cells, subtotals, and nested data
   - Create structured JSON arrays for each table found

5. OCR AND IMAGE PROCESSING:
   - Process scanned documents and handwritten text
   - Handle rotated, skewed, or low-quality images
   - Extract text from forms, receipts, and printed documents

6. DATA FORMATTING AND VALIDATION:
   - Standardize dates (YYYY-MM-DD format)
   - Format currency values with symbols
   - Clean and normalize text fields
   - Validate email addresses and phone numbers
   - Ensure address completeness

7. CONFIDENCE SCORING (0-100 INTEGER VALUES ONLY):
   - 95-100: Crystal clear, unambiguous text
   - 85-94: Clear text with minor formatting issues
   - 70-84: Readable with some uncertainty
   - 50-69: Partially visible, requires interpretation
   - Below 50: Unclear, damaged, or illegible

8. COMPREHENSIVE OUTPUT:
   - Extract ALL relevant information, even if not in template
   - Include section headers, footnotes, and additional context
   - Capture document structure and formatting cues
   - Identify signatures, stamps, and official marks

STRUCTURED DATA OUTPUT FORMAT:
- document_id: Any reference number or ID found
- document_title: Main title or header text
- primary_date: Most important date (use ISO format YYYY-MM-DD)
- secondary_date: Additional relevant date (use ISO format YYYY-MM-DD)
- primary_entity: Main organization, company, or person
- secondary_entity: Client, customer, or recipient
- primary_amount: Main monetary value with currency symbol
- secondary_amount: Additional monetary value (subtotal, tax, etc.)
- contact_info: Phone, email, address information
- location: Physical address or location data
- status: Document status, priority, or classification
- additional_data: Any other important data as JSON string
- tables: Array of structured table/list data with the following format:
  * name: Table title/description
  * headers: Column names array
  * rows: Array of data objects with column mappings
  * summary: Statistics like total_rows, total_amount, date_range

CRITICAL: For documents with tabular data (bank statements, invoices, receipts), 
ALWAYS extract the complete table data in the 'tables' field. Each row must be 
a complete record with all column values properly mapped.

**BANK STATEMENT TRANSACTION EXTRACTION - MANDATORY**:
When processing bank statements, you MUST extract ALL transaction data including:
- Every transaction row from the statement
- Proper column mapping: Date → Description → Money Out → Money In → Balance
- Handle various date formats (1 February, Feb 1, 01/02, etc.)
- Extract complete transaction descriptions
- Preserve monetary values with proper formatting
- Calculate and validate running balances
- Create a comprehensive transactions table in the 'tables' array

Example bank statement transaction table structure:
{
  "name": "Transaction History",
  "headers": ["Date", "Description", "Money Out", "Money In", "Balance"],
  "rows": [
    {"values": ["1 February", "Card payment - High St Petrol Station", "24.50", "", "39,975.50"]},
    {"values": ["3 February", "Direct debit - Green Mobile Phone Bill", "20.00", "", "39,955.50"]},
    {"values": ["4 February", "YourJob BiWeekly Payment", "", "2,575.00", "42,530.50"]}
  ],
  "summary": {
    "total_rows": 12,
    "total_amount": "£4,079.83",
    "date_range": {"start": "2024-02-01", "end": "2024-03-01"}
  }
}

QUALITY ASSURANCE:
- Cross-validate extracted data for consistency
- Check mathematical relationships (totals, calculations)
- Verify date logic and chronological order
- Ensure entity relationships make sense
- Flag potential OCR errors or ambiguous content

Your goal is to make this document completely searchable, actionable, and structured for automated processing while maintaining high accuracy and comprehensive coverage.
`
  }

  // Original template-specific prompt for custom templates
  return `
You are an expert document parsing AI specialized in ${template.document_type} processing. Extract data according to the specific template requirements.

DOCUMENT TYPE: ${template.document_type}
TEMPLATE: ${template.name}
CONFIDENCE THRESHOLD: ${confidenceThreshold}%

SPECIFIC FIELDS TO EXTRACT:
${fieldDescriptions}

DOCUMENT TEXT:
${documentText}

TEMPLATE-SPECIFIC INSTRUCTIONS:
1. This document should be a ${template.document_type} - verify this matches the content
2. Extract EVERY field listed above, even if the value is empty or unclear
3. For REQUIRED fields, search more thoroughly and use context clues if needed
4. For optional fields, extract if clearly present, otherwise leave empty

EXTRACTION RULES:
1. FIELD MATCHING: Look for exact field names, synonyms, and related terms
2. CONFIDENCE SCORING (0-100) Integer value:
   - Required fields: Minimum ${confidenceThreshold}% confidence expected
   - Optional fields: Any confidence level acceptable
   - If below ${confidenceThreshold}% confidence, flag for manual review
3. DATA FORMATTING:
   - Currency: Include symbol and amount (e.g., "$1,234.56")
   - Dates: ISO format YYYY-MM-DD when possible
   - Numbers: Clean numeric values without extra formatting
   - Text: Clean, trimmed text without extra whitespace
   - Addresses: Complete address as single field
   - Phone/Email: Properly formatted contact information

4. QUALITY CHECKS:
   - Verify extracted amounts add up correctly (subtotal + tax = total)
   - Check date logic (invoice date before due date)
   - Validate format consistency (all dates in same format)
   - Cross-reference related fields for accuracy

5. ADDITIONAL DATA:
   - Extract any other relevant information not in the template
   - Include in structured_data object for completeness
   - Pay attention to line items, tables, and detailed breakdowns

Remember: This template was created specifically for ${template.document_type} documents. Focus on the business context and use domain knowledge to improve extraction accuracy.
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
      
      // Determine parsing approach
      let prompt: string
      let parsingMode: string
      
      if (template && template.id !== 'default') {
        // Use specific template
        prompt = generatePrompt(template, documentText)
        parsingMode = `template-based (${template.name})`
      } else {
        // Use smart default parsing with the enhanced DEFAULT_TEMPLATE
        prompt = generatePrompt(DEFAULT_TEMPLATE, documentText)
        parsingMode = 'smart auto-detection'
      }
      
      console.log(`🤖 Starting AI parsing with ${config.provider}/${config.model}`)
      console.log(`📋 Parsing mode: ${parsingMode}`)
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
          model: config.model,
          parsing_mode: parsingMode,
          template_used: template?.name || 'Smart Document Parser'
        }
      }
      
      console.log(`✅ Parsing completed in ${processingTime}ms`)
      console.log(`📊 Extracted ${enhancedResult.extracted_fields.length} fields`)
      console.log(`🎯 Overall confidence: ${enhancedResult.confidence}%`)
      console.log(`📋 Template: ${template?.name || 'Smart Document Parser'}`)
      
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
          model: getAIConfig().model,
          parsing_mode: 'error-fallback',
          template_used: template?.name || 'Smart Document Parser'
        }
      }
    }
  }

  // Enhanced parsing with file input (for PDFs, images, and text documents)
  async parseDocumentWithFile(
    file: File,
    template?: DocumentTemplate | null
  ): Promise<DocumentParsingResult> {
    try {
      const config = getAIConfig()
      const providerConfig = PROVIDER_CONFIGS[config.provider]
      
      // Handle PDF files with text extraction
      if (this.isPDFFile(file)) {
        console.log('📄 Processing PDF file with text extraction')
        return await this.parsePDFDocument(file, template)
      }
      
      // Check if provider supports vision for images
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
  
  // Parse PDF documents using text extraction
  private async parsePDFDocument(
    file: File,
    template?: DocumentTemplate | null
  ): Promise<DocumentParsingResult> {
    this.startTime = Date.now()
    
    try {
      console.log(`📄 Extracting text from PDF: ${file.name}`)
      
      // Extract text from PDF
      const pdfResult = await pdfParser.parsePDFFromFile(file)
      const cleanedText = pdfParser.cleanExtractedText(pdfResult.text)
      
      console.log(`📝 Extracted ${cleanedText.length} characters from ${pdfResult.numPages} pages`)
      
      if (!cleanedText || cleanedText.trim().length === 0) {
        throw new Error('No text content could be extracted from the PDF')
      }
      
      // Use regular text parsing with extracted content
      const parsingResult = await this.parseDocument(cleanedText, template)
      
      // Enhance result with PDF metadata
      const processingTime = Date.now() - this.startTime
      const enhancedResult: DocumentParsingResult = {
        ...parsingResult,
        metadata: {
          pages: pdfResult.numPages,
          processing_time: processingTime,
          provider: parsingResult.metadata?.provider || 'unknown',
          model: parsingResult.metadata?.model || 'unknown',
          parsing_mode: template?.id !== 'default' 
            ? `template-based PDF text extraction (${template?.name})` 
            : 'smart auto-detection PDF text extraction',
          template_used: template?.name || 'Smart Document Parser',
          pdf_info: {
            title: pdfResult.info.title,
            author: pdfResult.info.author,
            creator: pdfResult.info.creator,
            pages: pdfResult.numPages,
            text_length: cleanedText.length
          }
        }
      }
      
      console.log(`✅ PDF processing completed in ${processingTime}ms`)
      console.log(`📊 Extracted ${enhancedResult.extracted_fields.length} fields`)
      console.log(`🎯 Overall confidence: ${enhancedResult.confidence}%`)
      
      return enhancedResult
      
    } catch (error) {
      console.error('❌ PDF parsing failed:', error)
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
    
    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const mimeType = file.type
    
    // Generate appropriate prompt for image processing
    let prompt: string
    let parsingMode: string
    
    if (template && template.id !== 'default') {
      prompt = `You are processing a ${template.document_type} document image using the "${template.name}" template.

TEMPLATE FIELDS TO EXTRACT:
${template.fields.map(f => `- ${f.name} (${f.type}): ${f.description}`).join('\n')}

Extract all the specified fields from this document image. For each field, provide the extracted value and confidence score. Also extract any additional relevant information not covered by the template fields.`
      parsingMode = `template-based image parsing (${template.name})`
    } else {
      prompt = `You are an expert AI document parser designed to extract structured information from document images. You support OCR processing, key-value extraction, table parsing, and automatic document classification.

SMART DOCUMENT PARSER - IMAGE PROCESSING MODE

PRIMARY OBJECTIVES:
1. DOCUMENT CLASSIFICATION: Automatically detect document type from visual layout and content
2. OCR PROCESSING: Extract text from scanned documents, handwritten content, and printed text
3. STRUCTURED EXTRACTION: Identify and extract all meaningful data in structured format
4. TABLE PARSING: Detect and extract tabular data with proper structure
5. KEY-VALUE EXTRACTION: Find field-value relationships throughout the document

COMPREHENSIVE IMAGE EXTRACTION:

1. DOCUMENT TYPE DETECTION:
   - Analyze visual layout, headers, logos, and formatting
   - Identify document category (invoice, resume, contract, receipt, form, etc.)
   - Look for distinctive visual elements and document structure

2. OCR AND TEXT EXTRACTION:
   - Extract all visible text including headers, body, and fine print
   - Handle different fonts, sizes, and text orientations
   - Process handwritten text and signatures
   - Deal with image quality issues, skew, and distortion

3. NAMED ENTITY RECOGNITION:
   - Extract person names, organization names, locations
   - Identify dates, numbers, IDs, and reference codes
   - Find contact information (emails, phones, addresses)

4. KEY-VALUE PAIR EXTRACTION:
   - Identify form fields and their values
   - Extract labeled data pairs throughout the document
   - Capture invoice line items, contract terms, etc.

5. TABLE AND STRUCTURED DATA EXTRACTION:
   - **CRITICAL**: Detect ALL tables, lists, and data grids in the image
   - **BANK STATEMENTS**: Identify transaction tables with columns like:
     * Date (look for date patterns in various formats)
     * Description (transaction details, merchant names)
     * Money Out/Debit (withdrawal amounts)
     * Money In/Credit (deposit amounts)  
     * Balance (running balance)
   - Extract table headers and identify column types
   - Extract EVERY row of data with accurate column mapping
   - For invoices: Item, Quantity, Price, Amount
   - Calculate totals and validate mathematical relationships
   - Handle complex visual layouts with multiple sections
   - **MANDATORY**: Create complete structured JSON arrays for each table
   - Process tables even if headers are not clearly visible

6. VISUAL ELEMENTS:
   - Identify signatures, stamps, and official marks
   - Note checkboxes, form selections, and marked fields
   - Recognize logos, letterheads, and branding elements

STRUCTURED DATA OUTPUT FORMAT:
- document_id: Any reference number or ID found
- document_title: Main title or header text
- primary_date: Most important date (use ISO format YYYY-MM-DD)
- secondary_date: Additional relevant date (use ISO format YYYY-MM-DD)
- primary_entity: Main organization, company, or person
- secondary_entity: Client, customer, or recipient
- primary_amount: Main monetary value with currency symbol
- secondary_amount: Additional monetary value (subtotal, tax, etc.)
- contact_info: Phone, email, address information
- location: Physical address or location data
- status: Document status, priority, or classification
- additional_data: Any other important data as JSON string (tables, line items, etc.)

Provide comprehensive extraction with confidence scores for each field. Extract ALL visible information that could be relevant for document processing and analysis.`
      parsingMode = 'smart auto-detection image parsing'
    }
    
    console.log(`🖼️ Processing image with ${parsingMode}`)
    
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
          model: config.model,
          parsing_mode: parsingMode,
          template_used: template?.name || 'Smart Document Parser'
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
  
  private isPDFFile(file: File): boolean {
    return file.type === 'application/pdf'
  }
  
  private estimatePageCount(text: string): number {
    // Rough estimation: ~500 words per page
    const wordCount = text.split(/\s+/).length
    return Math.max(1, Math.ceil(wordCount / 500))
  }
}

// Export singleton instance
export const documentParser = new DocumentParser()