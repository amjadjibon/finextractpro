-- =============================================
-- FinExtractPro Complete Database Migration
-- =============================================
-- This file contains all database migrations in a single comprehensive script
-- It creates the complete database schema for the FinExtractPro application
-- 
-- Tables created:
-- 1. documents - Document storage and metadata
-- 2. templates - Document processing templates
-- 3. user_settings - User preferences and settings
-- 4. exports - Export job management and tracking
--
-- Features:
-- - Row Level Security (RLS) for data isolation
-- - Comprehensive indexing for performance
-- - Storage bucket configuration
-- - Triggers for automatic timestamp updates
-- - Views for easier data access
-- =============================================

-- =============================================
-- PART 1: Documents Table and Storage
-- =============================================

-- Create documents table for storing uploaded document metadata
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  document_type VARCHAR(50) DEFAULT 'unknown',
  template VARCHAR(50) DEFAULT 'auto',
  description TEXT,
  status VARCHAR(20) DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'completed', 'error')),
  user_id VARCHAR(255) NOT NULL,
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  processed_date TIMESTAMPTZ,
  confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
  pages INTEGER,
  fields_extracted INTEGER DEFAULT 0,
  processing_history JSONB DEFAULT '[]'::jsonb,
  
  -- AI Processing Fields (added in migration 002)
  extracted_fields JSONB DEFAULT '[]'::jsonb,
  structured_data JSONB DEFAULT '{}'::jsonb,
  ai_provider VARCHAR(50) DEFAULT NULL,
  ai_model VARCHAR(100) DEFAULT NULL,
  processing_time_ms INTEGER DEFAULT NULL,
  
  -- Template relationship
  template_id UUID DEFAULT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for documents table
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_upload_date ON documents(upload_date);
CREATE INDEX IF NOT EXISTS idx_documents_name ON documents(name);
CREATE INDEX IF NOT EXISTS idx_documents_confidence ON documents(confidence);
CREATE INDEX IF NOT EXISTS idx_documents_ai_provider ON documents(ai_provider);

-- GIN indexes for JSONB fields
CREATE INDEX IF NOT EXISTS idx_documents_extracted_fields ON documents USING GIN (extracted_fields);
CREATE INDEX IF NOT EXISTS idx_documents_structured_data ON documents USING GIN (structured_data);

-- Create updated_at trigger function (shared across tables)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create updated_at trigger for documents
CREATE OR REPLACE TRIGGER update_documents_updated_at 
    BEFORE UPDATE ON documents 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create storage buckets (if not exists)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('exports', 'exports', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS for documents table
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for documents
CREATE POLICY "Users can view own documents" ON documents
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own documents" ON documents
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own documents" ON documents
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own documents" ON documents
  FOR DELETE USING (auth.uid()::text = user_id);

-- Storage policies for documents bucket
-- Path structure: {userId}/{fileName}
-- User ID is at index [1] (first folder in the path)
CREATE POLICY "Users can upload own documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for exports bucket
-- Path structure: {userId}/{fileName}  
-- User ID is at index [1] (first folder in the path)
CREATE POLICY "Users can upload own exports" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'exports' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own exports" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'exports' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own exports" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'exports' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Add comments for documents table
COMMENT ON TABLE documents IS 'Document storage and metadata with AI processing results';
COMMENT ON COLUMN documents.extracted_fields IS 'AI-extracted fields as JSONB array';
COMMENT ON COLUMN documents.structured_data IS 'Key-value pairs of important extracted data';
COMMENT ON COLUMN documents.ai_provider IS 'AI provider used for processing (openai, google, groq)';
COMMENT ON COLUMN documents.ai_model IS 'AI model used for processing';
COMMENT ON COLUMN documents.processing_time_ms IS 'Processing time in milliseconds';

-- =============================================
-- PART 2: Templates Table
-- =============================================

-- Create templates table for storing document processing templates
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  document_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  accuracy DECIMAL(5,2),
  documents_processed INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  user_id VARCHAR(255) NOT NULL,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  last_used TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for templates table
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_type ON templates(document_type);
CREATE INDEX IF NOT EXISTS idx_templates_status ON templates(status);
CREATE INDEX IF NOT EXISTS idx_templates_public ON templates(is_public);
CREATE INDEX IF NOT EXISTS idx_templates_created_date ON templates(created_date);
CREATE INDEX IF NOT EXISTS idx_templates_name ON templates(name);
CREATE INDEX IF NOT EXISTS idx_templates_tags ON templates USING GIN(tags);

-- Create updated_at trigger for templates
CREATE OR REPLACE TRIGGER update_templates_updated_at 
    BEFORE UPDATE ON templates 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for templates table
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for templates
CREATE POLICY "Users can view own and public templates" ON templates
  FOR SELECT USING (auth.uid()::text = user_id OR is_public = true);

CREATE POLICY "Users can insert own templates" ON templates
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own templates" ON templates
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own templates" ON templates
  FOR DELETE USING (auth.uid()::text = user_id);

-- Add foreign key reference from documents to templates
ALTER TABLE documents ADD CONSTRAINT fk_documents_template_id 
  FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE SET NULL;

-- =============================================
-- PART 3: User Settings Table
-- =============================================

-- Create user settings table for preferences and configurations
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  key VARCHAR(100) NOT NULL,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  type VARCHAR(50) NOT NULL DEFAULT 'string', -- string, number, boolean, object, array
  display_name VARCHAR(200),
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  is_readonly BOOLEAN DEFAULT false,
  validation_rules JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category, key)
);

