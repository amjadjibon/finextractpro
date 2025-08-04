/**
 * Storage Initialization API
 * 
 * Manually creates required storage buckets
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { initializeStorageBuckets } from '@/lib/storage/bucket-init'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get user from session for security (optional - you can remove this for setup)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.log('⚠️  No authenticated user, but proceeding with bucket initialization for setup')
    }

    console.log('🚀 Starting storage bucket initialization...')
    
    const result = await initializeStorageBuckets()
    
    if (result.success) {
      console.log('✅ All buckets initialized successfully')
      return NextResponse.json({
        success: true,
        message: 'Storage buckets initialized successfully',
        results: result.results
      })
    } else {
      console.error('❌ Some buckets failed to initialize:', result.errors)
      return NextResponse.json({
        success: false,
        message: 'Some buckets failed to initialize',
        results: result.results,
        errors: result.errors
      }, { status: 207 }) // 207 Multi-Status for partial success
    }

  } catch (error) {
    console.error('Storage initialization error:', error)
    return NextResponse.json({
      success: false,
      error: 'Storage initialization failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // List all buckets to show current status
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to list buckets',
        details: listError.message
      }, { status: 500 })
    }

    const requiredBuckets = ['documents', 'exports']
    const status = requiredBuckets.map(bucketId => {
      const exists = buckets?.some(bucket => bucket.id === bucketId)
      return {
        bucketId,
        exists,
        status: exists ? 'ready' : 'missing'
      }
    })

    const allReady = status.every(s => s.exists)

    return NextResponse.json({
      success: allReady,
      message: allReady ? 'All required buckets exist' : 'Some buckets are missing',
      buckets: status,
      allBuckets: buckets
    })

  } catch (error) {
    console.error('Storage status check error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to check storage status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}