-- Database seed script for FinExtractPro
-- This script creates test data for development and testing

-- Insert test templates
INSERT INTO templates (
  id,
  name,
  description,
  document_type,
  fields,
  settings,
  is_public,
  is_favorite,
  tags,
  user_id,
  created_at,
  updated_at
) VALUES 
  (
    gen_random_uuid(),
    'Standard Invoice Template',
    'Extract common invoice fields like amount, date, vendor details',
    'invoice',
    '[
      {"name": "Invoice Number", "type": "text", "required": true},
      {"name": "Invoice Date", "type": "date", "required": true},
      {"name": "Due Date", "type": "date", "required": false},
      {"name": "Vendor Name", "type": "text", "required": true},
      {"name": "Vendor Address", "type": "address", "required": false},
      {"name": "Subtotal", "type": "currency", "required": true},
      {"name": "Tax Amount", "type": "currency", "required": false},
      {"name": "Total Amount", "type": "currency", "required": true},
      {"name": "Payment Terms", "type": "text", "required": false},
      {"name": "Description", "type": "text", "required": false}
    ]'::jsonb,
    '{"confidence_threshold": 85, "auto_approve": false}'::jsonb,
    true,
    false,
    ARRAY['invoice', 'accounting', 'standard'],
    (SELECT id FROM auth.users LIMIT 1),
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '5 days'
  ),
  (
    gen_random_uuid(),
    'Bank Statement Parser',
    'Parse bank statements and extract transaction details',
    'bank-statement',
    '[
      {"name": "Statement Date", "type": "date", "required": true},
      {"name": "Account Number", "type": "text", "required": true},
      {"name": "Beginning Balance", "type": "currency", "required": true},
      {"name": "Ending Balance", "type": "currency", "required": true},
      {"name": "Bank Name", "type": "text", "required": false},
      {"name": "Account Holder", "type": "text", "required": false}
    ]'::jsonb,
    '{"confidence_threshold": 90, "auto_approve": true}'::jsonb,
    true,
    false,
    ARRAY['bank', 'transactions', 'finance'],
    (SELECT id FROM auth.users LIMIT 1),
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '6 days'
  ),
  (
    gen_random_uuid(),
    'Receipt Scanner Pro',
    'Advanced receipt scanning with line item detection',
    'receipt',
    '[
      {"name": "Merchant Name", "type": "text", "required": true},
      {"name": "Receipt Date", "type": "date", "required": true},
      {"name": "Receipt Time", "type": "time", "required": false},
      {"name": "Total Amount", "type": "currency", "required": true},
      {"name": "Tax Amount", "type": "currency", "required": false},
      {"name": "Payment Method", "type": "text", "required": false},
      {"name": "Items", "type": "array", "required": false}
    ]'::jsonb,
    '{"confidence_threshold": 80, "auto_approve": false}'::jsonb,
    true,
    true,
    ARRAY['receipt', 'expenses', 'retail'],
    (SELECT id FROM auth.users LIMIT 1),
    NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '3 days'
  ),
  (
    gen_random_uuid(),
    'Tax Form W-2 Extractor',
    'Extract tax information from W-2 forms',
    'tax-form',
    '[
      {"name": "Employee Name", "type": "text", "required": true},
      {"name": "SSN", "type": "text", "required": true},
      {"name": "Employer Name", "type": "text", "required": true},
      {"name": "Employer EIN", "type": "text", "required": true},
      {"name": "Wages", "type": "currency", "required": true},
      {"name": "Federal Tax Withheld", "type": "currency", "required": true},
      {"name": "Social Security Wages", "type": "currency", "required": false},
      {"name": "Medicare Wages", "type": "currency", "required": false},
      {"name": "Tax Year", "type": "number", "required": true}
    ]'::jsonb,
    '{"confidence_threshold": 95, "auto_approve": false}'::jsonb,
    false,
    false,
    ARRAY['tax', 'w2', 'hr'],
    (SELECT id FROM auth.users LIMIT 1),
    NOW() - INTERVAL '12 days',
    NOW() - INTERVAL '12 days'
  ),
  (
    gen_random_uuid(),
    'Contract Terms Extractor',
    'Extract key terms and dates from contracts',
    'contract',
    '[
      {"name": "Contract Title", "type": "text", "required": true},
      {"name": "Start Date", "type": "date", "required": true},
      {"name": "End Date", "type": "date", "required": false},
      {"name": "Contract Value", "type": "currency", "required": false},
      {"name": "Party A", "type": "text", "required": true},
      {"name": "Party B", "type": "text", "required": true},
      {"name": "Payment Terms", "type": "text", "required": false},
      {"name": "Termination Clause", "type": "text", "required": false}
    ]'::jsonb,
    '{"confidence_threshold": 88, "auto_approve": false}'::jsonb,
    false,
    false,
    ARRAY['contract', 'legal', 'terms'],
    (SELECT id FROM auth.users LIMIT 1),
    NOW() - INTERVAL '8 days',
    NOW() - INTERVAL '1 day'
  );

