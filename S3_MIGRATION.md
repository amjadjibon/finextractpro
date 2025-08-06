# S3 Storage System

FinExtractPro uses AWS S3 API for all storage operations through Supabase's S3-compatible interface.

## Current Configuration

```bash
S3_ENDPOINT=https://jsfqiwaalxlmlmmwxvsh.storage.supabase.co/storage/v1/s3
S3_REGION=us-west-1
ACCESS_KEY_ID=5619c8c5655556935901750b4f28ed95
SECRET_KEY_ID=c09c8a0818d830985b997d105214d299e669b0a2ab50f2f5694c668a2d44c385
```

## Storage Architecture

- **Client**: `src/lib/storage/s3-aws-client.ts` - AWS S3 SDK client
- **Buckets**: `documents`, `exports` (auto-created)
- **Operations**: Upload, download, signed URLs, delete
- **Structure**: `{userId}/{filename}` for data isolation

## Features

✅ **Automatic bucket creation**  
✅ **Signed URLs for secure access**  
✅ **Metadata support**  
✅ **Error handling and retries**  
✅ **Full CRUD operations**

## Testing

```bash
bun run test:s3  # Test all S3 operations
```

## Usage Example

```typescript
import { documentsStorage } from '@/lib/storage/s3-aws-client'

// Upload
const result = await documentsStorage.upload(path, file, { contentType: 'application/pdf' })

// Get signed URL  
const url = await documentsStorage.getSignedUrl(path, 3600)

// Delete
await documentsStorage.delete(path)
```

The system automatically handles bucket creation, so no manual setup is required.