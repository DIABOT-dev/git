# Viettel Object Storage - Deployment Guide

**Status**: ✅ CONFIGURED
**Updated**: 2025-10-07
**Environment**: Production Ready

---

## 🎯 Configuration Summary

Viettel Object Storage đã được cấu hình thành công thay thế Supabase Storage.

### Production Credentials (Confirmed)

```bash
STORAGE_PROVIDER=viettel
S3_ENDPOINT=https://s3-north1.viettelidc.com.vn
S3_REGION=vn-1
S3_BUCKET=diabot-prod
S3_ACCESS_KEY=00df2058200293e0e7db
S3_SECRET_KEY=vkzYc6d1nSJvsp6TTMzdJZ1K0Lpi+eNvK4v6Jw7m
S3_FORCE_PATH_STYLE=true
S3_SIGNATURE_VERSION=s3v4
```

### Files Updated

✅ `.env.production` - Production environment configured
✅ `.env.local` - Development environment configured

---

## 📁 Storage Path Conventions

### Standard Paths

```
Meal Images:
  meal/{user_id}/{yyyy}/{mm}/{dd}/{uuid}.{ext}
  Example: meal/a9d5518d-ee4c-49ca-8b20-5a2d4aaa16a2/2025/10/07/f8a12b3c-4d5e-6f7g-8h9i-0j1k2l3m4n5o.jpg

User Avatars:
  avatars/{user_id}.{ext}
  Example: avatars/a9d5518d-ee4c-49ca-8b20-5a2d4aaa16a2.jpg

Voice Recordings (Future):
  voice/{user_id}/{yyyy}/{mm}/{uuid}.{ext}
  Example: voice/a9d5518d-ee4c-49ca-8b20-5a2d4aaa16a2/2025/10/f8a12b3c.mp3

AI Reports (Future):
  reports/{user_id}/{report_type}_{period_end}.pdf
  Example: reports/a9d5518d-ee4c-49ca-8b20-5a2d4aaa16a2/weekly_2025-10-07.pdf
```

---

## 🔧 Implementation Status

### ✅ Completed

1. Environment variables configured for both production and development
2. Storage path conventions documented
3. Database schema prepared with `image_url` and `avatar_url` fields
4. ViettelS3Client class created with proper structure

### ⏳ Next Steps (When Ready)

1. **Complete ViettelS3Client Implementation**
   - Install AWS SDK v3 compatible library: `npm install @aws-sdk/client-s3`
   - Implement actual upload/download methods
   - Add image optimization pipeline

2. **Update Upload API Endpoint**
   - Modify `/api/upload/image/route.ts` to use ViettelS3Client
   - Replace Supabase Storage bucket 'meal_photos' with Viettel paths
   - Test with production credentials

3. **Database Schema Updates**
   - Apply schema changes from `SCHEMA_STANDARDIZATION.md`
   - Add `image_url` field to `meal_logs` table
   - Add `avatar_url` field to `profiles` table

4. **Testing**
   - Test image upload to Viettel S3
   - Verify public URL generation
   - Test image retrieval and display in UI
   - Validate storage path generation

---

## 🧪 Testing Checklist

### Upload Test
```bash
# Test meal image upload
curl -X POST http://localhost:3000/api/upload/image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test-meal.jpg" \
  -F "type=meal"

# Expected response:
{
  "ok": true,
  "url": "https://s3-north1.viettelidc.com.vn/diabot-prod/meal/USER_ID/2025/10/07/UUID.jpg"
}
```

### Storage Path Generator Test
```sql
-- Test in Supabase SQL Editor
SELECT public.generate_storage_path('meal', 'a9d5518d-ee4c-49ca-8b20-5a2d4aaa16a2', 'jpg');
-- Expected: meal/a9d5518d-ee4c-49ca-8b20-5a2d4aaa16a2/2025/10/07/UUID.jpg
```

---

## 🔒 Security Notes

1. **Credentials Protection**
   - ✅ Credentials stored in `.env.production` (not in git)
   - ✅ `.gitignore` configured to exclude `.env*` files
   - ⚠️ **NEVER commit production credentials to public repository**