-- Create indexes for user_settings table
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_category ON user_settings(category);
CREATE INDEX IF NOT EXISTS idx_user_settings_key ON user_settings(key);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_category ON user_settings(user_id, category);
CREATE INDEX IF NOT EXISTS idx_user_settings_public ON user_settings(is_public) WHERE is_public = true;

-- Create GIN index for JSONB value searches
CREATE INDEX IF NOT EXISTS idx_user_settings_value ON user_settings USING GIN (value);

-- Create function to update updated_at timestamp for user_settings
CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at on user_settings
CREATE TRIGGER user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_settings_updated_at();

-- Enable RLS for user_settings table
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_settings
CREATE POLICY "Users can view their own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id AND NOT is_readonly);

CREATE POLICY "Users can delete their own settings" ON user_settings
  FOR DELETE USING (auth.uid() = user_id AND NOT is_readonly);

-- Create policy for public settings (read-only)
CREATE POLICY "Anyone can view public settings" ON user_settings
  FOR SELECT USING (is_public = true);

-- Add comments for user_settings table
COMMENT ON TABLE user_settings IS 'User-specific settings and preferences';
COMMENT ON COLUMN user_settings.category IS 'Setting category (e.g., profile, notifications, ai, processing)';
COMMENT ON COLUMN user_settings.key IS 'Setting key within category (e.g., theme, language, provider)';
COMMENT ON COLUMN user_settings.value IS 'Setting value stored as JSONB for flexibility';
COMMENT ON COLUMN user_settings.type IS 'Data type hint for frontend (string, number, boolean, object, array)';
COMMENT ON COLUMN user_settings.display_name IS 'Human-readable name for UI';
COMMENT ON COLUMN user_settings.description IS 'Setting description for UI help text';
COMMENT ON COLUMN user_settings.is_public IS 'Whether setting is visible to other users';
COMMENT ON COLUMN user_settings.is_readonly IS 'Whether setting can be modified by user';
COMMENT ON COLUMN user_settings.validation_rules IS 'JSON schema or validation rules for value';

-- =============================================
-- PART 4: Views for Easier Data Access
-- =============================================

-- Create a view for easier querying of settings by category
CREATE OR REPLACE VIEW user_settings_grouped AS
SELECT 
  user_id,
  category,
  jsonb_object_agg(key, jsonb_build_object(
    'value', value,
    'type', type,
    'display_name', display_name,
    'description', description,
    'is_readonly', is_readonly,
    'updated_at', updated_at
  )) as settings
FROM user_settings
GROUP BY user_id, category;

COMMENT ON VIEW user_settings_grouped IS 'Grouped view of user settings by category for easier frontend consumption';

-- =============================================
-- PART 4: Exports Table
-- =============================================

