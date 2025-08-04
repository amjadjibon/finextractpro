/**
 * S3-Compatible Supabase Storage Client
 * 
 * This module provides S3-like interface for Supabase Storage
 * with better performance, signed URLs, and advanced features
 */

import { createClient } from '@/lib/supabase/server'

export interface UploadOptions {
  contentType?: string
  cacheControl?: string
  upsert?: boolean
  metadata?: Record<string, string>
}

export interface UploadResult {
  success: boolean
  path?: string
  fullPath?: string
  publicUrl?: string
  signedUrl?: string
  error?: string
}

export interface StorageObject {
  name: string
  id: string
  updated_at: string
  created_at: string
  last_accessed_at: string
  metadata: Record<string, any>
  buckets?: {
    id: string
    name: string
    public: boolean
  }
}

export class S3CompatibleStorage {
  private bucketName: string
  private bucketInitialized: boolean = false
  
  constructor(bucketName: string = 'documents') {
    this.bucketName = bucketName
  }

  /**
   * Check if bucket exists (but don't create it)
   */
  private async ensureBucketExists(): Promise<void> {
    if (this.bucketInitialized) {
      return
    }

    try {
      const supabase = await createClient()
      
      // Check if bucket exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets()
      
      if (listError) {
        console.warn(`Could not list buckets: ${listError.message}`)
        this.bucketInitialized = true // Skip further checks
        return
      }

      const bucketExists = buckets?.some(bucket => bucket.id === this.bucketName)
      
      if (!bucketExists) {
        throw new Error(`Storage bucket '${this.bucketName}' does not exist. Please create it manually in your Supabase dashboard:\n1. Go to Storage\n2. Click 'Create bucket'\n3. Name: '${this.bucketName}'\n4. Keep it private (not public)\n5. Click 'Create bucket'`)
      }

      this.bucketInitialized = true
    } catch (error) {
      console.error(`Error checking bucket ${this.bucketName}:`, error)
      throw error
    }
  }

