/**
 * Storage Bucket Initialization
 * 
 * Creates required storage buckets if they don't exist
 */

import { createClient } from '@/lib/supabase/server'

export interface BucketConfig {
  id: string
  name: string
  public: boolean
  allowedMimeTypes?: string[]
  fileSizeLimit?: number
  allowedFileExtensions?: string[]
}

const REQUIRED_BUCKETS: BucketConfig[] = [
  {
    id: 'documents',
    name: 'documents',
    public: false,
    allowedMimeTypes: [
      'application/pdf',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/tiff',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    fileSizeLimit: 50 * 1024 * 1024, // 50MB
    allowedFileExtensions: ['pdf', 'txt', 'jpg', 'jpeg', 'png', 'tiff', 'tif', 'doc', 'docx']
  },
  {
    id: 'exports',
    name: 'exports',
    public: false,
    allowedMimeTypes: [
      'application/json',
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip'
    ],
    fileSizeLimit: 100 * 1024 * 1024, // 100MB
    allowedFileExtensions: ['json', 'csv', 'xlsx', 'zip']
  }
]

export class BucketInitializer {
  private supabase: any

  constructor(supabase: any) {
    this.supabase = supabase
  }

  /**
   * Initialize all required buckets
   */
  async initializeAllBuckets(): Promise<{ success: boolean, results: any[], errors: string[] }> {
    const results: any[] = []
    const errors: string[] = []

    console.log('🪣 Initializing storage buckets...')

    for (const bucketConfig of REQUIRED_BUCKETS) {
      try {
        const result = await this.initializeBucket(bucketConfig)
        results.push(result)
        
        if (!result.success && result.error) {
          errors.push(`${bucketConfig.id}: ${result.error}`)
        }
      } catch (error) {
        const errorMsg = `${bucketConfig.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        errors.push(errorMsg)
        results.push({ 
          bucketId: bucketConfig.id, 
          success: false, 
          error: errorMsg,
          action: 'failed'
        })
      }
    }

    const allSuccess = results.every(r => r.success)
    console.log(`✅ Bucket initialization ${allSuccess ? 'completed' : 'completed with errors'}`)

    return {
      success: allSuccess,
      results,
      errors
    }
  }

  /**
   * Initialize a single bucket
   */
  async initializeBucket(config: BucketConfig): Promise<{
    bucketId: string
    success: boolean
    action: 'created' | 'exists' | 'updated' | 'failed'
    error?: string
  }> {
    try {
      // Check if bucket exists
      const { data: existingBuckets, error: listError } = await this.supabase.storage.listBuckets()
      
      if (listError) {
        console.error(`Error listing buckets:`, listError)
        return {
          bucketId: config.id,
          success: false,
          action: 'failed',
          error: listError.message
        }
      }

      const bucketExists = existingBuckets?.some((bucket: any) => bucket.id === config.id)

      if (bucketExists) {
        console.log(`📁 Bucket '${config.id}' already exists`)
        return {
          bucketId: config.id,
          success: true,
          action: 'exists'
        }
      }

      // Create the bucket
      console.log(`📁 Creating bucket '${config.id}'...`)
      const { error: createError } = await this.supabase.storage.createBucket(
        config.id,
        {
          public: config.public
        }
      )

      if (createError) {
        console.error(`Error creating bucket '${config.id}':`, createError)
        return {
          bucketId: config.id,
          success: false,
          action: 'failed',
          error: createError.message
        }
      }

      console.log(`✅ Created bucket '${config.id}' successfully`)
      return {
        bucketId: config.id,
        success: true,
        action: 'created'
      }

    } catch (error) {
      console.error(`Unexpected error initializing bucket '${config.id}':`, error)
      return {
        bucketId: config.id,
        success: false,
        action: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Check bucket health and permissions
   */
  async checkBucketHealth(bucketId: string): Promise<{
    exists: boolean
    accessible: boolean
    canWrite: boolean
    error?: string
  }> {
    try {
      // Check if we can list files in the bucket
      const { error: listError } = await this.supabase.storage
        .from(bucketId)
        .list('', { limit: 1 })

      if (listError) {
        if (listError.message.includes('not found') || listError.message.includes('does not exist')) {
          return {
            exists: false,
            accessible: false,
            canWrite: false,
            error: 'Bucket does not exist'
          }
        }
        
        return {
          exists: true,
          accessible: false,
          canWrite: false,
          error: listError.message
        }
      }

      // Try to create a test file to check write permissions
      const testPath = `_health_check_${Date.now()}.txt`
      const testContent = 'health check'
      
      const { error: uploadError } = await this.supabase.storage
        .from(bucketId)
        .upload(testPath, testContent, { upsert: true })

      if (uploadError) {
        return {
          exists: true,
          accessible: true,
          canWrite: false,
          error: uploadError.message
        }
      }

      // Clean up test file
      await this.supabase.storage
        .from(bucketId)
        .remove([testPath])

      return {
        exists: true,
        accessible: true,
        canWrite: true
      }

    } catch (error) {
      return {
        exists: false,
        accessible: false,
        canWrite: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

/**
 * Initialize buckets for the application
 */
export async function initializeStorageBuckets() {
  try {
    const supabase = await createClient()
    const initializer = new BucketInitializer(supabase)
    return await initializer.initializeAllBuckets()
  } catch (error) {
    console.error('Failed to initialize storage buckets:', error)
    return {
      success: false,
      results: [],
      errors: [error instanceof Error ? error.message : 'Unknown error']
    }
  }
}

/**
 * Check if a specific bucket exists and is accessible
 */
export async function checkBucketStatus(bucketId: string) {
  try {
    const supabase = await createClient()
    const initializer = new BucketInitializer(supabase)
    return await initializer.checkBucketHealth(bucketId)
  } catch (error) {
    return {
      exists: false,
      accessible: false,
      canWrite: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}