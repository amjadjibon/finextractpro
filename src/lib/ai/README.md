# AI Document Processing

This directory contains the AI-powered document processing system for FinExtractPro.

## Overview

The AI system provides intelligent document parsing and data extraction using multiple AI providers. It supports template-based extraction for structured documents and automatic extraction for unknown document types.

## Files

- `config.ts` - AI provider configuration and validation
- `parser.ts` - Core document parsing logic with AI integration
- `formatter.ts` - Data formatting utilities (JSON, CSV, structured)

## Features

### 🤖 Multi-Provider Support
- **OpenAI**: GPT models with vision support
- **Google Gemini**: Fast processing with vision capabilities  
- **Groq**: Cost-effective text processing

### 📄 Document Processing
- **Template-Based**: Use predefined templates for structured extraction
- **Auto-Detection**: Intelligent document type detection
- **Multi-Format**: PDF, images (JPG, PNG, TIFF), text files
- **Vision Support**: OCR and image document processing (OpenAI/Google only)

### 📊 Data Export
- **JSON**: Complete extraction results
- **CSV**: Tabular field data
- **Structured**: Business-optimized format
- **Auto-Format**: Intelligent format selection

### 🎯 Accuracy Features
- **Confidence Scoring**: AI confidence for each field (0-100)
- **Field Types**: Text, number, date, currency, address, email, phone
- **Position Tracking**: Page and coordinate information
- **Processing History**: Detailed audit trail

## Usage

### Basic Configuration

```typescript
import { documentParser } from '@/lib/ai/parser'
import { dataFormatter } from '@/lib/ai/formatter'

// Parse a document
const result = await documentParser.parseDocumentWithFile(file)

// Format as CSV
const csvExport = dataFormatter.toCSV(result)
```

### Template-Based Parsing

```typescript
const template = {
  id: 'invoice-template',
  name: 'Standard Invoice',
  document_type: 'invoice',
  fields: [
    { name: 'Invoice Number', type: 'text', required: true },
    { name: 'Total Amount', type: 'currency', required: true },
    { name: 'Due Date', type: 'date', required: false }
  ],
  settings: {
    confidence_threshold: 85,
    auto_approve: false
  }
}

const result = await documentParser.parseDocumentWithFile(file, template)
```

### Environment Setup

```bash
# Choose your provider
AI_PROVIDER=openai  # or 'google' or 'groq'

# Set API key for chosen provider
OPENAI_API_KEY=your_key
GOOGLE_API_KEY=your_key  
GROQ_API_KEY=your_key

# Optional: specify model
AI_MODEL=gpt-4o-mini
```

## Provider Comparison

| Provider | Vision | Speed | Cost | Best For |
|----------|--------|-------|------|----------|
| OpenAI | ✅ | Medium | Medium | High accuracy, complex docs |
| Google | ✅ | Fast | Medium | Balanced performance |
| Groq | ❌ | Very Fast | Low | Text documents, bulk processing |

### Recommended Models

**OpenAI**
- `gpt-4o-mini` - Best balance of cost/performance ⭐
- `gpt-4o` - Highest accuracy for complex documents
- `gpt-4-turbo` - Good for detailed analysis

**Google Gemini**
- `gemini-1.5-flash` - Fast general-purpose processing ⭐
- `gemini-1.5-pro` - Higher accuracy for complex tasks
- `gemini-1.0-pro` - Cost-effective option

**Groq**
- `llama-3.3-70b-versatile` - Best accuracy on Groq ⭐
- `llama-3.1-8b-instant` - Fastest processing
- `mixtral-8x7b-32768` - Large context window

## Document Types

The system automatically detects and processes:

- **Invoices**: Extract vendor, amounts, dates, line items
- **Receipts**: Merchant info, totals, payment methods
- **Bank Statements**: Account info, transactions, balances
- **Tax Forms**: W-2, 1099, tax document data
- **Contracts**: Terms, parties, dates, obligations
- **Expense Reports**: Categories, amounts, descriptions
- **Other**: General document data extraction

## Output Format

```typescript
interface DocumentParsingResult {
  summary: string                    // Brief content summary
  document_type: string             // Detected document type
  confidence: number                // Overall confidence (0-100)
  extracted_fields: ExtractedField[] // All extracted fields
  structured_data: Record<string, any> // Key-value data
  metadata: {
    pages: number
    processing_time: number
    provider: string
    model: string
  }
}

interface ExtractedField {
  name: string          // Field name/label
  value: string         // Extracted value
  confidence: number    // Confidence score (0-100)
  type: string         // Data type (text, number, date, etc.)
  position?: {         // Optional position info
    page: number
    coordinates: { x, y, width, height }
  }
}
```

## API Endpoints

### Document Upload with AI Processing
```
POST /api/documents/upload
Content-Type: multipart/form-data

file: File
templateId?: string (optional)
documentType?: string (optional)
```

### Export Processed Data
```
GET /api/documents/[id]/export?format=json|csv|structured&download=true
```

### Test AI Configuration
```
GET /api/ai/test - Check AI setup
POST /api/ai/test - Test AI parsing with file
```

## Error Handling

The system gracefully handles:
- Missing API keys (continues without AI processing)
- Provider failures (returns partial results)
- Unsupported file types (clear error messages)
- Vision limitations (Groq text-only fallback)

## Performance Tips

1. **Choose the right provider**:
   - Groq for bulk text processing
   - OpenAI for highest accuracy
   - Google for balanced performance

2. **Use templates** for consistent extraction
3. **Monitor confidence scores** for quality control
4. **Cache results** to avoid re-processing

## Cost Optimization

- **Groq**: ~10x cheaper than OpenAI/Google
- **Template-based**: Reduces token usage
- **Confidence thresholds**: Filter low-quality results
- **Batch processing**: Process multiple documents efficiently

## Security

- API keys stored securely in environment variables
- User authentication required for all operations
- Document data encrypted in transit and at rest
- No AI provider data retention (configure as needed)