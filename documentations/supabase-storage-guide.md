# Supabase Storage Setup Guide

This guide will help you set up Supabase Storage for file uploads in your Task Management application. Supabase Storage is used for:
- **Task Image Attachments**: Images attached to tasks
- **Documents**: Important documents uploaded by users

## Table of Contents

1. [Why Supabase Storage?](#why-supabase-storage)
2. [Supabase Project Setup](#supabase-project-setup)
3. [Storage Buckets Configuration](#storage-buckets-configuration)
4. [Storage Policies (Security Rules)](#storage-policies-security-rules)
5. [Environment Variables](#environment-variables)
6. [Integration Steps](#integration-steps)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)
9. [Pricing Information](#pricing-information)

---

## Why Supabase Storage?

Supabase Storage offers:
- **Free Tier**: 1 GB of storage and 2 GB bandwidth per month
- **Affordable Pricing**: $0.021 per GB/month after free tier
- **Simple API**: Easy to integrate with React applications
- **Built-in CDN**: Fast file delivery worldwide
- **Row Level Security**: Fine-grained access control

---

## Supabase Project Setup

### Step 1: Create Supabase Account

1. Go to [Supabase](https://supabase.com/)
2. Click **"Start your project"** or **"Sign up"**
3. Sign up with GitHub, Google, or email
4. Verify your email if required

### Step 2: Create a New Project

1. Click **"New Project"** in the dashboard
2. Fill in the project details:
   - **Name**: `task-management-app` (or your preferred name)
   - **Database Password**: Create a strong password (save it securely)
   - **Region**: Choose the region closest to your users
   - **Pricing Plan**: Select **Free** (or Pro if needed)
3. Click **"Create new project"**
4. Wait for the project to be provisioned (2-3 minutes)

### Step 3: Get API Credentials

1. In your project dashboard, go to **Settings** (gear icon) > **API**
2. You'll need:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
3. Copy these values - you'll need them for environment variables

---

## Storage Buckets Configuration

### Step 1: Enable Storage

1. In your Supabase dashboard, go to **Storage** in the left sidebar
2. Storage is automatically enabled - no additional setup needed

### Step 2: Create Storage Buckets

You need to create two buckets:

#### Bucket 1: `task-images`

1. Click **"New bucket"** in Storage
2. Enter bucket name: `task-images`
3. **Public bucket**: ✅ **Enable** (so images can be accessed via URL)
4. **File size limit**: 5 MB (or your preferred limit)
5. **Allowed MIME types**: 
   - `image/jpeg`
   - `image/png`
   - `image/gif`
   - `image/webp`
6. Click **"Create bucket"**

#### Bucket 2: `documents`

1. Click **"New bucket"** again
2. Enter bucket name: `documents`
3. **Public bucket**: ✅ **Enable** (so documents can be downloaded)
4. **File size limit**: 50 MB (or your preferred limit)
5. **Allowed MIME types**: Leave empty to allow all file types, or specify:
   - `application/pdf`
   - `application/msword`
   - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
   - `application/vnd.ms-excel`
   - `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
   - `text/plain`
6. Click **"Create bucket"**

---

## Storage Policies (Security Rules)

Storage policies control who can upload, read, and delete files. We'll set up policies so users can only access their own files.

### Step 1: Access Storage Policies

1. Go to **Storage** > Click on a bucket (e.g., `task-images`)
2. Click on the **"Policies"** tab
3. You'll see default policies (if any)

### Step 2: Create Policies for `task-images` Bucket

**IMPORTANT:** Since we're using Firebase Auth (not Supabase Auth), we need to use **public policies** that allow anyone to upload/read/delete files. The folder structure (`{userId}/`) provides basic organization.

#### Policy 1: Allow Public Uploads

1. Click **"New Policy"**
2. Select **"For full customization"**
3. Policy name: `Allow public uploads to task-images`
4. Allowed operation: ✅ **INSERT**
5. Policy definition (SQL):
```sql
bucket_id = 'task-images'::text
```

6. Click **"Review"** then **"Save policy"**

#### Policy 2: Allow Public Reads

1. Click **"New Policy"** again
2. Policy name: `Allow public reads from task-images`
3. Allowed operation: ✅ **SELECT**
4. Policy definition:
```sql
bucket_id = 'task-images'::text
```

5. Click **"Review"** then **"Save policy"**

#### Policy 3: Allow Public Deletes

1. Click **"New Policy"** again
2. Policy name: `Allow public deletes from task-images`
3. Allowed operation: ✅ **DELETE**
4. Policy definition:
```sql
bucket_id = 'task-images'::text
```

5. Click **"Review"** then **"Save policy"**

### Step 3: Create Policies for `documents` Bucket

Repeat the same three policies for the `documents` bucket:

#### Policy 1: Allow Public Uploads to Documents
- Policy name: `Allow public uploads to documents`
- Allowed operation: ✅ **INSERT**
- Policy definition: `bucket_id = 'documents'::text`

#### Policy 2: Allow Public Reads from Documents
- Policy name: `Allow public reads from documents`
- Allowed operation: ✅ **SELECT**
- Policy definition: `bucket_id = 'documents'::text`

#### Policy 3: Allow Public Deletes from Documents
- Policy name: `Allow public deletes from documents`
- Allowed operation: ✅ **DELETE**
- Policy definition: `bucket_id = 'documents'::text`

### Alternative: Single Policy Per Bucket (Simpler)

If you prefer, you can create one policy per bucket with all operations:

**For `task-images` bucket:**
1. Policy name: `Full public access to task-images`
2. Allowed operations: ✅ **SELECT**, ✅ **INSERT**, ✅ **DELETE**
3. Policy definition:
```sql
bucket_id = 'task-images'::text
```

**For `documents` bucket:**
1. Policy name: `Full public access to documents`
2. Allowed operations: ✅ **SELECT**, ✅ **INSERT**, ✅ **DELETE**
3. Policy definition:
```sql
bucket_id = 'documents'::text
```

**Security Note:** Since we're using Firebase Auth, Supabase doesn't know who the user is. The folder structure (`{userId}/`) provides basic organization, but anyone with the URL can access files. For production, consider:
- Using Supabase Auth instead of Firebase Auth
- Implementing server-side file access control
- Using signed URLs with expiration

---

## Environment Variables

### Step 1: Create `.env` File

Create a `.env` file in your project root (if it doesn't exist):

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Firebase Configuration (for Auth and Firestore)
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
```

### Step 2: Get Supabase Values

1. Go to **Settings** > **API** in Supabase dashboard
2. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

### Step 3: Update `.gitignore`

Make sure `.env` is in your `.gitignore`:

```
.env
.env.local
.env.production
```

---

## Integration Steps

### Step 1: Verify Supabase Service File

The `src/services/supabase.js` file is already set up. Just make sure your environment variables are configured.

### Step 2: Update App.jsx (Already Done)

The `App.jsx` file has been updated to use Supabase Storage for:
- Task image uploads
- Document uploads
- File deletions

### Step 3: Test the Integration

1. Start your development server: `npm run dev`
2. Log in to your app
3. Create a task and attach an image
4. Upload a document
5. Verify files appear in Supabase Storage dashboard

---

## Testing

### Test 1: Upload Task Image

1. Create a new task
2. Attach an image (JPEG, PNG, etc.)
3. Submit the task
4. Check Supabase Storage > `task-images` bucket
5. Verify the file is in `{userId}/` folder

### Test 2: Upload Document

1. Go to Documents tab
2. Click "Upload Document"
3. Select a file
4. Check Supabase Storage > `documents` bucket
5. Verify the file is uploaded

### Test 3: Delete File

1. Delete a task with images
2. Verify images are removed from Storage
3. Delete a document
4. Verify document is removed from Storage

### Test 4: Access Control

1. Log in as User A
2. Upload a file
3. Log in as User B
4. Try to access User A's files (should fail if policies are correct)

---

## Troubleshooting

### Issue: "Bucket not found"

**Solution:**
- Verify bucket names match exactly: `task-images` and `documents`
- Check bucket exists in Supabase Storage dashboard

### Issue: "new row violates row-level security policy"

**Solution:**
- Check Storage policies are created correctly
- Verify policy SQL syntax is correct
- Ensure user is authenticated (has `auth.uid()`)

### Issue: "File upload fails"

**Solution:**
- Check file size doesn't exceed bucket limit
- Verify MIME type is allowed
- Check browser console for detailed error

### Issue: "Cannot read file URL"

**Solution:**
- Ensure bucket is set to **Public**
- Or update policy to allow SELECT operation
- Verify `getPublicUrl()` is used correctly

### Issue: "CORS error"

**Solution:**
- Supabase handles CORS automatically
- If issues persist, check Supabase project settings
- Verify you're using the correct Supabase URL

### Issue: "Authentication required"

**Solution:**
- Ensure user is logged in (Firebase Auth)
- For Supabase Storage, you may need to set up Supabase Auth or use service role key (not recommended for client-side)
- Alternative: Use public buckets with folder-based access control

---

## Pricing Information

### Free Tier (Hobby Plan)

- **Storage**: 1 GB
- **Bandwidth**: 2 GB/month
- **File upload limit**: 50 MB per file
- **Perfect for**: Development and small projects

### Pro Plan ($25/month)

- **Storage**: 100 GB
- **Bandwidth**: 200 GB/month
- **File upload limit**: 50 MB per file
- **Additional storage**: $0.021 per GB/month
- **Additional bandwidth**: $0.09 per GB

### Enterprise Plan

- Custom pricing
- Higher limits
- Dedicated support

### Cost Estimation Example

For a small team (10 users, 100 tasks/month):
- Average image size: 500 KB
- Average document size: 2 MB
- Monthly storage: ~250 MB
- Monthly bandwidth: ~500 MB
- **Cost**: $0 (within free tier)

For larger usage:
- 1000 tasks/month with images
- 500 documents/month
- Monthly storage: ~2 GB
- Monthly bandwidth: ~4 GB
- **Cost**: ~$0.04/month (2 GB storage × $0.021)

---

## Best Practices

1. **Optimize Images**: Compress images before upload to save storage
2. **Set File Limits**: Configure reasonable file size limits
3. **Use Folders**: Organize files by user ID for better access control
4. **Clean Up**: Delete unused files to save storage
5. **Monitor Usage**: Check Supabase dashboard regularly for usage
6. **Backup Important Files**: Consider backing up critical documents

---

## Additional Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase Storage API Reference](https://supabase.com/docs/reference/javascript/storage)
- [Supabase Storage Policies Guide](https://supabase.com/docs/guides/storage/security/access-control)
- [Supabase Pricing](https://supabase.com/pricing)
- [Supabase Discord Community](https://discord.supabase.com/)

---

## Quick Reference

### Bucket Names
- `task-images` - For task attachments
- `documents` - For user documents

### File Path Structure
- Task images: `{userId}/{timestamp}_{filename}`
- Documents: `{userId}/{timestamp}_{filename}`

### Environment Variables Required
```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Storage Service Functions
- `uploadFile(bucket, file, path)` - Upload a file
- `deleteFile(bucket, path)` - Delete a file
- `getPublicUrl(bucket, path)` - Get public URL

---

## Support

If you encounter issues:
1. Check Supabase dashboard for error logs
2. Review browser console for client-side errors
3. Verify environment variables are set correctly
4. Test policies in Supabase dashboard
5. Check Supabase status page: [status.supabase.com](https://status.supabase.com)

Good luck with your Task Management application!
