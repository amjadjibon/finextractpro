# S3-Compatible Supabase Storage

This module provides an S3-compatible interface for Supabase Storage, offering enhanced performance, better error handling, and additional features like signed URLs, metadata management, and advanced file operations.

## Features

- **S3-Compatible API**: Familiar interface for developers coming from AWS S3
- **Enhanced Performance**: Optimized operations with better error handling
- **Signed URLs**: Secure temporary access to files
- **Metadata Support**: Store additional file metadata
- **Advanced Operations**: Copy, move, list files with advanced options
- **Utility Functions**: File type detection, size formatting, path generation

## Basic Usage

```typescript
import { documentsStorage, storageUtils } from '@/lib/storage/s3-client'

// Upload a file
const uploadResult = await documentsStorage.upload(
  'user123/document.pdf',
  file,
  {
    contentType: 'application/pdf',
    metadata: {
      originalName: 'invoice.pdf',
      documentType: 'invoice'
    }
  }
)

// Get a signed URL
const signedUrl = await documentsStorage.getSignedUrl('user123/document.pdf', 3600)

// Download a file
const { data: blob } = await documentsStorage.download('user123/document.pdf')

// List files in a directory
const { data: files } = await documentsStorage.list('user123/', {
  limit: 50,
  sortBy: { column: 'created_at', order: 'desc' }
})
```

## API Reference

### Class: S3CompatibleStorage

#### Constructor
```typescript
new S3CompatibleStorage(bucketName?: string)
```

#### Methods

##### upload(path, file, options?)
Upload a file to storage.

**Parameters:**
- `path: string` - File path in storage
- `file: File | Buffer | ArrayBuffer` - File to upload
- `options: UploadOptions` - Upload configuration

**Returns:** `Promise<UploadResult>`

**Example:**
```typescript
const result = await storage.upload('users/123/document.pdf', file, {
  contentType: 'application/pdf',
  cacheControl: '3600',
  metadata: { type: 'invoice' }
})
```

##### download(path)
Download a file from storage.

**Parameters:**
- `path: string` - File path in storage

**Returns:** `Promise<{ data: Blob | null, error: string | null }>`

##### getSignedUrl(path, expiresIn?)
Get a temporary signed URL for file access.

**Parameters:**
- `path: string` - File path in storage
- `expiresIn: number` - Expiration time in seconds (default: 3600)

**Returns:** `Promise<string | null>`

##### delete(path)
Delete a file from storage.

**Parameters:**
- `path: string` - File path to delete

**Returns:** `Promise<{ success: boolean, error?: string }>`

##### list(path?, options?)
List files in a directory.

**Parameters:**
- `path?: string` - Directory path (optional)
- `options?: ListOptions` - Listing options

**Returns:** `Promise<{ data: StorageObject[] | null, error: string | null }>`

##### copy(fromPath, toPath)
Copy a file within storage.

**Parameters:**
- `fromPath: string` - Source file path
- `toPath: string` - Destination file path

**Returns:** `Promise<{ success: boolean, error?: string }>`

##### move(fromPath, toPath)
Move a file within storage.

**Parameters:**
- `fromPath: string` - Source file path
- `toPath: string` - Destination file path

**Returns:** `Promise<{ success: boolean, error?: string }>`

##### getMetadata(path)
Get file metadata.

**Parameters:**
- `path: string` - File path

**Returns:** `Promise<{ data: any | null, error: string | null }>`

### Utility Functions

#### storageUtils.generateUserFilePath(userId, originalFileName)
Generate a unique file path for a user.

```typescript
const filePath = storageUtils.generateUserFilePath('user123', 'invoice.pdf')
// Returns: "user123/1640995200000_invoice.pdf"
```

#### storageUtils.getMimeType(extension)
Get MIME type from file extension.

```typescript
const mimeType = storageUtils.getMimeType('pdf')
// Returns: "application/pdf"
```

#### storageUtils.formatFileSize(bytes)
Format file size in human-readable format.

```typescript
const formatted = storageUtils.formatFileSize(1048576)
// Returns: "1 MB"
```

## Storage Configuration

### Bucket Setup
The storage system automatically creates and configures the necessary bucket with proper security policies.

### Row Level Security (RLS)
Files are automatically isolated by user ID through RLS policies:
- Users can only access their own files
- Path structure: `{userId}/{filename}`
- Automatic security enforcement

### File Path Structure
```
bucket-name/
  ├── user1/
  │   ├── 1640995200000_document1.pdf
  │   └── 1640995300000_document2.jpg
  ├── user2/
  │   ├── 1640995400000_invoice.pdf
  │   └── 1640995500000_receipt.png
  └── ...
```

## Error Handling

All methods return structured error responses:

```typescript
const result = await documentsStorage.upload(path, file)

if (!result.success) {
  console.error('Upload failed:', result.error)
  // Handle error appropriately
}
```

## Performance Optimizations

- **Parallel Operations**: All operations support concurrent execution
- **Efficient Uploads**: Direct buffer/stream processing
- **Smart Caching**: Configurable cache headers
- **Minimal Memory Usage**: Stream-based processing for large files

## Migration from Direct Supabase Storage

Replace direct Supabase storage calls:

```typescript
// Before (Direct Supabase)
const { data, error } = await supabase.storage
  .from('documents')
  .upload(path, file)

// After (S3-Compatible)
const result = await documentsStorage.upload(path, file)
```

## Security Features

- **Automatic User Isolation**: RLS policies enforce data separation
- **Signed URLs**: Temporary access with configurable expiration
- **Metadata Validation**: Secure metadata storage and retrieval
- **Access Control**: Fine-grained permissions through RLS

## Examples

### Complete Upload Workflow
```typescript
import { documentsStorage, storageUtils } from '@/lib/storage/s3-client'

async function uploadDocument(userId: string, file: File) {
  // Generate secure file path
  const filePath = storageUtils.generateUserFilePath(userId, file.name)
  
  // Upload with metadata
  const result = await documentsStorage.upload(filePath, file, {
    contentType: file.type,
    metadata: {
      originalName: file.name,
      uploadedBy: userId,
      size: file.size.toString()
    }
  })
  
  if (result.success) {
    // Get signed URL for immediate access
    const signedUrl = await documentsStorage.getSignedUrl(filePath, 3600)
    
    return {
      path: result.path,
      url: signedUrl,
      publicUrl: result.publicUrl
    }
  } else {
    throw new Error(result.error)
  }
}
```

### File Management Dashboard
```typescript
async function getFilesList(userId: string) {
  const { data: files, error } = await documentsStorage.list(userId, {
    limit: 100,
    sortBy: { column: 'created_at', order: 'desc' }
  })
  
  if (error) {
    throw new Error(error)
  }
  
  return files?.map(file => ({
    name: file.name,
    size: storageUtils.formatFileSize(file.metadata?.size || 0),
    type: storageUtils.getMimeType(storageUtils.getFileExtension(file.name)),
    lastModified: file.updated_at
  }))
}
```

This S3-compatible storage system provides a robust, secure, and performant solution for file management in the FinExtractPro application.