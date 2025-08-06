# Storage System

The application uses AWS S3 API for all storage operations through Supabase's S3-compatible interface.

## Configuration

Required environment variables in `.env.local`:

```bash
S3_ENDPOINT=https://jsfqiwaalxlmlmmwxvsh.storage.supabase.co/storage/v1/s3
S3_REGION=us-west-1
ACCESS_KEY_ID=your_access_key_id
SECRET_KEY_ID=your_secret_key_id
```

## Usage

```typescript
import { documentsStorage, exportsStorage } from '@/lib/storage/s3-aws-client'

// Upload file
const result = await documentsStorage.upload('path/to/file.pdf', fileBuffer, {
  contentType: 'application/pdf',
  metadata: { uploadedBy: userId }
})

// Get signed URL
const url = await documentsStorage.getSignedUrl('path/to/file.pdf', 3600)

// Delete file
await documentsStorage.delete('path/to/file.pdf')
```

## Storage Structure

- **documents**: User document uploads (`{userId}/{filename}`)
- **exports**: Generated export files (`{userId}/{export-filename}`)

## Features

- ✅ Automatic bucket creation
- ✅ Signed URLs for secure access
- ✅ Metadata support
- ✅ Error handling and retries
- ✅ Full CRUD operations

## Testing

Run `bun run test:s3` to verify storage operations.