-- Insert test documents
INSERT INTO documents (
  id,
  name,
  file_path,
  file_type,
  file_size,
  document_type,
  status,
  user_id,
  template_id,
  description,
  confidence,
  pages,
  fields_extracted,
  processing_history,
  created_at,
  updated_at,
  processed_date
) VALUES 
  (
    gen_random_uuid(),
    'Invoice_2024_001.pdf',
    'documents/invoice_2024_001.pdf',
    'application/pdf',
    2457600, -- 2.4 MB
    'invoice',
    'completed',
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM templates WHERE name = 'Standard Invoice Template' LIMIT 1),
    'Monthly service invoice from vendor',
    98.5,
    1,
    10,
    '[
      {
        "id": 1,
        "action": "Document uploaded",
        "timestamp": "2024-01-15T10:30:00Z",
        "user": "User",
        "details": "Document successfully uploaded and queued for processing"
      },
      {
        "id": 2,
        "action": "Processing started",
        "timestamp": "2024-01-15T10:30:15Z",
        "user": "System",
        "details": "AI processing initiated with OCR and field extraction"
      },
      {
        "id": 3,
        "action": "Data extraction completed",
        "timestamp": "2024-01-15T10:32:00Z",
        "user": "System",
        "details": "10 fields extracted with 98.5% average confidence"
      }
    ]'::jsonb,
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days'
  ),
  (
    gen_random_uuid(),
    'Bank_Statement_Jan.pdf',
    'documents/bank_statement_jan.pdf',
    'application/pdf',
    1887436, -- 1.8 MB
    'bank-statement',
    'processing',
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM templates WHERE name = 'Bank Statement Parser' LIMIT 1),
    'January 2024 bank statement',
    0,
    3,
    0,
    '[
      {
        "id": 1,
        "action": "Document uploaded",
        "timestamp": "2024-01-14T14:20:00Z",
        "user": "User",
        "details": "Document successfully uploaded and queued for processing"
      },
      {
        "id": 2,
        "action": "Processing started",
        "timestamp": "2024-01-14T14:20:30Z",
        "user": "System",
        "details": "AI processing initiated with OCR and field extraction"
      }
    ]'::jsonb,
    NOW() - INTERVAL '6 days',
    NOW() - INTERVAL '6 days',
    NULL
  ),
  (
    gen_random_uuid(),
    'Receipt_Coffee_Shop.jpg',
    'documents/receipt_coffee_shop.jpg',
    'image/jpeg',
    838860, -- 0.8 MB
    'receipt',
    'completed',
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM templates WHERE name = 'Receipt Scanner Pro' LIMIT 1),
    'Coffee shop receipt from downtown location',
    95.2,
    1,
    8,
    '[
      {
        "id": 1,
        "action": "Document uploaded",
        "timestamp": "2024-01-13T09:15:00Z",
        "user": "User",
        "details": "Image successfully uploaded and queued for processing"
      },
      {
        "id": 2,
        "action": "OCR processing completed",
        "timestamp": "2024-01-13T09:15:45Z",
        "user": "System",
        "details": "Text extraction from image completed"
      },
      {
        "id": 3,
        "action": "Field extraction completed",
        "timestamp": "2024-01-13T09:16:20Z",
        "user": "System",
        "details": "8 fields extracted with 95.2% average confidence"
      }
    ]'::jsonb,
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '7 days'
  ),
  (
    gen_random_uuid(),
    'Tax_Form_W2.pdf',
    'documents/tax_form_w2.pdf',
    'application/pdf',
    1258291, -- 1.2 MB
    'tax-form',
    'error',
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM templates WHERE name = 'Tax Form W-2 Extractor' LIMIT 1),
    'W-2 form for tax year 2023',
    0,
    1,
    0,
    '[
      {
        "id": 1,
        "action": "Document uploaded",
        "timestamp": "2024-01-12T16:45:00Z",
        "user": "User",
        "details": "Document successfully uploaded and queued for processing"
      },
      {
        "id": 2,
        "action": "Processing started",
        "timestamp": "2024-01-12T16:45:15Z",
        "user": "System",
        "details": "AI processing initiated with OCR and field extraction"
      },
      {
        "id": 3,
        "action": "Processing failed",
        "timestamp": "2024-01-12T16:46:00Z",
        "user": "System",
        "details": "OCR processing failed - document may be corrupted or low quality"
      }
    ]'::jsonb,
    NOW() - INTERVAL '8 days',
    NOW() - INTERVAL '8 days',
    NULL
  ),
  (
    gen_random_uuid(),
    'Expense_Report_Q1.pdf',
    'documents/expense_report_q1.pdf',
    'application/pdf',
    3251363, -- 3.1 MB
    'expense-report',
    'completed',
    (SELECT id FROM auth.users LIMIT 1),
    NULL, -- No template assigned
    'Q1 2024 expense report with multiple receipts',
    97.1,
    5,
    25,
    '[
      {
        "id": 1,
        "action": "Document uploaded",
        "timestamp": "2024-01-11T11:30:00Z",
        "user": "User",
        "details": "Multi-page document uploaded successfully"
      },
      {
        "id": 2,
        "action": "Processing started",
        "timestamp": "2024-01-11T11:30:20Z",
        "user": "System",
        "details": "Processing 5-page document with advanced OCR"
      },
      {
        "id": 3,
        "action": "Field extraction completed",
        "timestamp": "2024-01-11T11:33:45Z",
        "user": "System",
        "details": "25 fields extracted across all pages with 97.1% average confidence"
      }
    ]'::jsonb,
    NOW() - INTERVAL '9 days',
    NOW() - INTERVAL '9 days',
    NOW() - INTERVAL '9 days'
  ),
  (
    gen_random_uuid(),
    'Contract_Service_Agreement.pdf',
    'documents/contract_service_agreement.pdf',
    'application/pdf',
    4194304, -- 4.0 MB
    'contract',
    'completed',
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM templates WHERE name = 'Contract Terms Extractor' LIMIT 1),
    'Service agreement contract with vendor',
    89.7,
    12,
    18,
    '[
      {
        "id": 1,
        "action": "Document uploaded",
        "timestamp": "2024-01-10T14:00:00Z",
        "user": "User",
        "details": "Large contract document uploaded"
      },
      {
        "id": 2,
        "action": "Processing started",
        "timestamp": "2024-01-10T14:00:30Z",
        "user": "System",
        "details": "Processing multi-page legal document"
      },
      {
        "id": 3,
        "action": "Template applied",
        "timestamp": "2024-01-10T14:02:15Z",
        "user": "System",
        "details": "Contract Terms Extractor template applied"
      },
      {
        "id": 4,
        "action": "Extraction completed",
        "timestamp": "2024-01-10T14:05:30Z",
        "user": "System",
        "details": "18 contract terms extracted with 89.7% average confidence"
      }
    ]'::jsonb,
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '10 days'
  );

-- Update template usage statistics
UPDATE templates SET 
  documents_processed = (
    SELECT COUNT(*) 
    FROM documents 
    WHERE documents.template_id = templates.id 
    AND documents.status = 'completed'
  ),
  accuracy = (
    SELECT AVG(confidence) 
    FROM documents 
    WHERE documents.template_id = templates.id 
    AND documents.status = 'completed'
    AND documents.confidence > 0
  )
WHERE id IN (
  SELECT DISTINCT template_id 
  FROM documents 
  WHERE template_id IS NOT NULL
);

-- Add some sample processing statistics
COMMENT ON TABLE templates IS 'Template usage statistics are automatically calculated from processed documents';
COMMENT ON TABLE documents IS 'Document processing history is stored as JSONB for flexibility';