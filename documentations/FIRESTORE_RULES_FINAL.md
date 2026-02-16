# Final Firestore Security Rules - Shared Workspace

These rules allow all authenticated users to collaborate on tasks, notes, and documents.

## Updated Rules

Copy and paste these rules into your Firebase Console > Firestore Database > Rules:

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
    
    // Tasks collection - Shared workspace
    match /tasks/{taskId} {
      // Allow all authenticated users to read any task
      allow read: if isAuthenticated();
      
      // Allow create if user is authenticated
      allow create: if isAuthenticated() 
        && request.resource.data.createdBy == request.auth.token.email;
      
      // Allow all authenticated users to update tasks (for status changes, comments, etc.)
      allow update: if isAuthenticated();
      
      // Allow delete only if user created the task
      allow delete: if isAuthenticated() 
        && resource.data.createdBy == request.auth.token.email;
    }
    
    // Notes collection - Shared workspace
    match /notes/{noteId} {
      // Allow all authenticated users to read any note
      allow read: if isAuthenticated();
      
      // Allow create if user is authenticated and userId matches
      allow create: if isAuthenticated() 
        && request.resource.data.userId == request.auth.uid;
      
      // Allow all authenticated users to update any note
      allow update: if isAuthenticated();
      
      // Allow all authenticated users to delete any note
      allow delete: if isAuthenticated();
    }
    
    // Documents collection - Shared workspace
    match /documents/{documentId} {
      // Allow all authenticated users to read any document
      allow read: if isAuthenticated();
      
      // Allow create if user is authenticated and userId matches
      allow create: if isAuthenticated() 
        && request.resource.data.userId == request.auth.uid;
      
      // Allow all authenticated users to delete any document
      allow delete: if isAuthenticated();
    }
  }
}
```

## What Changed from Previous Rules

### Tasks Collection
- ✅ **Read**: All authenticated users (unchanged)
- ✅ **Create**: Only creator (unchanged)
- ✅ **Update**: Changed from owner-only to **all authenticated users** (now anyone can change status, add comments)
- ✅ **Delete**: Only creator (unchanged - for safety)

### Notes Collection
- ✅ **Read**: All authenticated users (unchanged)
- ✅ **Create**: Only creator (unchanged)
- ✅ **Update**: Changed from owner-only to **all authenticated users**
- ✅ **Delete**: Changed from owner-only to **all authenticated users**

### Documents Collection
- ✅ **Read**: All authenticated users (unchanged)
- ✅ **Create**: Only creator (unchanged)
- ✅ **Delete**: Changed from owner-only to **all authenticated users**

## How to Apply

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database** > **Rules** tab
4. Replace the existing rules with the rules above
5. Click **"Publish"** button

## Security Model

This configuration creates a **shared workspace** where:
- ✅ All authenticated users can view all content
- ✅ All authenticated users can update tasks (change status, add comments)
- ✅ All authenticated users can update/delete notes
- ✅ All authenticated users can delete documents
- ✅ Only creators can create new items (prevents spam)
- ✅ Only task creators can delete tasks (prevents accidental deletion)

This is suitable for a team workspace where collaboration is desired.

## Alternative: More Restrictive Rules

If you want more control, you can restrict delete operations:

```javascript
// Only allow delete if user is the owner
allow delete: if isOwner(resource.data.userId);
```

But for a collaborative workspace, the current rules work well.
