# Database Setup and Seeding

This directory contains database migration scripts and seed data for FinExtractPro.

## Files

- `migrations/` - SQL migration scripts for database schema
- `seed.sql` - SQL seed data for development/testing
- `seed.js` - JavaScript seed runner script

## Database Seeding

The seed script creates realistic test data for development and testing purposes.

### Prerequisites

1. **Supabase Project**: Make sure you have a Supabase project set up
2. **Environment Variables**: Set the following in your `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Optional, for admin operations
   ```

3. **Database Schema**: Ensure your database has the required tables by running the migrations first:
   ```bash
   # Apply migrations through Supabase Dashboard or CLI
   supabase db push
   ```

### Running the Seed Script

#### Option 1: Direct Node.js execution
```bash
node src/lib/database/seed.js
```

#### Option 2: Through npm script (if added to package.json)
```bash
npm run db:seed
```

### What the Seed Script Creates

#### Templates (5 records)
- **Standard Invoice Template** - For extracting invoice data
- **Bank Statement Parser** - For bank statement processing
- **Receipt Scanner Pro** - For receipt scanning
- **Tax Form W-2 Extractor** - For tax document processing
- **Contract Terms Extractor** - For legal document analysis

#### Documents (6 records)
- **Invoice_2024_001.pdf** - Completed invoice (98.5% confidence)
- **Bank_Statement_Jan.pdf** - Processing bank statement
- **Receipt_Coffee_Shop.jpg** - Completed receipt (95.2% confidence)
- **Tax_Form_W2.pdf** - Failed processing (error state)
- **Expense_Report_Q1.pdf** - Completed expense report (97.1% confidence)
- **Contract_Service_Agreement.pdf** - Completed contract (89.7% confidence)

Each document includes:
- Realistic file metadata (size, type, etc.)
- Processing history with timestamps
- Various status states (completed, processing, error)
- Template associations where applicable

### Test User

If no users exist in your Supabase Auth, the script will create a test user:
- **Email**: `testuser@example.com`
- **Password**: `testpassword123`

### Database Constraints

The seed data respects all foreign key constraints:
- Documents reference valid templates (where applicable)
- All records reference valid user IDs
- Processing history is stored as JSONB for flexibility

### Development Notes

1. **Idempotent**: The script can be run multiple times safely
2. **Realistic Data**: All timestamps, file sizes, and processing states are realistic
3. **Status Variety**: Documents have different processing states for testing UI components
4. **Template Usage**: Templates have varying usage statistics and settings

### Cleaning Up

To reset the database:
```sql
-- Through Supabase SQL Editor or CLI
TRUNCATE documents, templates RESTART IDENTITY CASCADE;
```

Or use the Supabase Dashboard to delete all records from both tables.

## Migration Files

Migration files in the `migrations/` directory should be applied in order:
1. `001_create_documents_table.sql` - Creates the core schema

Apply through Supabase CLI:
```bash
supabase db push
```

Or copy the SQL content into the Supabase SQL Editor.