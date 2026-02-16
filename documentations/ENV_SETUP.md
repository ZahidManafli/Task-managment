# Environment Variables Setup Guide

## Quick Fix for Firebase API Key Error

If you're getting the error: `Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)`

This means your Firebase configuration is not properly set up. Follow these steps:

## Step 1: Create `.env` File

Create a file named `.env` in the root of your project (same folder as `package.json`).

## Step 2: Get Your Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the **gear icon** (⚙️) next to "Project Overview"
4. Click **"Project settings"**
5. Scroll down to **"Your apps"** section
6. If you don't have a web app, click **"</>"** (Web icon) to add one
7. Copy the configuration values

## Step 3: Add to `.env` File

Open your `.env` file and add these lines (replace with YOUR actual values):

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyC...your-actual-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Supabase Configuration (for file storage)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 4: Restart Development Server

**IMPORTANT:** After creating or updating `.env` file, you MUST restart your development server:

1. Stop the server (Ctrl+C)
2. Run `npm run dev` again

Vite only reads environment variables when it starts, so changes won't take effect until you restart.

## Example `.env` File

Here's what your `.env` file should look like (with example values):

```env
VITE_FIREBASE_API_KEY=AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz
VITE_FIREBASE_AUTH_DOMAIN=my-task-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=my-task-app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890

VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNDU2Nzg5MCwiZXhwIjoxOTUwMTQzODkwfQ.abcdefghijklmnopqrstuvwxyz1234567890
```

## Common Mistakes

1. **Using quotes**: Don't use quotes around values in `.env` file
   - ❌ Wrong: `VITE_FIREBASE_API_KEY="AIzaSyC..."`
   - ✅ Correct: `VITE_FIREBASE_API_KEY=AIzaSyC...`

2. **Spaces around =**: Don't add spaces
   - ❌ Wrong: `VITE_FIREBASE_API_KEY = AIzaSyC...`
   - ✅ Correct: `VITE_FIREBASE_API_KEY=AIzaSyC...`

3. **Not restarting server**: Environment variables are only loaded when Vite starts
   - Always restart after changing `.env`

4. **Wrong variable names**: Must start with `VITE_` for Vite to expose them
   - ✅ Correct: `VITE_FIREBASE_API_KEY`
   - ❌ Wrong: `FIREBASE_API_KEY`

## Verify Configuration

After setting up, check the browser console. You should NOT see the API key error anymore.

If you still see errors:
1. Check that all values in `.env` are correct
2. Make sure `.env` is in the project root (same folder as `package.json`)
3. Restart the development server
4. Clear browser cache and reload

## Security Note

⚠️ **Never commit `.env` file to Git!** It's already in `.gitignore`, but double-check that your `.env` file is not tracked by Git.
