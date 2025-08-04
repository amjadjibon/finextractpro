# Storage Setup Guide

This application requires two storage buckets in Supabase to function properly:

## Required Buckets

### 1. Documents Bucket
- **Name**: `documents`
- **Public**: No (Private)
- **Purpose**: Store uploaded user documents

### 2. Exports Bucket  
- **Name**: `exports`
- **Public**: No (Private)
- **Purpose**: Store generated export files

## Manual Setup Instructions

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the sidebar
3. Click **Create bucket**
4. Create the first bucket:
   - Name: `documents`
   - Public: **Off** (keep it private)
   - Click **Create bucket**
5. Create the second bucket:
   - Name: `exports`
   - Public: **Off** (keep it private)
   - Click **Create bucket**

## Verification

After creating the buckets, you can verify they exist by visiting:
```
GET /api/storage/init
```

This endpoint will show the status of all required buckets.

## Troubleshooting

### "Bucket not found" errors
- Make sure both `documents` and `exports` buckets exist in your Supabase Storage
- Ensure buckets are private (not public)
- Check that your Supabase URL and anon key are correct in your environment variables

### RLS Policy errors
- This is normal when trying to create buckets programmatically
- Use the manual setup instructions above instead
- Buckets only need to be created once per Supabase project

## Environment Variables Required

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## File Organization

### Documents Bucket Structure
```
documents/
├── {user_id}/
│   ├── {timestamp}_{filename}.pdf
│   ├── {timestamp}_{filename}.jpg
│   └── ...
```

### Exports Bucket Structure
```
exports/
├── {user_id}/
│   ├── {timestamp}_{export_name}.json
│   ├── {timestamp}_{export_name}.csv
│   ├── {timestamp}_{export_name}.xlsx
│   └── ...
```

All files are organized by user ID and include timestamps to prevent conflicts.