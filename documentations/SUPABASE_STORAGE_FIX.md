# Quick Fix: Supabase Storage RLS Policy Error

## Problem
You're getting this error:
```
StorageApiError: new row violates row-level security policy
```

This happens because Supabase Storage has Row Level Security (RLS) policies that require authentication, but we're using Firebase Auth (not Supabase Auth), so Supabase doesn't know who the user is.

## Solution: Set Up Public Storage Policies

Since we're using Firebase Auth, we need to make the storage buckets **public** with policies that allow anyone to upload/read/delete files.

### Step 1: Go to Storage Policies

1. Open [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **Storage** in the left sidebar
4. Click on the **`task-images`** bucket
5. Click on the **"Policies"** tab

### Step 2: Create Policy for `task-images` Bucket

1. Click **"New Policy"**
2. Select **"For full customization"** (or use template if available)
3. Fill in:
   - **Policy name**: `Public access to task-images`
   - **Allowed operation**: Check all three: ✅ **SELECT** (read), ✅ **INSERT** (upload), ✅ **DELETE** (delete)
   - **Policy definition**: 
     ```sql
     bucket_id = 'task-images'::text
     ```
4. Click **"Review"** then **"Save policy"**

### Step 3: Create Policy for `documents` Bucket

1. Go back to **Storage**
2. Click on the **`documents`** bucket
3. Click on the **"Policies"** tab
4. Click **"New Policy"**
5. Fill in:
   - **Policy name**: `Public access to documents`
   - **Allowed operation**: Check all three: ✅ **SELECT**, ✅ **INSERT**, ✅ **DELETE**
   - **Policy definition**: 
     ```sql
     bucket_id = 'documents'::text
     ```
6. Click **"Review"** then **"Save policy"**

### Step 4: Verify Buckets Are Public

Make sure both buckets are set to **Public**:

1. Go to **Storage** > Click on a bucket
2. Check the **"Public bucket"** toggle - it should be **ON** ✅
3. If it's off, turn it on and save

## Alternative: Using Supabase SQL Editor

If the UI doesn't work, you can use the SQL Editor:

1. Go to **SQL Editor** in Supabase Dashboard
2. Run these SQL commands:

```sql
-- Policy for task-images bucket
CREATE POLICY "Public access to task-images"
ON storage.objects
FOR ALL
USING (bucket_id = 'task-images')
WITH CHECK (bucket_id = 'task-images');

-- Policy for documents bucket
CREATE POLICY "Public access to documents"
ON storage.objects
FOR ALL
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');
```

## Verify It Works

After setting up the policies:

1. Try uploading a document again
2. The error should be gone
3. Files should upload successfully

## Security Considerations

⚠️ **Important:** With public policies, anyone with the file URL can access it. However:
- Files are organized by user ID in folders (`{userId}/filename`)
- URLs are not easily guessable
- For production, consider:
  - Using Supabase Auth instead of Firebase Auth
  - Implementing server-side access control
  - Using signed URLs with expiration

## Troubleshooting

### Still Getting Errors?

1. **Check bucket names**: Make sure they're exactly `task-images` and `documents` (case-sensitive)
2. **Check bucket is public**: Toggle should be ON
3. **Clear browser cache**: Sometimes policies take a moment to propagate
4. **Check policy syntax**: Make sure there are no typos in the SQL
5. **Restart dev server**: After changing policies, restart your app

### Policy Not Saving?

- Make sure you're using the correct SQL syntax
- Try using the SQL Editor instead of the UI
- Check Supabase status page for any service issues

## Need More Security?

If you need better security, you have these options:

1. **Switch to Supabase Auth**: Use Supabase for both auth and storage
2. **Server-side uploads**: Upload files through your backend
3. **Signed URLs**: Generate temporary signed URLs for file access
4. **Custom policies**: Create more complex policies based on file paths

For now, the public policies will work for development and small teams.
