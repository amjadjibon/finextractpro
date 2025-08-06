#!/usr/bin/env node

/**
 * Test S3 Configuration Script
 * 
 * Tests S3 bucket creation and access with the provided credentials
 */

async function testS3() {
  try {
    // Read environment variables
    require('dotenv').config({ path: '.env.local' })
    
    const s3Endpoint = process.env.S3_ENDPOINT
    const s3Region = process.env.S3_REGION
    const accessKeyId = process.env.ACCESS_KEY_ID
    const secretKeyId = process.env.SECRET_KEY_ID
    
    console.log('🔧 S3 Configuration:')
    console.log(`   Endpoint: ${s3Endpoint}`)
    console.log(`   Region: ${s3Region}`)
    console.log(`   Access Key: ${accessKeyId ? accessKeyId.substring(0, 8) + '...' : 'NOT SET'}`)
    console.log(`   Secret Key: ${secretKeyId ? secretKeyId.substring(0, 8) + '...' : 'NOT SET'}`)
    
    if (!s3Endpoint || !accessKeyId || !secretKeyId) {
      console.error('❌ Missing S3 configuration')
      console.error('   Required: S3_ENDPOINT, ACCESS_KEY_ID, SECRET_KEY_ID')
      process.exit(1)
    }
    
    // Import S3 client (using require for JS compatibility)
    console.log('\n📦 Loading S3 AWS Client...')
    const { S3AwsClient } = require('../src/lib/storage/s3-aws-client.ts')
    
    console.log('✅ S3 AWS Client loaded successfully')
    
    // Test bucket listing
    console.log('\n🪣 Testing bucket operations...')
    const s3Client = new S3AwsClient()
    
    console.log('📋 Listing existing buckets...')
    const { buckets, error } = await s3Client.listBuckets()
    
    if (error) {
      console.error('❌ Failed to list buckets:', error)
    } else {
      console.log('✅ Successfully connected to S3')
      console.log(`📊 Found ${buckets.length} existing buckets:`, buckets)
    }
    
    // Test bucket creation
    const testBuckets = ['documents', 'exports']
    
    for (const bucketName of testBuckets) {
      console.log(`\n🔨 Testing bucket: ${bucketName}`)
      
      const bucketClient = new S3AwsClient(bucketName)
      
      // Check if bucket exists
      const exists = await bucketClient.bucketExists()
      console.log(`   Exists: ${exists}`)
      
      if (!exists) {
        console.log(`   Creating bucket: ${bucketName}`)
        const createResult = await bucketClient.createBucket()
        
        if (createResult.success) {
          console.log(`   ✅ Created bucket: ${bucketName}`)
        } else {
          console.log(`   ❌ Failed to create bucket: ${createResult.error}`)
        }
      } else {
        console.log(`   ✅ Bucket ${bucketName} already exists`)
      }
    }
    
    // Test file upload
    console.log('\n📤 Testing file upload...')
    const testClient = new S3AwsClient('documents')
    
    const testContent = 'Hello from S3 test!'
    const testPath = 'test/hello.txt'
    
    const uploadResult = await testClient.upload(testPath, Buffer.from(testContent), {
      contentType: 'text/plain'
    })
    
    if (uploadResult.success) {
      console.log('✅ Test file uploaded successfully')
      console.log(`   Path: ${uploadResult.path}`)
      console.log(`   Size: ${uploadResult.size} bytes`)
      
      // Test signed URL generation
      console.log('\n🔗 Testing signed URL generation...')
      const signedUrl = await testClient.getSignedUrl(testPath, 300) // 5 minutes
      
      if (signedUrl) {
        console.log('✅ Signed URL generated successfully')
        console.log(`   URL: ${signedUrl.substring(0, 100)}...`)
      } else {
        console.log('❌ Failed to generate signed URL')
      }
      
      // Test file deletion
      console.log('\n🗑️  Cleaning up test file...')
      const deleteResult = await testClient.delete(testPath)
      
      if (deleteResult.success) {
        console.log('✅ Test file deleted successfully')
      } else {
        console.log('❌ Failed to delete test file:', deleteResult.error)
      }
      
    } else {
      console.log('❌ Test file upload failed:', uploadResult.error)
    }
    
    console.log('\n🎉 S3 configuration test completed!')
    
  } catch (error) {
    console.error('💥 S3 test failed:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

// Run if this script is executed directly
if (require.main === module) {
  testS3()
}

module.exports = { testS3 }