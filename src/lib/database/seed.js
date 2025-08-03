#!/usr/bin/env node

/**
 * Database Seed Script for FinExtractPro
 * 
 * This script seeds the database with test data for development and testing.
 * 
 * Usage:
 *   node src/lib/database/seed.js
 * 
 * Environment Variables Required:
 *   NEXT_PUBLIC_SUPABASE_URL - Your Supabase project URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY - Your Supabase anon key
 *   SUPABASE_SERVICE_ROLE_KEY - Your Supabase service role key (for admin operations)
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Check for required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
]

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:')
  missingEnvVars.forEach(envVar => console.error(`  - ${envVar}`))
  console.error('\nPlease set these in your .env.local file or environment')
  process.exit(1)
}

// Create Supabase client with service role key if available, otherwise use anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedDatabase() {
  console.log('🌱 Starting database seeding...')
  
  try {
    // Read the SQL seed file
    const sqlPath = join(__dirname, 'seed.sql')
    const seedSQL = readFileSync(sqlPath, 'utf8')
    
    console.log('📖 Reading seed SQL file...')
    
    // Check if we have any existing data
    const { data: existingTemplates } = await supabase
      .from('templates')
      .select('id')
      .limit(1)
    
    const { data: existingDocuments } = await supabase
      .from('documents')
      .select('id')
      .limit(1)
    
    if (existingTemplates?.length > 0 || existingDocuments?.length > 0) {
      console.log('⚠️  Database already contains data.')
      console.log('   This script will add more test data.')
      console.log('   To reset, please truncate the tables first.')
    }
    
    // Check if we have at least one user (required for foreign key constraints)
    const { data: users } = await supabase.auth.admin.listUsers()
    
    if (!users.users || users.users.length === 0) {
      console.log('👤 No users found. Creating a test user...')
      
      const { data: newUser, error: userError } = await supabase.auth.admin.createUser({
        email: 'testuser@example.com',
        password: 'testpassword123',
        email_confirm: true
      })
      
      if (userError) {
        console.error('❌ Failed to create test user:', userError.message)
        if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
          console.error('   Make sure your service role key has admin permissions')
        } else {
          console.error('   Consider setting SUPABASE_SERVICE_ROLE_KEY for admin operations')
        }
        process.exit(1)
      }
      
      console.log(`✅ Created test user: ${newUser.user.email}`)
    } else {
      console.log(`👥 Found ${users.users.length} existing user(s)`)
    }
    
    // Execute the seed SQL
    console.log('📊 Inserting template data...')
    
    // Since we can't execute raw SQL directly with the JS client in most cases,
    // we'll insert the data using the JS API
    await seedTemplates()
    await seedDocuments()
    
    console.log('✅ Database seeding completed successfully!')
    console.log('\n📈 Summary:')
    
    const { count: templateCount } = await supabase
      .from('templates')
      .select('*', { count: 'exact', head: true })
    
    const { count: documentCount } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
    
    console.log(`   Templates: ${templateCount}`)
    console.log(`   Documents: ${documentCount}`)
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message)
    process.exit(1)
  }
}

async function seedTemplates() {
  const templates = [
    {
      name: 'Standard Invoice Template',
      description: 'Extract common invoice fields like amount, date, vendor details',
      document_type: 'invoice',
      fields: [
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
      ],
      settings: {"confidence_threshold": 85, "auto_approve": false},
      is_public: true,
      is_favorite: false,
      tags: ['invoice', 'accounting', 'standard']
    },
    {
      name: 'Bank Statement Parser',
      description: 'Parse bank statements and extract transaction details',
      document_type: 'bank-statement',
      fields: [
        {"name": "Statement Date", "type": "date", "required": true},
        {"name": "Account Number", "type": "text", "required": true},
        {"name": "Beginning Balance", "type": "currency", "required": true},
        {"name": "Ending Balance", "type": "currency", "required": true},
        {"name": "Bank Name", "type": "text", "required": false},
        {"name": "Account Holder", "type": "text", "required": false}
      ],
      settings: {"confidence_threshold": 90, "auto_approve": true},
      is_public: true,
      is_favorite: false,
      tags: ['bank', 'transactions', 'finance']
    },
    {
      name: 'Receipt Scanner Pro',
      description: 'Advanced receipt scanning with line item detection',
      document_type: 'receipt',
      fields: [
        {"name": "Merchant Name", "type": "text", "required": true},
        {"name": "Receipt Date", "type": "date", "required": true},
        {"name": "Receipt Time", "type": "time", "required": false},
        {"name": "Total Amount", "type": "currency", "required": true},
        {"name": "Tax Amount", "type": "currency", "required": false},
        {"name": "Payment Method", "type": "text", "required": false},
        {"name": "Items", "type": "array", "required": false}
      ],
      settings: {"confidence_threshold": 80, "auto_approve": false},
      is_public: true,
      is_favorite: true,
      tags: ['receipt', 'expenses', 'retail']
    }
  ]
  
  for (const template of templates) {
    const { error } = await supabase
      .from('templates')
      .insert(template)
    
    if (error && !error.message.includes('duplicate')) {
      throw error
    }
  }
}

async function seedDocuments() {
  // Get a user ID and template IDs for foreign key references
  const { data: users } = await supabase.auth.admin.listUsers()
  if (!users.users || users.users.length === 0) {
    throw new Error('No users available for document seeding')
  }
  const userId = users.users[0].id
  
  const { data: templates } = await supabase
    .from('templates')
    .select('id, name')
  
  const templateMap = {}
  templates?.forEach(t => {
    templateMap[t.name] = t.id
  })
  
  const documents = [
    {
      name: 'Invoice_2024_001.pdf',
      file_path: 'documents/invoice_2024_001.pdf',
      file_type: 'application/pdf',
      file_size: 2457600,
      document_type: 'invoice',
      status: 'completed',
      user_id: userId,
      template_id: templateMap['Standard Invoice Template'],
      description: 'Monthly service invoice from vendor',
      confidence: 98.5,
      pages: 1,
      fields_extracted: 10,
      processing_history: [
        {
          "id": 1,
          "action": "Document uploaded",
          "timestamp": new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          "user": "User",
          "details": "Document successfully uploaded and queued for processing"
        },
        {
          "id": 2,
          "action": "Processing started",
          "timestamp": new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 15000).toISOString(),
          "user": "System",
          "details": "AI processing initiated with OCR and field extraction"
        },
        {
          "id": 3,
          "action": "Data extraction completed",
          "timestamp": new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 120000).toISOString(),
          "user": "System",
          "details": "10 fields extracted with 98.5% average confidence"
        }
      ],
      processed_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      name: 'Bank_Statement_Jan.pdf',
      file_path: 'documents/bank_statement_jan.pdf',
      file_type: 'application/pdf',
      file_size: 1887436,
      document_type: 'bank-statement',
      status: 'processing',
      user_id: userId,
      template_id: templateMap['Bank Statement Parser'],
      description: 'January 2024 bank statement',
      confidence: 0,
      pages: 3,
      fields_extracted: 0,
      processing_history: [
        {
          "id": 1,
          "action": "Document uploaded",
          "timestamp": new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          "user": "User",
          "details": "Document successfully uploaded and queued for processing"
        },
        {
          "id": 2,
          "action": "Processing started",
          "timestamp": new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 30000).toISOString(),
          "user": "System",
          "details": "AI processing initiated with OCR and field extraction"
        }
      ],
      processed_date: null
    },
    {
      name: 'Receipt_Coffee_Shop.jpg',
      file_path: 'documents/receipt_coffee_shop.jpg',
      file_type: 'image/jpeg',
      file_size: 838860,
      document_type: 'receipt',
      status: 'completed',
      user_id: userId,
      template_id: templateMap['Receipt Scanner Pro'],
      description: 'Coffee shop receipt from downtown location',
      confidence: 95.2,
      pages: 1,
      fields_extracted: 8,
      processing_history: [
        {
          "id": 1,
          "action": "Document uploaded",
          "timestamp": new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          "user": "User",
          "details": "Image successfully uploaded and queued for processing"
        },
        {
          "id": 2,
          "action": "OCR processing completed",
          "timestamp": new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 45000).toISOString(),
          "user": "System",
          "details": "Text extraction from image completed"
        },
        {
          "id": 3,
          "action": "Field extraction completed",
          "timestamp": new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 80000).toISOString(),
          "user": "System",
          "details": "8 fields extracted with 95.2% average confidence"
        }
      ],
      processed_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]
  
  for (const document of documents) {
    const { error } = await supabase
      .from('documents')
      .insert(document)
    
    if (error && !error.message.includes('duplicate')) {
      throw error
    }
  }
}

// Run the seeder
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
}

export { seedDatabase }