-- Create exports table for tracking document exports
CREATE TABLE IF NOT EXISTS exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'expired')),
  type VARCHAR(50) NOT NULL DEFAULT 'document_export', -- document_export, template_export, bulk_export
  format VARCHAR(10) NOT NULL DEFAULT 'json' CHECK (format IN ('json', 'csv', 'excel', 'pdf', 'zip')),
  
  -- Export configuration
  filters JSONB DEFAULT '{}'::jsonb, -- Search filters and criteria
  include_fields JSONB DEFAULT '[]'::jsonb, -- Fields to include in export
  settings JSONB DEFAULT '{}'::jsonb, -- Additional export settings
  
  -- Results and metadata  
  file_path TEXT, -- Path to generated export file
  file_size INTEGER DEFAULT 0, -- File size in bytes
  records_count INTEGER DEFAULT 0, -- Number of records exported
  download_count INTEGER DEFAULT 0, -- Number of times downloaded
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'), -- Auto-expire after 30 days
  
  -- Error handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0 CHECK (retry_count >= 0 AND retry_count <= 3)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_exports_user_id ON exports(user_id);
CREATE INDEX IF NOT EXISTS idx_exports_status ON exports(status);
CREATE INDEX IF NOT EXISTS idx_exports_type ON exports(type);
CREATE INDEX IF NOT EXISTS idx_exports_format ON exports(format);
CREATE INDEX IF NOT EXISTS idx_exports_created_at ON exports(created_at);
CREATE INDEX IF NOT EXISTS idx_exports_expires_at ON exports(expires_at);

-- Create GIN index for JSONB fields
CREATE INDEX IF NOT EXISTS idx_exports_filters ON exports USING GIN (filters);
CREATE INDEX IF NOT EXISTS idx_exports_include_fields ON exports USING GIN (include_fields);

-- Create function to update updated_at timestamp for exports
CREATE OR REPLACE FUNCTION update_exports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at on exports
CREATE TRIGGER exports_updated_at
  BEFORE UPDATE ON exports
  FOR EACH ROW
  EXECUTE FUNCTION update_exports_updated_at();

-- Enable Row Level Security
ALTER TABLE exports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for exports
-- Users can only access their own exports
CREATE POLICY "Users can view their own exports" ON exports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exports" ON exports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exports" ON exports
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exports" ON exports
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to cleanup expired exports
CREATE OR REPLACE FUNCTION cleanup_expired_exports()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete expired exports and their files
  DELETE FROM exports 
  WHERE expires_at < NOW() 
    AND status IN ('completed', 'failed');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE exports IS 'Export jobs and their metadata for document/template exports';
COMMENT ON COLUMN exports.type IS 'Type of export: document_export, template_export, bulk_export';
COMMENT ON COLUMN exports.format IS 'Export format: json, csv, excel, pdf, zip';
COMMENT ON COLUMN exports.filters IS 'JSON object containing export filters and search criteria';
COMMENT ON COLUMN exports.include_fields IS 'JSON array of field names to include in export';
COMMENT ON COLUMN exports.settings IS 'Additional export configuration and options';
COMMENT ON COLUMN exports.file_path IS 'Storage path to the generated export file';
COMMENT ON COLUMN exports.expires_at IS 'When this export expires and will be auto-deleted';

-- =============================================
-- PART 5: Data Migration for Existing Records
-- =============================================

-- Update existing documents to have empty arrays/objects for new AI fields
UPDATE documents 
SET 
  extracted_fields = '[]'::jsonb,
  structured_data = '{}'::jsonb
WHERE 
  extracted_fields IS NULL 
  OR structured_data IS NULL;

-- =============================================
-- Migration Complete
-- =============================================

-- This completes the full database schema for FinExtractPro
-- The schema includes:
-- 1. Documents table with AI processing capabilities
-- 2. Templates table for document processing templates
-- 3. User settings table for preferences and configuration
-- 4. Exports table for managing export jobs
-- 5. All necessary indexes for optimal performance
-- 6. Row Level Security (RLS) for data isolation
-- 7. Storage bucket configuration for file uploads
-- 8. Automatic timestamp management via triggers
-- 9. Views for easier data access and manipulation
