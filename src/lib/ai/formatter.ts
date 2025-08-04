/**
 * Data Formatting Utilities
 * 
 * Convert extracted document data to various formats (CSV, JSON, etc.)
 */

import { DocumentParsingResult, ExtractedField } from './parser'

export type ExportFormat = 'json' | 'csv' | 'xlsx' | 'structured'

export interface FormattedData {
  format: ExportFormat
  data: string | object
  filename: string
  mimeType: string
}

export class DataFormatter {
  
  // Convert parsing result to JSON
  toJSON(result: DocumentParsingResult, pretty: boolean = true): FormattedData {
    const data = pretty 
      ? JSON.stringify(result, null, 2)
      : JSON.stringify(result)
    
    return {
      format: 'json',
      data,
      filename: `extracted_data_${Date.now()}.json`,
      mimeType: 'application/json'
    }
  }
  
  // Convert parsing result to CSV
  toCSV(result: DocumentParsingResult): FormattedData {
    const fields = result.extracted_fields
    
    if (fields.length === 0) {
      return {
        format: 'csv',
        data: 'No data extracted',
        filename: `extracted_data_${Date.now()}.csv`,
        mimeType: 'text/csv'
      }
    }
    
    // Create CSV headers
    const headers = ['Field Name', 'Value', 'Type', 'Confidence', 'Page']
    
    // Create CSV rows
    const rows = fields.map(field => [
      `"${this.escapeCsvValue(field.name)}"`,
      `"${this.escapeCsvValue(field.value)}"`,
      `"${field.type}"`,
      field.confidence.toString(),
      (field.position?.page || 1).toString()
    ])
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')
    
    return {
      format: 'csv',
      data: csvContent,
      filename: `extracted_data_${Date.now()}.csv`,
      mimeType: 'text/csv'
    }
  }
  
  // Convert to structured format optimized for business use
  toStructured(result: DocumentParsingResult): FormattedData {
    const structured = {
      document_info: {
        type: result.document_type,
        summary: result.summary,
        confidence: result.confidence,
        processing_metadata: result.metadata
      },
      key_data: this.extractKeyData(result.extracted_fields),
      all_fields: this.groupFieldsByType(result.extracted_fields),
      structured_data: result.structured_data
    }
    
    return {
      format: 'structured',
      data: JSON.stringify(structured, null, 2),
      filename: `structured_data_${Date.now()}.json`,
      mimeType: 'application/json'
    }
  }
  
  // Convert to table format for tabular data
  toTable(result: DocumentParsingResult): FormattedData {
    const tableData = this.extractTableData(result)
    
    if (tableData.length === 0) {
      return this.toCSV(result) // Fallback to regular CSV
    }
    
    // Create CSV from table data
    const headers = Object.keys(tableData[0])
    const rows = tableData.map(row => 
      headers.map(header => `"${this.escapeCsvValue(String(row[header] || ''))}"`)
    )
    
    const csvContent = [
      headers.map(h => `"${h}"`).join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')
    
    return {
      format: 'csv',
      data: csvContent,
      filename: `table_data_${Date.now()}.csv`,
      mimeType: 'text/csv'
    }
  }
  
  // Auto-detect best format based on content
  autoFormat(result: DocumentParsingResult): FormattedData {
    const tableData = this.extractTableData(result)
    
    // If we have tabular data, use table format
    if (tableData.length > 1) {
      return this.toTable(result)
    }
    
    // If we have many fields, use CSV
    if (result.extracted_fields.length > 10) {
      return this.toCSV(result)
    }
    
    // Otherwise use structured JSON
    return this.toStructured(result)
  }
  
  // Helper methods
  private escapeCsvValue(value: string): string {
    // Escape quotes and handle multiline values
    return value.replace(/"/g, '""')
  }
  
  private extractKeyData(fields: ExtractedField[]): Record<string, any> {
    const keyData: Record<string, any> = {}
    
    // Priority fields that are commonly important
    const priorityFields = [
      'total', 'amount', 'total amount', 'grand total',
      'date', 'invoice date', 'due date',
      'invoice number', 'reference number', 'id',
      'vendor', 'company', 'merchant', 'from',
      'customer', 'to', 'bill to'
    ]
    
    // Extract high-confidence priority fields
    fields
      .filter(field => field.confidence >= 80)
      .forEach(field => {
        const fieldNameLower = field.name.toLowerCase()
        const isPriority = priorityFields.some(priority => 
          fieldNameLower.includes(priority)
        )
        
        if (isPriority || field.confidence >= 95) {
          keyData[field.name] = this.formatFieldValue(field)
        }
      })
    
    return keyData
  }
  
  private groupFieldsByType(fields: ExtractedField[]): Record<string, ExtractedField[]> {
    const grouped: Record<string, ExtractedField[]> = {}
    
    fields.forEach(field => {
      if (!grouped[field.type]) {
        grouped[field.type] = []
      }
      grouped[field.type].push(field)
    })
    
    return grouped
  }
  
  private extractTableData(result: DocumentParsingResult): Record<string, any>[] {
    // Look for tabular data in structured_data
    const structuredData = result.structured_data
    
    // Check for arrays that might represent table rows
    for (const [key, value] of Object.entries(structuredData)) {
      if (Array.isArray(value) && value.length > 0) {
        // Check if array contains objects (table rows)
        if (typeof value[0] === 'object' && value[0] !== null) {
          return value as Record<string, any>[]
        }
      }
    }
    
    // Look for line items or similar patterns
    const lineItemFields = result.extracted_fields.filter(field => 
      field.name.toLowerCase().includes('line') ||
      field.name.toLowerCase().includes('item') ||
      field.name.toLowerCase().includes('product')
    )
    
    if (lineItemFields.length > 0) {
      // Try to structure as table
      return lineItemFields.map((field, index) => ({
        'Item': field.value,
        'Type': field.type,
        'Confidence': field.confidence,
        'Row': index + 1
      }))
    }
    
    return []
  }
  
  private formatFieldValue(field: ExtractedField): any {
    switch (field.type) {
      case 'number':
        const num = parseFloat(field.value)
        return isNaN(num) ? field.value : num
        
      case 'currency':
        // Try to extract numeric value
        const currencyMatch = field.value.match(/[\d,.]+/)
        if (currencyMatch) {
          const numValue = parseFloat(currencyMatch[0].replace(/,/g, ''))
          return isNaN(numValue) ? field.value : numValue
        }
        return field.value
        
      case 'date':
        // Return as-is, could add date parsing if needed
        return field.value
        
      default:
        return field.value
    }
  }
}

// Export singleton instance
export const dataFormatter = new DataFormatter()

// Utility function to detect if data looks like a table/spreadsheet
export function detectTableStructure(result: DocumentParsingResult): {
  isTabular: boolean
  rowCount: number
  columnCount: number
  confidence: number
} {
  const fields = result.extracted_fields
  
  // Look for patterns that suggest tabular data
  const tableIndicators = [
    'line item', 'row', 'column', 'table', 'list', 'item',
    'product', 'description', 'quantity', 'price', 'amount'
  ]
  
  const tabularFields = fields.filter(field => 
    tableIndicators.some(indicator => 
      field.name.toLowerCase().includes(indicator)
    )
  )
  
  const isTabular = tabularFields.length >= 3
  const rowCount = Math.ceil(tabularFields.length / 3) // Estimate rows
  const columnCount = isTabular ? 3 : 1 // Estimate columns
  const confidence = (tabularFields.length / fields.length) * 100
  
  return {
    isTabular,
    rowCount,
    columnCount,
    confidence: Math.min(confidence, 100)
  }
}