  /**
   * Upload a file to S3-compatible storage
   */
  async upload(
    path: string, 
    file: File | Buffer | ArrayBuffer, 
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    try {
      // Ensure bucket exists first
      await this.ensureBucketExists()
      
      const supabase = await createClient()
      
      // Validate supabase client
      if (!supabase) {
        return {
          success: false,
          error: 'Supabase client is null or undefined'
        }
      }
      
      if (!supabase.storage) {
        return {
          success: false,
          error: 'Supabase storage is not available on the client'
        }
      }
      
      // Convert File to ArrayBuffer if needed
      let buffer: ArrayBuffer
      if (file instanceof File) {
        buffer = await file.arrayBuffer()
      } else if (file instanceof Buffer) {
        buffer = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) as ArrayBuffer
      } else {
        buffer = file as ArrayBuffer
      }

      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(path, buffer, {
          contentType: options.contentType || 'application/octet-stream',
          cacheControl: options.cacheControl || '3600',
          upsert: options.upsert || false
        })

      if (error) {
        return {
          success: false,
          error: error.message
        }
      }

      // Get signed URL for the uploaded file
      const { data: signedUrlData } = await supabase.storage
        .from(this.bucketName)
        .createSignedUrl(path, 3600) // 1 hour expiry

      return {
        success: true,
        path: data.path,
        fullPath: data.fullPath,
        signedUrl: signedUrlData?.signedUrl || undefined,
        publicUrl: (await this.getPublicUrl(path)) || undefined
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Upload failed'
      }
    }
  }

  /**
   * Download a file from storage
   */
  async download(path: string): Promise<{ data: Blob | null, error: string | null }> {
    try {
      await this.ensureBucketExists()
      const supabase = await createClient()
      
      // Validate supabase client
      if (!supabase || !supabase.storage) {
        return { data: null, error: 'Supabase client not initialized properly' }
      }
      
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .download(path)

      if (error) {
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (err) {
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Download failed' 
      }
    }
  }

  /**
   * Get a signed URL for temporary access
   */
  async getSignedUrl(path: string, expiresIn: number = 3600): Promise<string | null> {
    try {
      await this.ensureBucketExists()
      const supabase = await createClient()
      
      // Validate supabase client
      if (!supabase || !supabase.storage) {
        console.error('Supabase client not initialized properly')
        return null
      }
      
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .createSignedUrl(path, expiresIn)

      if (error) {
        console.error('Error creating signed URL:', error)
        return null
      }

      return data.signedUrl
    } catch (err) {
      console.error('Error creating signed URL:', err)
      return null
    }
  }

  /**
   * Get public URL (if bucket is public)
   */
  async getPublicUrl(path: string): Promise<string | null> {
    try {
      const supabase = await createClient()
      
      // Validate supabase client
      if (!supabase || !supabase.storage) {
        console.error('Supabase client not initialized properly')
        return null
      }
      
      const { data } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(path)

      return data.publicUrl
    } catch (err) {
      console.error('Error getting public URL:', err)
      return null
    }
  }

  /**
   * Delete a file from storage
   */
  async delete(path: string): Promise<{ success: boolean, error?: string }> {
    try {
      const supabase = await createClient()
      
      // Validate supabase client
      if (!supabase || !supabase.storage) {
        return { success: false, error: 'Supabase client not initialized properly' }
      }
      
      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([path])

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Delete failed' 
      }
    }
  }

  /**
   * List files in a directory
   */
  async list(
    path?: string, 
    options: { limit?: number, offset?: number, sortBy?: { column: string, order: string } } = {}
  ): Promise<{ data: StorageObject[] | null, error: string | null }> {
    try {
      const supabase = await createClient()
      
      // Validate supabase client
      if (!supabase || !supabase.storage) {
        return { data: null, error: 'Supabase client not initialized properly' }
      }
      
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .list(path, {
          limit: options.limit || 100,
          offset: options.offset || 0,
          sortBy: options.sortBy || { column: 'name', order: 'asc' }
        })

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: data as StorageObject[], error: null }
    } catch (err) {
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'List failed' 
      }
    }
  }

  /**
   * Copy a file within storage
   */
  async copy(fromPath: string, toPath: string): Promise<{ success: boolean, error?: string }> {
    try {
      const supabase = await createClient()
      
      // Validate supabase client
      if (!supabase || !supabase.storage) {
        return { success: false, error: 'Supabase client not initialized properly' }
      }
      
      const { error } = await supabase.storage
        .from(this.bucketName)
        .copy(fromPath, toPath)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Copy failed' 
      }
    }
  }

  /**
   * Move a file within storage
   */
  async move(fromPath: string, toPath: string): Promise<{ success: boolean, error?: string }> {
    try {
      const supabase = await createClient()
      
      // Validate supabase client
      if (!supabase || !supabase.storage) {
        return { success: false, error: 'Supabase client not initialized properly' }
      }
      
      const { error } = await supabase.storage
        .from(this.bucketName)
        .move(fromPath, toPath)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Move failed' 
      }
    }
  }

  /**
   * Get file metadata
   */
  async getMetadata(path: string): Promise<{ data: any | null, error: string | null }> {
    try {
      // List the parent directory to get file metadata
      const pathParts = path.split('/')
      const fileName = pathParts.pop()
      const directory = pathParts.join('/')

      const { data, error } = await this.list(directory)
      
      if (error) {
        return { data: null, error }
      }

      const fileMetadata = data?.find(file => file.name === fileName)
      
      if (!fileMetadata) {
        return { data: null, error: 'File not found' }
      }

      return { data: fileMetadata, error: null }
    } catch (err) {
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Failed to get metadata' 
      }
    }
  }

  /**
   * Generate pre-signed upload URL for direct client uploads
   */
  async createPresignedUploadUrl(
    path: string,
    expiresIn: number = 3600
  ): Promise<{ uploadUrl: string | null, error: string | null }> {
    try {
      const supabase = await createClient()
      
      // Validate supabase client
      if (!supabase || !supabase.storage) {
        return { uploadUrl: null, error: 'Supabase client not initialized properly' }
      }
      
      // Note: Supabase doesn't have direct presigned upload URLs like AWS S3
      // This is a placeholder for when they add this feature
      // For now, we return a regular signed URL
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .createSignedUrl(path, expiresIn)

      if (error) {
        return { uploadUrl: null, error: error.message }
      }

      return { uploadUrl: data.signedUrl, error: null }
    } catch (err) {
      return { 
        uploadUrl: null, 
        error: err instanceof Error ? err.message : 'Failed to create presigned URL' 
      }
    }
  }
}

// Default instance for documents
export const documentsStorage = new S3CompatibleStorage('documents')

// Instance for export files
export const exportsStorage = new S3CompatibleStorage('exports')

// Utility functions
export const storageUtils = {
  /**
   * Generate a unique file path for a user
   */
  generateUserFilePath(userId: string, originalFileName: string): string {
    const timestamp = Date.now()
    const sanitizedName = originalFileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .substring(0, 100)
    
    return `${userId}/${timestamp}_${sanitizedName}`
  },

  /**
   * Get file extension from path or filename
   */
  getFileExtension(path: string): string {
    return path.split('.').pop()?.toLowerCase() || ''
  },

  /**
   * Get MIME type from file extension
   */
  getMimeType(extension: string): string {
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      txt: 'text/plain',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      tiff: 'image/tiff',
      tif: 'image/tiff'
    }
    
    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream'
  },

  /**
   * Format file size in human readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}