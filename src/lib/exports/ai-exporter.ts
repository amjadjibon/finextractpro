/**
 * AI-Powered Export Service
 * 
 * Generates structured exports from document data using AI processing
 */

import { generateObject, LanguageModel } from 'ai'
import { z } from 'zod'
import { getAIProvider } from '@/lib/ai/config'
import { exportsStorage, storageUtils } from '@/lib/storage/s3-client'

// Export format schemas
const CSVExportSchema = z.object({
  headers: z.array(z.string()).describe('Column headers for the CSV file'),
  rows: z.array(z.array(z.string())).describe('Data rows with values corresponding to headers'),
  metadata: z.object({
    totalRecords: z.number(),
    exportDate: z.string(),
    columns: z.number()
  })
})

const JSONExportSchema = z.object({
  documents: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    extractedData: z.record(z.string(), z.any()),
    metadata: z.object({
      confidence: z.number().optional(),
      processingDate: z.string().optional(),
      pages: z.number().optional()
    })
  })),
  summary: z.object({
    totalDocuments: z.number(),
    documentTypes: z.record(z.string(), z.number()),
    averageConfidence: z.number(),
    exportDate: z.string()
  })
})

const ExcelExportSchema = z.object({
  sheets: z.array(z.object({
    name: z.string(),
    headers: z.array(z.string()),
    rows: z.array(z.array(z.string())),
    metadata: z.object({
      totalRows: z.number(),
      columns: z.number()
    }).optional()
  })),
  metadata: z.object({
    totalSheets: z.number(),
    exportDate: z.string(),
    creator: z.string().optional()
  })
})

export interface DocumentExportData {
  id: string
  name: string
  type: string
  status: string
  extractedFields: Array<{
    name: string
    value: string
    confidence: number
    type: string
  }>
  metadata: {
    confidence?: number
    processingDate?: string
    pages?: number
    template?: string
  }
}

export interface ExportRequest {
  userId: string
  name: string
  description?: string
  format: 'json' | 'csv' | 'excel'
  documents: DocumentExportData[]
  filters?: {
    documentType?: string
    confidenceThreshold?: number
    dateRange?: {
      start: string
      end: string
    }
  }
  includeFields?: string[]
  settings?: {
    groupByType?: boolean
    includeMetadata?: boolean
    customFields?: Array<{
      name: string
      description: string
    }>
  }
}

export interface ExportResult {
  success: boolean
  filePath?: string
  fileUrl?: string
  fileName?: string
  fileSize?: number
  recordsCount?: number
  error?: string
}

export class AIExporter {
  private startTime: number = 0

