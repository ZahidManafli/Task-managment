# Firebase Setup Documentation

This document provides step-by-step instructions for setting up Firebase for the Task Management application.

## Table of Contents

1. [Firebase Project Setup](#firebase-project-setup)
2. [Authentication Configuration](#authentication-configuration)
3. [Firestore Database Setup](#firestore-database-setup)
4. [Storage Setup](#storage-setup)
5. [Security Rules](#security-rules)
6. [Environment Variables](#environment-variables)
7. [Integration Steps](#integration-steps)

---

## Firebase Project Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter your project name (e.g., "task-management-app")
4. (Optional) Enable Google Analytics
5. Click **"Create project"**
6. Wait for the project to be created, then click **"Continue"**

### Step 2: Register Web App

1. In the Firebase Console, click the **Web icon** (`</>`) to add a web app
2. Register your app with a nickname (e.g., "Task Management Web")
3. (Optional) Check "Also set up Firebase Hosting"
4. Click **"Register app"**
5. Copy the Firebase configuration object (you'll need this later)

---

## Authentication Configuration

### Step 1: Enable Email/Password Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Click on **"Email/Password"**
3. Enable the first toggle (Email/Password)
4. Click **"Save"**

### Step 2: Create Test Users (Optional)

1. Go to **Authentication** > **Users**
2. Click **"Add user"**
3. Enter email and password
4. Click **"Add user"**

**Note:** In production, users will register through your app. For this app, you mentioned there's no registration, so you'll need to manually create users in the Firebase Console.

---

## Firestore Database Setup

### Step 1: Create Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (we'll add security rules later)
4. Select a location for your database (choose the closest to your users)
5. Click **"Enable"**

### Step 2: Database Structure

The app uses three main collections:

#### Collection: `tasks`

Each document structure:
```javascript
{
  headline: string,
  description: string,
  priority: "Low" | "Medium" | "High",
  deadline: timestamp (optional),
  assignedTo: string (email address, optional),
  status: "To Do" | "In Progress" | "Review" | "Done",
  attachments: array of {
    url: string,
    name: string
  },
  comments: array of {
    userId: string,
    text: string,
    timestamp: timestamp
  },
  createdAt: timestamp,
  createdBy: string (user email)
}
```

#### Collection: `notes`

Each document structure:
```javascript
{
  headline: string,
  description: string,
  userId: string (Firebase Auth UID),
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### Collection: `documents`

Each document structure:
```javascript
{
  name: string,
  url: string (Firebase Storage URL),
  size: number (bytes),
  type: string (MIME type),
  uploadedAt: timestamp,
  userId: string (Firebase Auth UID)
}
```

### Step 3: Create Indexes (Optional but Recommended)

For better query performance, create composite indexes:

1. Go to **Firestore Database** > **Indexes**
2. Click **"Create Index"**
3. Collection: `tasks`
   - Fields: `createdBy` (Ascending), `createdAt` (Descending)
4. Collection: `notes`
   - Fields: `userId` (Ascending), `createdAt` (Descending)
5. Collection: `documents`
   - Fields: `userId` (Ascending), `uploadedAt` (Descending)

---

## Storage Setup

### Step 1: Enable Firebase Storage

1. In Firebase Console, go to **Storage**
2. Click **"Get started"**
3. Start in **"test mode"** (we'll add security rules later)
4. Choose a storage location (should match your Firestore location)
5. Click **"Done"**

### Step 2: Storage Structure

The app uses the following storage paths:

- **Task Images**: `tasks/{userId}/{timestamp}_{filename}`
- **Documents**: `documents/{userId}/{timestamp}_{filename}`

---

## Security Rules

### Firestore Security Rules

Replace the default rules in **Firestore Database** > **Rules** with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the resource
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Tasks collection
    match /tasks/{taskId} {
      // Allow read if user is authenticated
      allow read: if isAuthenticated();
      
      // Allow create if user is authenticated
      allow create: if isAuthenticated() 
        && request.resource.data.createdBy == request.auth.token.email;
      
      // Allow update/delete if user created the task
      allow update, delete: if isAuthenticated() 
        && resource.data.createdBy == request.auth.token.email;
    }
    
    // Notes collection
    match /notes/{noteId} {
      // Allow read if user owns the note
      allow read: if isOwner(resource.data.userId);
      
      // Allow create if user is authenticated and userId matches
      allow create: if isAuthenticated() 
        && request.resource.data.userId == request.auth.uid;
      
      // Allow update/delete if user owns the note
      allow update, delete: if isOwner(resource.data.userId);
    }
    
    // Documents collection
    match /documents/{documentId} {
      // Allow read if user owns the document
      allow read: if isOwner(resource.data.userId);
      
      // Allow create if user is authenticated and userId matches
      allow create: if isAuthenticated() 
        && request.resource.data.userId == request.auth.uid;
      
      // Allow delete if user owns the document
      allow delete: if isOwner(resource.data.userId);
    }
  }
}
```

### Storage Security Rules

Replace the default rules in **Storage** > **Rules** with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Task images
    match /tasks/{userId}/{allPaths=**} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }
    
    // Documents
    match /documents/{userId}/{allPaths=**} {
      allow read: if isAuthenticated() && request.auth.uid == userId;
      allow write: if isAuthenticated() && request.auth.uid == userId;
      allow delete: if isAuthenticated() && request.auth.uid == userId;
    }
  }
}
```

**Important:** Click **"Publish"** after updating the rules.

---

## Environment Variables

### Step 1: Create Environment File

Create a `.env` file in the root of your project:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
```

### Step 2: Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **"Your apps"** section
3. Find your web app and click the **</>** icon
4. Copy the configuration values

### Step 3: Update firebase.js

Update `src/services/firebase.js` with your configuration:

```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

**Note:** Make sure to add `.env` to your `.gitignore` file to keep your credentials secure.

---

## Integration Steps

### Step 1: Uncomment Firebase Code

1. Open `src/App.jsx`
2. Uncomment all Firebase import statements at the top
3. Uncomment all Firebase function calls in the component

### Step 2: Update Image Upload Logic

In `src/components/common/ImageUpload.jsx`, the component is already set up to work with Firebase. When you uncomment the Firebase code in `App.jsx`, the image upload will automatically work.

### Step 3: Test the Application

1. Start your development server: `npm run dev`
2. Try logging in with a user you created in Firebase Console
3. Create a task and verify it appears in Firestore
4. Upload an image and verify it appears in Storage
5. Create a note and verify it appears in Firestore
6. Upload a document and verify it appears in Storage

### Step 4: Verify Security Rules

1. Try accessing tasks/notes/documents from different user accounts
2. Verify that users can only see/modify their own data
3. Check that unauthenticated users cannot access any data

---

## Troubleshooting

### Common Issues

1. **"Firebase: Error (auth/user-not-found)"**
   - Solution: Make sure the user exists in Firebase Authentication

2. **"Missing or insufficient permissions"**
   - Solution: Check your Firestore/Storage security rules and ensure they're published

3. **"Storage permission denied"**
   - Solution: Verify Storage security rules allow the user to write to their path

4. **Images not uploading**
   - Solution: Check Storage rules and ensure the path structure matches

5. **Real-time updates not working**
   - Solution: Verify `onSnapshot` is properly uncommented and Firestore rules allow read access

### Testing Security Rules

Use the Firebase Console Rules Playground to test your security rules:
1. Go to **Firestore Database** > **Rules** > **Rules Playground**
2. Test different scenarios (authenticated/unauthenticated, owner/non-owner)

---

## Production Considerations

1. **Enable App Check** (optional but recommended)
   - Helps protect your backend resources from abuse

2. **Set up Custom Domain** (for hosting)
   - If using Firebase Hosting, configure a custom domain

3. **Monitor Usage**
   - Set up billing alerts in Firebase Console
   - Monitor Firestore reads/writes and Storage usage

4. **Backup Strategy**
   - Consider setting up automated backups for Firestore

5. **Performance Optimization**
   - Create composite indexes for complex queries
   - Optimize image sizes before upload
   - Use pagination for large lists

---

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Storage Documentation](https://firebase.google.com/docs/storage)
- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firebase Security Rules Guide](https://firebase.google.com/docs/rules)

---

## Support

If you encounter issues during setup, refer to:
- Firebase Console error messages
- Browser console for client-side errors
- Firebase documentation for specific features

Good luck with your Task Management application!
