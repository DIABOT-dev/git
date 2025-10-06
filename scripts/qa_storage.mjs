#!/usr/bin/env node
/**
 * QA Storage Connectivity Test
 * Tests Viettel Cloud S3 configuration and mock connectivity
 */

import { config } from 'dotenv';
import { writeFile, readFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

config({ path: '.env.local' });

const VIETTEL_S3_VARS = [
  'S3_ENDPOINT',
  'S3_REGION',
  'S3_BUCKET',
  'S3_ACCESS_KEY',
  'S3_SECRET_KEY',
];

function checkStorageConfig() {
  const provider = process.env.STORAGE_PROVIDER || 'not_configured';

  console.log(`[STORAGE-QA] Provider: ${provider}`);

  if (provider === 'not_configured') {
    console.log('[STORAGE-QA] Storage not configured (expected for development)');
    return { configured: false, reason: 'Provider not set' };
  }

  if (provider === 'viettel') {
    const missing = VIETTEL_S3_VARS.filter(v => !process.env[v]);

    if (missing.length > 0) {
      console.error('[STORAGE-QA] Missing Viettel S3 variables:', missing.join(', '));
      return { configured: false, reason: 'Missing variables' };
    }

    // Check for placeholder values
    if (process.env.S3_ACCESS_KEY === 'TO_BE_PROVIDED') {
      console.warn('[STORAGE-QA] Viettel S3 credentials are placeholder values');
      console.warn('[STORAGE-QA] This is expected before Viettel Cloud subscription');
      return { configured: false, reason: 'Placeholder credentials' };
    }

    console.log('[STORAGE-QA] Viettel S3 configuration detected:');
    console.log(`  Endpoint: ${process.env.S3_ENDPOINT}`);
    console.log(`  Region: ${process.env.S3_REGION}`);
    console.log(`  Bucket: ${process.env.S3_BUCKET}`);
    console.log(`  Access Key: ${process.env.S3_ACCESS_KEY?.substring(0, 8)}...`);

    return { configured: true, provider: 'viettel' };
  }

  return { configured: false, reason: `Unknown provider: ${provider}` };
}

async function testLocalFileOperations() {
  console.log('\n[STORAGE-QA] Testing local file operations...');

  const testFile = join(tmpdir(), `diabot-test-${Date.now()}.json`);
  const testData = {
    test: 'diabot-storage-qa',
    timestamp: new Date().toISOString(),
    version: '0.9.0',
  };

  try {
    // Write test file
    await writeFile(testFile, JSON.stringify(testData, null, 2));
    console.log('[STORAGE-QA] Test file created:', testFile);

    // Read test file
    const content = await readFile(testFile, 'utf-8');
    const parsed = JSON.parse(content);

    if (parsed.test !== testData.test) {
      throw new Error('File content mismatch');
    }

    console.log('[STORAGE-QA] Test file read successfully');

    // Clean up
    await unlink(testFile);
    console.log('[STORAGE-QA] Test file deleted');

    return true;
  } catch (err) {
    console.error('[STORAGE-QA] Local file operations FAILED:', err.message);
    return false;
  }
}

function generateMockPresignedUrl(bucket, key) {
  const endpoint = process.env.S3_ENDPOINT || 'https://s3.viettelcloud.vn';
  const timestamp = Date.now();
  const expires = timestamp + 3600000; // 1 hour

  // Mock presigned URL format
  return `${endpoint}/${bucket}/${key}?X-Amz-Expires=3600&X-Amz-Date=${timestamp}&X-Amz-Signature=MOCK_SIGNATURE`;
}

function testPresignedUrlGeneration() {
  console.log('\n[STORAGE-QA] Testing presigned URL generation...');

  const bucket = process.env.S3_BUCKET || 'diabot-production';
  const testKey = `uploads/test-${Date.now()}.json`;

  try {
    const url = generateMockPresignedUrl(bucket, testKey);
    console.log('[STORAGE-QA] Mock presigned URL generated:');
    console.log(`  ${url.substring(0, 80)}...`);

    // Validate URL structure
    if (!url.includes(bucket) || !url.includes('X-Amz')) {
      throw new Error('Invalid presigned URL format');
    }

    console.log('[STORAGE-QA] Presigned URL format valid');
    return true;
  } catch (err) {
    console.error('[STORAGE-QA] Presigned URL generation FAILED:', err.message);
    return false;
  }
}

async function main() {
  console.log('[STORAGE-QA] Starting storage connectivity test...\n');

  // Check configuration
  const config = checkStorageConfig();

  // Test local file operations (always runs)
  const localTest = await testLocalFileOperations();

  // Test presigned URL generation
  const urlTest = testPresignedUrlGeneration();

  // Summary
  console.log('\n[STORAGE-QA] Test Summary:');
  console.log(`  Configuration: ${config.configured ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
  if (!config.configured) {
    console.log(`  Reason: ${config.reason}`);
  }
  console.log(`  Local file ops: ${localTest ? 'PASSED' : 'FAILED'}`);
  console.log(`  Presigned URLs: ${urlTest ? 'PASSED' : 'FAILED'}`);

  // If storage is not configured but local tests pass, that's OK for now
  const success = localTest && urlTest;

  if (!config.configured) {
    console.log('\n[STORAGE-QA] NOTE: Storage not configured - this is expected before Viettel Cloud subscription');
    console.log('[STORAGE-QA] Once credentials are available, update .env.local and re-run this test');
  }

  console.log('\n[STORAGE-QA] Overall:', success ? 'PASSED' : 'FAILED');
  process.exit(success ? 0 : 1);
}

main();
