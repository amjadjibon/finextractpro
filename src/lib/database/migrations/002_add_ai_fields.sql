-- Migration: Add AI processing fields to documents table
-- This migration adds fields for storing AI extraction results

-- Add extracted_fields column to store AI parsing results
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS extracted_fields JSONB DEFAULT '[]'::jsonb;

-- Add structured_data column for key-value parsed data
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS structured_data JSONB DEFAULT '{}'::jsonb;

-- Add AI provider metadata
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS ai_provider VARCHAR(50) DEFAULT NULL;

ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS ai_model VARCHAR(100) DEFAULT NULL;

-- Add processing metrics
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS processing_time_ms INTEGER DEFAULT NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_documents_extracted_fields 
ON documents USING GIN (extracted_fields);

CREATE INDEX IF NOT EXISTS idx_documents_structured_data 
ON documents USING GIN (structured_data);

CREATE INDEX IF NOT EXISTS idx_documents_ai_provider 
ON documents (ai_provider);

CREATE INDEX IF NOT EXISTS idx_documents_confidence 
ON documents (confidence);

-- Add comments for documentation
COMMENT ON COLUMN documents.extracted_fields IS 'AI-extracted fields as JSONB array';
COMMENT ON COLUMN documents.structured_data IS 'Key-value pairs of important extracted data';
COMMENT ON COLUMN documents.ai_provider IS 'AI provider used for processing (openai, google, groq)';
COMMENT ON COLUMN documents.ai_model IS 'AI model used for processing';
COMMENT ON COLUMN documents.processing_time_ms IS 'Processing time in milliseconds';

-- Update existing documents to have empty arrays/objects
UPDATE documents 
SET 
  extracted_fields = '[]'::jsonb,
  structured_data = '{}'::jsonb
WHERE 
  extracted_fields IS NULL 
  OR structured_data IS NULL;