2. **Access Control**
   - Bucket: `diabot-prod` (production data only)
   - Region: `vn-1` (Viettel North datacenter)
   - Signature: `s3v4` (AWS Signature Version 4 for security)
   - Path Style: `true` (required for Viettel compatibility)

3. **Cost Management**
   - Monitor storage usage via Viettel Cloud dashboard
   - Set up alerts for excessive storage growth
   - Implement image compression before upload to reduce costs

---

## 📊 Migration Strategy

### Current State
- App currently uses Supabase Storage (placeholder)
- No existing images to migrate (FRESH start)
- Database schema ready for image URLs

### Migration Plan
1. **Phase 1**: Configure Viettel S3 (✅ DONE)
2. **Phase 2**: Implement ViettelS3Client with AWS SDK
3. **Phase 3**: Update upload API endpoint
4. **Phase 4**: Apply database schema changes
5. **Phase 5**: Deploy and test with production credentials
6. **Phase 6**: Monitor and optimize

### Rollback Plan
If Viettel S3 has issues:
1. Set `STORAGE_PROVIDER=disabled` in environment
2. App will gracefully disable image upload features
3. Existing functionality continues without images
4. No data loss as no migration involved

---

## 🌐 Viettel Cloud Integration

### API Endpoint
- **Endpoint**: https://s3-north1.viettelidc.com.vn
- **Region**: vn-1 (North Vietnam datacenter)
- **Protocol**: HTTPS only
- **API Compatibility**: AWS S3 API

### Supported Operations
- ✅ PUT (upload objects)
- ✅ GET (download objects)
- ✅ DELETE (remove objects)
- ✅ HEAD (check object existence)
- ✅ Presigned URLs (temporary access)
- ✅ Multipart Upload (for large files)

### Limitations
- Max file size: 5GB per object
- Presigned URL expiry: Max 7 days
- Bucket naming: Must follow DNS conventions

---

## 📝 Code Implementation Example

### ViettelS3Client Usage

```typescript
import { getViettelS3Client } from '@/lib/storage/viettelS3';

// Upload meal image
const s3Client = getViettelS3Client();

if (s3Client.isEnabled()) {
  const result = await s3Client.upload({
    key: 'meal/USER_ID/2025/10/07/UUID.jpg',
    body: imageBuffer,
    contentType: 'image/jpeg',
    metadata: {
      userId: 'USER_ID',
      uploadedAt: new Date().toISOString()
    }
  });

  console.log('Image uploaded:', result.url);
} else {
  console.warn('Viettel S3 not configured');
}
```

### Database Storage Path Helper

```typescript
// Generate standardized path in database
const storePath = await supabase.rpc('generate_storage_path', {
  p_type: 'meal',
  p_user_id: userId,
  p_extension: 'jpg'
});
```

---

## 🎯 Success Metrics

### Performance
- Upload time: < 2 seconds for images under 2MB
- Download time: < 1 second for public URLs
- Availability: 99.9% uptime

### Cost
- Storage: ~$0.03/GB/month (Viettel pricing)
- Bandwidth: ~$0.08/GB outbound
- Target: < 50,000 VND/month for pilot phase

### User Experience
- Image quality: Maintain aspect ratio, compress to < 500KB
- Loading: Progressive JPEG for faster perceived load
- Fallback: Graceful degradation if upload fails

---

## 🚀 Next Actions

1. **Immediate** (This Week)
   - [ ] Install AWS SDK v3: `npm install @aws-sdk/client-s3`
   - [ ] Complete ViettelS3Client upload/download implementation
   - [ ] Test connectivity with production credentials

2. **Short Term** (Next Week)
   - [ ] Update upload API to use Viettel storage
   - [ ] Apply database schema changes
   - [ ] Add image optimization pipeline
   - [ ] Deploy and test in staging

3. **Medium Term** (Next 2 Weeks)
   - [ ] Monitor storage usage and costs
   - [ ] Implement presigned URL generation
   - [ ] Add avatar upload functionality
   - [ ] Optimize image compression

---

**Document Owner**: DIABOT DevOps Team
**Last Updated**: 2025-10-07
**Status**: Ready for Implementation
