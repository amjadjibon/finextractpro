-- =============================================
-- FinExtractPro Migration Rollback Script
-- =============================================
-- This file rolls back all database changes made by complete_migration.sql
-- Use this to completely remove the FinExtractPro database schema
-- 
-- WARNING: This will permanently delete all data!
-- Make sure to backup your data before running this script.
-- 
-- Usage:
--   Execute this script when you need to completely reset the database
--   or rollback to a clean state before the FinExtractPro schema
-- =============================================

-- =============================================
-- PART 1: Drop Views
-- =============================================

-- Drop views first (they depend on tables)
DROP VIEW IF EXISTS user_settings_grouped;

-- =============================================
-- PART 2: Drop Functions and Triggers
-- =============================================

-- Drop triggers first (they depend on functions)
DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
DROP TRIGGER IF EXISTS update_templates_updated_at ON templates;
DROP TRIGGER IF EXISTS user_settings_updated_at ON user_settings;
DROP TRIGGER IF EXISTS exports_updated_at ON exports;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS update_user_settings_updated_at();
DROP FUNCTION IF EXISTS update_exports_updated_at();
DROP FUNCTION IF EXISTS cleanup_expired_exports();

-- =============================================
-- PART 3: Drop Tables (in reverse dependency order)
-- =============================================

-- Drop exports table (no dependencies)
DROP TABLE IF EXISTS exports CASCADE;

-- Drop documents table (has foreign key to templates)
DROP TABLE IF EXISTS documents CASCADE;

-- Drop templates table (referenced by documents)
DROP TABLE IF EXISTS templates CASCADE;

-- Drop user_settings table (no dependencies)
DROP TABLE IF EXISTS user_settings CASCADE;

-- =============================================
-- PART 4: Drop Storage Policies and Buckets
-- =============================================

-- Drop storage policies for documents bucket
DROP POLICY IF EXISTS "Users can upload own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own documents" ON storage.objects;

-- Drop storage bucket (this will also delete all files!)
-- WARNING: This permanently deletes all uploaded documents
DELETE FROM storage.buckets WHERE id = 'documents';

-- Drop storage policies for exports bucket
DROP POLICY IF EXISTS "Users can upload own exports" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own exports" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own exports" ON storage.objects;

-- Drop storage bucket (this will also delete all files!)
-- WARNING: This permanently deletes all uploaded exports
DELETE FROM storage.buckets WHERE id = 'exports';


-- =============================================
-- PART 5: Clean up any remaining objects
-- =============================================

-- Drop any indexes that might still exist
DROP INDEX IF EXISTS idx_documents_user_id;
DROP INDEX IF EXISTS idx_documents_status;
DROP INDEX IF EXISTS idx_documents_type;
DROP INDEX IF EXISTS idx_documents_upload_date;
DROP INDEX IF EXISTS idx_documents_name;
DROP INDEX IF EXISTS idx_documents_confidence;
DROP INDEX IF EXISTS idx_documents_ai_provider;
DROP INDEX IF EXISTS idx_documents_extracted_fields;
DROP INDEX IF EXISTS idx_documents_structured_data;

DROP INDEX IF EXISTS idx_templates_user_id;
DROP INDEX IF EXISTS idx_templates_type;
DROP INDEX IF EXISTS idx_templates_status;
DROP INDEX IF EXISTS idx_templates_public;
DROP INDEX IF EXISTS idx_templates_created_date;
DROP INDEX IF EXISTS idx_templates_name;
DROP INDEX IF EXISTS idx_templates_tags;

DROP INDEX IF EXISTS idx_user_settings_user_id;
DROP INDEX IF EXISTS idx_user_settings_category;
DROP INDEX IF EXISTS idx_user_settings_key;
DROP INDEX IF EXISTS idx_user_settings_user_category;
DROP INDEX IF EXISTS idx_user_settings_public;
DROP INDEX IF EXISTS idx_user_settings_value;

DROP INDEX IF EXISTS idx_exports_user_id;
DROP INDEX IF EXISTS idx_exports_status;
DROP INDEX IF EXISTS idx_exports_type;
DROP INDEX IF EXISTS idx_exports_format;
DROP INDEX IF EXISTS idx_exports_created_at;
DROP INDEX IF EXISTS idx_exports_expires_at;
DROP INDEX IF EXISTS idx_exports_filters;
DROP INDEX IF EXISTS idx_exports_include_fields;

-- =============================================
-- PART 6: Verification
-- =============================================

-- List remaining tables (should not include our tables)
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('documents', 'templates', 'user_settings', 'exports');

-- List remaining functions
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN (
    'update_updated_at_column', 
    'update_user_settings_updated_at',
    'update_exports_updated_at',
    'cleanup_expired_exports'
  );

-- List remaining storage buckets
SELECT id, name FROM storage.buckets WHERE id = 'documents';
SELECT id, name FROM storage.buckets WHERE id = 'exports';

-- =============================================
-- Rollback Complete
-- =============================================

-- If the queries above return no rows, the rollback was successful
-- All FinExtractPro database objects have been removed
-- 
-- Note: This rollback does NOT affect:
-- - Supabase auth users and sessions
-- - Other application tables not created by FinExtractPro
-- - Environment variables or application code
-- 
-- To completely reset for a fresh installation:
-- 1. Run this rollback script
-- 2. Run complete_migration.sql to reinstall the schema
-- 3. Optionally run the seed script to add test data