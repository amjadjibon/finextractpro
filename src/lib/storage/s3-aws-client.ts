/**
 * AWS S3 Client for Supabase Storage
 * 
 * Uses AWS SDK to interact with Supabase storage via S3 API
 */

import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand,
  ListBucketsCommand,
  CreateBucketCommand,
  HeadBucketCommand,
  ListObjectsV2Command
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export interface S3Config {
  endpoint: string
  region: string
  accessKeyId: string
  secretAccessKey: string
}

export interface S3UploadOptions {
  contentType?: string
  metadata?: Record<string, string>
  cacheControl?: string
}

export interface S3UploadResult {
  success: boolean
  path?: string
  url?: string
  error?: string
  size?: number
}

/**
 * AWS S3 compatible storage client for Supabase
 */
export class S3AwsClient {
  private s3Client: S3Client
  private bucketName: string
  private config: S3Config

  constructor(bucketName: string = 'documents') {
    this.bucketName = bucketName
    
    // Get S3 configuration from environment
    this.config = {
      endpoint: process.env.S3_ENDPOINT || '',
      region: process.env.S3_REGION || 'us-west-1',
      accessKeyId: process.env.ACCESS_KEY_ID || '',
      secretAccessKey: process.env.SECRET_KEY_ID || ''
    }

    // Validate configuration
    if (!this.config.endpoint || !this.config.accessKeyId || !this.config.secretAccessKey) {
      throw new Error('Missing S3 configuration. Required: S3_ENDPOINT, ACCESS_KEY_ID, SECRET_KEY_ID')
    }

    // Initialize S3 client
    this.s3Client = new S3Client({
      endpoint: this.config.endpoint,
      region: this.config.region,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey
      },
      forcePathStyle: true, // Required for Supabase S3 compatibility
      useAccelerateEndpoint: false
    })
  }

  /**
   * Check if bucket exists
   */
  async bucketExists(bucketName?: string): Promise<boolean> {
    const bucket = bucketName || this.bucketName
    
    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: bucket }))
      return true
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return false
      }
      throw error
    }
  }

  /**
   * List all buckets
   */
  async listBuckets(): Promise<{ buckets: string[], error?: string }> {
    try {
      const command = new ListBucketsCommand({})
      const response = await this.s3Client.send(command)
      
      const buckets = response.Buckets?.map(bucket => bucket.Name || '') || []
      return { buckets: buckets.filter(name => name.length > 0) }
      
    } catch (error: any) {
      return { 
        buckets: [], 
        error: error.message || 'Failed to list buckets' 
      }
    }
  }

  /**
   * Create bucket if it doesn't exist
   */
  async createBucket(bucketName?: string): Promise<{ success: boolean, error?: string }> {
    const bucket = bucketName || this.bucketName
    
    try {
      // Check if bucket already exists
      const exists = await this.bucketExists(bucket)
      if (exists) {
        return { success: true }
      }

      // Create the bucket
      const command = new CreateBucketCommand({ Bucket: bucket })
      await this.s3Client.send(command)
      
      console.log(`✅ Created S3 bucket: ${bucket}`)
      return { success: true }
      
    } catch (error: any) {
      console.error(`❌ Failed to create S3 bucket ${bucket}:`, error.message)
      return { 
        success: false, 
        error: error.message || `Failed to create bucket ${bucket}` 
      }
    }
  }

  /**
   * Upload file to S3
   */
  async upload(
    path: string,
    file: File | Buffer | ArrayBuffer,
    options: S3UploadOptions = {}
  ): Promise<S3UploadResult> {
    try {
      // Ensure bucket exists
      const bucketCheck = await this.createBucket()
      if (!bucketCheck.success) {
        return {
          success: false,
          error: `Bucket not available: ${bucketCheck.error}`
        }
      }

      // Convert file to buffer if needed
      let buffer: Buffer
      let contentType = options.contentType
      let size: number

      if (file instanceof File) {
        const arrayBuffer = await file.arrayBuffer()
        buffer = Buffer.from(arrayBuffer)
        contentType = contentType || file.type
        size = file.size
      } else if (file instanceof ArrayBuffer) {
        buffer = Buffer.from(file)
        size = file.byteLength
      } else {
        buffer = file
        size = file.length
      }

      // Upload to S3
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: path,
        Body: buffer,
        ContentType: contentType,
        Metadata: options.metadata,
        CacheControl: options.cacheControl
      })

      await this.s3Client.send(command)

      const url = `${this.config.endpoint}/${this.bucketName}/${path}`

      return {
        success: true,
        path,
        url,
        size
      }

    } catch (error: any) {
      console.error('S3 upload error:', error)
      return {
        success: false,
        error: error.message || 'Upload failed'
      }
    }
  }

  /**
   * Download/get file from S3
   */
  async download(path: string): Promise<{ data: Buffer | null, error: string | null }> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: path
      })

      const response = await this.s3Client.send(command)
      
      if (!response.Body) {
        return { data: null, error: 'No data returned' }
      }

      // Convert stream to buffer
      const chunks: Uint8Array[] = []
      const reader = response.Body.transformToWebStream().getReader()
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
      }

      const buffer = Buffer.concat(chunks)
      return { data: buffer, error: null }

    } catch (error: any) {
      return { 
        data: null, 
        error: error.message || 'Download failed' 
      }
    }
  }

  /**
   * Get signed URL for temporary access
   */
  async getSignedUrl(path: string, expiresIn: number = 3600): Promise<string | null> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: path
      })

      const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn })
      return signedUrl

    } catch (error: any) {
      console.error('Failed to generate signed URL:', error)
      return null
    }
  }

  /**
   * Delete file from S3
   */
  async delete(path: string): Promise<{ success: boolean, error?: string }> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: path
      })

      await this.s3Client.send(command)
      return { success: true }

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Delete failed'
      }
    }
  }

  /**
   * List objects in bucket
   */
  async listObjects(prefix?: string, maxKeys?: number): Promise<{
    objects: Array<{ key: string, size: number, lastModified: Date }>,
    error?: string
  }> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: prefix,
        MaxKeys: maxKeys
      })

      const response = await this.s3Client.send(command)
      
      const objects = response.Contents?.map(obj => ({
        key: obj.Key || '',
        size: obj.Size || 0,
        lastModified: obj.LastModified || new Date()
      })) || []

      return { objects }

    } catch (error: any) {
      return {
        objects: [],
        error: error.message || 'Failed to list objects'
      }
    }
  }
}

// Create default instances
export const documentsStorage = new S3AwsClient('documents')
export const exportsStorage = new S3AwsClient('exports')