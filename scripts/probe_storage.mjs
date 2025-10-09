#!/usr/bin/env node

import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';

const proxyBase = process.env.DIA_BRAIN_STORAGE_PROXY_URL;
const endpoint = process.env.VTS_ENDPOINT ?? '';
const provider = 'viettel';
const proxyName = 'dia-brain';
const targetBucket = process.env.VTS_PRIVATE_BUCKET || process.env.VTS_PUBLIC_BUCKET || 'private';
const requestedSizeMb = Number(process.env.STORAGE_PROBE_SIZE_MB ?? '10');
const sizeMb = Number.isFinite(requestedSizeMb) && requestedSizeMb >= 8 && requestedSizeMb <= 32 ? requestedSizeMb : 10;
const objectKey = `probe/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.bin`;
const useMock = process.env.STORAGE_PROBE_MOCK === '1' || !proxyBase;

if (!proxyBase && !useMock) {
  console.error('Missing DIA_BRAIN_STORAGE_PROXY_URL. Set STORAGE_PROBE_MOCK=1 để chạy mô phỏng.');
  process.exit(1);
}

const mockStore = new Map();

function buildUrl(bucket, key) {
  const trimmed = (proxyBase ?? '').replace(/\/$/, '');
  const encodedBucket = encodeURIComponent(bucket);
  const encodedKey = key
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');
  return `${trimmed}/storage/${encodedBucket}/${encodedKey}`;
}

function buildHeaders(contentType) {
  const headers = new Headers({
    'x-dia-storage-provider': provider,
    'x-dia-storage-proxy': proxyName,
  });
  if (endpoint) headers.set('x-dia-storage-endpoint', endpoint);
  if (contentType) headers.set('content-type', contentType);
  return headers;
}

async function toUint8Array(body) {
  if (!body) return new Uint8Array();
  if (body instanceof Uint8Array) return body;
  if (body instanceof ArrayBuffer) return new Uint8Array(body);
  if (typeof body === 'string') return new TextEncoder().encode(body);
  if (typeof Blob !== 'undefined' && body instanceof Blob) {
    return new Uint8Array(await body.arrayBuffer());
  }
  if (body instanceof Response) {
    return new Uint8Array(await body.arrayBuffer());
  }
  if (body?.arrayBuffer) {
    const arrayBuffer = await body.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  }
  throw new Error('Unsupported body type for mock probe');
}

async function proxyRequest({ method, bucket, key, body, contentType }) {
  if (useMock) {
    if (method === 'PUT') {
      const buffer = await toUint8Array(body);
      mockStore.set(`${bucket}/${key}`, buffer);
      return new Response(null, { status: 200, statusText: 'OK (mock)' });
    }
    if (method === 'GET') {
      const buffer = mockStore.get(`${bucket}/${key}`);
      if (!buffer) {
        return new Response('Not Found (mock)', { status: 404, statusText: 'Not Found' });
      }
      return new Response(buffer, { status: 200, statusText: 'OK (mock)' });
    }
    if (method === 'DELETE') {
      mockStore.delete(`${bucket}/${key}`);
      return new Response(null, { status: 200, statusText: 'OK (mock)' });
    }
  }

  const url = buildUrl(bucket, key);
  const headers = buildHeaders(contentType);
  const response = await fetch(url, { method, headers, body });
  return response;
}

function allocatePayload(bytes) {
  const array = new Uint8Array(bytes);
  for (let i = 0; i < array.length; i += 1) {
    array[i] = Math.floor(Math.random() * 256);
  }
  return array;
}

async function main() {
  const start = performance.now();
  const payloadBytes = Math.round(sizeMb * 1024 * 1024);
  const payload = allocatePayload(payloadBytes);

  console.log(`→ Uploading ${payloadBytes} bytes to bucket=${targetBucket} key=${objectKey}`);
  const putResponse = await proxyRequest({
    method: 'PUT',
    bucket: targetBucket,
    key: objectKey,
    body: payload,
    contentType: 'application/octet-stream',
  });

  console.log(`PUT status: ${putResponse.status} ${putResponse.statusText}`);
  if (!putResponse.ok) {
    const detail = await putResponse.text().catch(() => '');
    throw new Error(`PUT failed with status ${putResponse.status}: ${detail}`);
  }

  const getResponse = await proxyRequest({ method: 'GET', bucket: targetBucket, key: objectKey });
  console.log(`GET status: ${getResponse.status} ${getResponse.statusText}`);
  if (!getResponse.ok) {
    const detail = await getResponse.text().catch(() => '');
    throw new Error(`GET failed with status ${getResponse.status}: ${detail}`);
  }

  const received = new Uint8Array(await getResponse.arrayBuffer());
  console.log(`GET length: ${received.length} bytes`);

  const durationMs = performance.now() - start;
  console.log(`Elapsed: ${durationMs.toFixed(2)} ms (mode=${useMock ? 'mock' : 'live'})`);
}

main().catch((error) => {
  console.error('Storage probe failed:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
