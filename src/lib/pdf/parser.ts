/**
 * PDF Text Extraction Utility
 * 
 * Uses pdf-parse to extract text content from PDF files
 * for more accurate LLM processing
 */

import pdfParse from 'pdf-parse'

export interface PDFParseResult {
  text: string
  numPages: number
  info: {
    title?: string
    author?: string
    subject?: string
    creator?: string
    producer?: string
    creationDate?: Date
    modDate?: Date
  }
  metadata?: any
}

export class PDFParser {
  /**
   * Extract text content from PDF buffer
   */
  async parsePDF(pdfBuffer: Buffer): Promise<PDFParseResult> {
    try {
      console.log('📄 Starting PDF text extraction...')
      
      const data = await pdfParse(pdfBuffer, {
        // Options for pdf-parse
        max: 0, // Parse all pages (0 = no limit)
        version: 'v1.10.100', // Use specific PDF.js version
      })

      console.log(`✅ PDF parsed successfully: ${data.numpages} pages, ${data.text.length} characters`)
      
      return {
        text: data.text,
        numPages: data.numpages,
        info: {
          title: data.info?.Title,
          author: data.info?.Author,
          subject: data.info?.Subject,
          creator: data.info?.Creator,
          producer: data.info?.Producer,
          creationDate: data.info?.CreationDate,
          modDate: data.info?.ModDate,
        },
        metadata: data.metadata
      }
    } catch (error) {
      console.error('❌ PDF parsing failed:', error)
      throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Extract text content from PDF file
   */
  async parsePDFFromFile(file: File): Promise<PDFParseResult> {
    try {
      // Convert File to Buffer
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      
      return await this.parsePDF(buffer)
    } catch (error) {
      console.error('❌ PDF file parsing failed:', error)
      throw new Error(`Failed to parse PDF file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Extract text content from PDF URL
   */
  async parsePDFFromUrl(url: string): Promise<PDFParseResult> {
    try {
      console.log(`📥 Fetching PDF from URL: ${url}`)
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      
      return await this.parsePDF(buffer)
    } catch (error) {
      console.error('❌ PDF URL parsing failed:', error)
      throw new Error(`Failed to parse PDF from URL: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Clean and format extracted text for better LLM processing
   */
  cleanExtractedText(text: string): string {
    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove page breaks and form feeds
      .replace(/[\f\r]/g, '')
      // Clean up line breaks
      .replace(/\n\s*\n/g, '\n\n')
      // Trim whitespace
      .trim()
  }

  /**
   * Split long text into chunks for processing
   */
  chunkText(text: string, maxChunkSize: number = 4000): string[] {
    const chunks: string[] = []
    const sentences = text.split(/[.!?]\s+/)
    
    let currentChunk = ''
    
    for (const sentence of sentences) {
      const potentialChunk = currentChunk + (currentChunk ? '. ' : '') + sentence
      
      if (potentialChunk.length <= maxChunkSize) {
        currentChunk = potentialChunk
      } else {
        if (currentChunk) {
          chunks.push(currentChunk + '.')
        }
        currentChunk = sentence
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk + '.')
    }
    
    return chunks
  }
}

// Export singleton instance
export const pdfParser = new PDFParser()