  /**
   * Generate AI-powered export in specified format
   */
  async generateExport(request: ExportRequest): Promise<ExportResult> {
    this.startTime = Date.now()
    
    try {
      console.log(`🤖 Starting AI export generation: ${request.format} format`)
      console.log(`📄 Processing ${request.documents.length} documents`)

      const provider = getAIProvider()

      // Generate export data based on format
      let exportData: any
      let fileName: string
      let contentType: string

      switch (request.format) {
        case 'json':
          exportData = await this.generateJSONExport(provider, request)
          fileName = `${request.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.json`
          contentType = 'application/json'
          break
        
        case 'csv':
          exportData = await this.generateCSVExport(provider, request)
          fileName = `${request.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.csv`
          contentType = 'text/csv'
          break
        
        case 'excel':
          exportData = await this.generateExcelExport(provider, request)
          fileName = `${request.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.xlsx`
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          break
        
        default:
          throw new Error(`Unsupported export format: ${request.format}`)
      }

      // Convert to file content
      const fileContent = await this.convertToFileContent(exportData, request.format)
      const fileBuffer = Buffer.from(fileContent)

      // Upload to S3 storage
      const filePath = storageUtils.generateUserFilePath(request.userId, fileName)
      
      const uploadResult = await exportsStorage.upload(filePath, fileBuffer, {
        contentType,
        metadata: {
          exportName: request.name,
          format: request.format,
          documentsCount: request.documents.length.toString(),
          createdAt: new Date().toISOString()
        }
      })

      if (!uploadResult.success) {
        throw new Error(`Failed to upload export file: ${uploadResult.error}`)
      }

      // Get signed URL for download
      const fileUrl = await exportsStorage.getSignedUrl(filePath, 86400) // 24 hours

      const processingTime = Date.now() - this.startTime
      console.log(`✅ Export generation completed in ${processingTime}ms`)
      console.log(`📊 Generated file: ${fileName} (${fileBuffer.length} bytes)`)

      return {
        success: true,
        filePath,
        fileUrl: fileUrl || undefined,
        fileName,
        fileSize: fileBuffer.length,
        recordsCount: request.documents.length
      }

    } catch (error) {
      console.error('❌ Export generation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Generate JSON export using AI
   */
  private async generateJSONExport(provider: LanguageModel, request: ExportRequest): Promise<z.infer<typeof JSONExportSchema>> {
    const prompt = this.generateJSONPrompt(request)
    
    const result = await generateObject({
      model: provider,
      schema: JSONExportSchema,
      prompt,
      temperature: 0.1,
    })

    return result.object
  }

  /**
   * Generate CSV export using AI
   */
  private async generateCSVExport(provider: LanguageModel, request: ExportRequest): Promise<z.infer<typeof CSVExportSchema>> {
    const prompt = this.generateCSVPrompt(request)
    
    const result = await generateObject({
      model: provider,
      schema: CSVExportSchema,
      prompt,
      temperature: 0.1,
    })

    return result.object
  }

  /**
   * Generate Excel export using AI
   */
  private async generateExcelExport(provider: LanguageModel, request: ExportRequest): Promise<z.infer<typeof ExcelExportSchema>> {
    const prompt = this.generateExcelPrompt(request)
    
    const result = await generateObject({
      model: provider,
      schema: ExcelExportSchema,
      prompt,
      temperature: 0.1,
    })

    return result.object
  }

  /**
   * Generate AI prompt for JSON export
   */
  private generateJSONPrompt(request: ExportRequest): string {
    const documentsData = JSON.stringify(request.documents, null, 2)
    
    return `
You are an expert data export specialist. Create a structured JSON export from the following document data.

EXPORT REQUEST:
- Name: ${request.name}
- Format: JSON
- Documents: ${request.documents.length}
- Filters: ${JSON.stringify(request.filters || {})}
- Settings: ${JSON.stringify(request.settings || {})}

DOCUMENT DATA:
${documentsData}

REQUIREMENTS:
1. Create a comprehensive JSON structure with documents and summary
2. Include all extracted fields and metadata for each document
3. Calculate summary statistics (total documents, document types distribution, average confidence)
4. Group documents by type if requested in settings
5. Apply confidence threshold filtering if specified
6. Include only specified fields if includeFields is provided
7. Add export metadata (date, total records, etc.)

OUTPUT STRUCTURE:
- documents: Array of processed document objects with extracted data
- summary: Export summary with statistics and metadata

Ensure the JSON is well-structured, complete, and optimized for data analysis and reporting.
`
  }

  /**
   * Generate AI prompt for CSV export
   */
  private generateCSVPrompt(request: ExportRequest): string {
    const documentsData = JSON.stringify(request.documents, null, 2)
    
    return `
You are an expert data export specialist. Create a structured CSV export from the following document data.

EXPORT REQUEST:
- Name: ${request.name}
- Format: CSV
- Documents: ${request.documents.length}
- Filters: ${JSON.stringify(request.filters || {})}
- Include Fields: ${JSON.stringify(request.includeFields || [])}

DOCUMENT DATA:
${documentsData}

REQUIREMENTS:
1. Design optimal CSV headers that capture all important data points
2. Create data rows with consistent formatting
3. Include document metadata (name, type, confidence, processing date)
4. Flatten extracted fields into individual columns
5. Apply filters (document type, confidence threshold, date range)
6. Include only specified fields if includeFields is provided
7. Ensure data is clean and CSV-compatible (escape commas, quotes)
8. Add metadata about the export (total records, export date, columns)

CSV DESIGN GUIDELINES:
- Use clear, descriptive column headers
- Maintain consistent data formatting across rows
- Handle missing values appropriately (empty or "N/A")
- Ensure all data is properly escaped for CSV format
- Group related fields logically in column order

Output the CSV structure with headers and data rows that are ready for spreadsheet import and data analysis.
`
  }

  /**
   * Generate AI prompt for Excel export
   */
  private generateExcelPrompt(request: ExportRequest): string {
    const documentsData = JSON.stringify(request.documents, null, 2)
    
    return `
You are an expert data export specialist. Create a structured Excel workbook export from the following document data.

EXPORT REQUEST:
- Name: ${request.name}
- Format: Excel (XLSX)
- Documents: ${request.documents.length}
- Settings: ${JSON.stringify(request.settings || {})}

DOCUMENT DATA:
${documentsData}

REQUIREMENTS:
1. Design multiple worksheet structure for comprehensive data organization
2. Create worksheets for: Documents, Summary, Field Analysis, Document Types
3. Include proper headers and data formatting for each sheet
4. Apply grouping by document type if requested
5. Include metadata and statistics sheets
6. Ensure data is optimized for Excel analysis (proper data types, formatting)

WORKSHEET DESIGN:
1. "Documents" sheet: Main data with all document information
2. "Summary" sheet: Statistics and overview data
3. "Field Analysis" sheet: Analysis of extracted fields across documents
4. "Document Types" sheet: Breakdown by document categories

EXCEL FEATURES TO LEVERAGE:
- Multiple worksheets for data organization
- Proper column headers and data types
- Statistical summaries and counts
- Data suitable for pivot tables and analysis

Output the Excel structure with multiple sheets, headers, and data rows optimized for business analysis and reporting.
`
  }

  /**
   * Convert export data to file content based on format
   */
  private async convertToFileContent(
    exportData: z.infer<typeof JSONExportSchema> | z.infer<typeof CSVExportSchema> | z.infer<typeof ExcelExportSchema>, 
    format: string
  ): Promise<string> {
    switch (format) {
      case 'json':
        return JSON.stringify(exportData, null, 2)
      
      case 'csv':
        return this.convertToCSV(exportData as z.infer<typeof CSVExportSchema>)
      
      case 'excel':
        return this.convertToExcel(exportData as z.infer<typeof ExcelExportSchema>)
      
      default:
        throw new Error(`Unsupported format for conversion: ${format}`)
    }
  }

  /**
   * Convert data to CSV format
   */
  private convertToCSV(data: z.infer<typeof CSVExportSchema>): string {
    const { headers, rows } = data
    
    // Escape CSV values
    const escapeCSV = (value: string): string => {
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    }

    // Create CSV content
    const csvLines = [
      headers.map(escapeCSV).join(','),
      ...rows.map((row: string[]) => row.map(escapeCSV).join(','))
    ]

    return csvLines.join('\n')
  }

  /**
   * Convert data to Excel format (simplified - returns CSV for now)
   * TODO: Implement proper Excel generation with xlsx library
   */
  private convertToExcel(data: z.infer<typeof ExcelExportSchema>): string {
    // For now, return CSV format
    // TODO: Implement actual Excel file generation using xlsx library
    if (data.sheets && data.sheets.length > 0) {
      const mainSheet = data.sheets[0]
      
      // Convert Excel sheet format to CSV format
      const csvData: z.infer<typeof CSVExportSchema> = {
        headers: mainSheet.headers,
        rows: mainSheet.rows,
        metadata: {
          totalRecords: mainSheet.rows.length,
          exportDate: data.metadata.exportDate,
          columns: mainSheet.headers.length
        }
      }
      
      return this.convertToCSV(csvData)
    }
    
    return JSON.stringify(data, null, 2)
  }
}

// Export singleton instance
export const aiExporter = new AIExporter()