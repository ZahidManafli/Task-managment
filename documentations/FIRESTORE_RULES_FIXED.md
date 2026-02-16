# Updated Firestore Security Rules

Since all users can now see all tasks, notes, and documents, you need to update your Firestore security rules.

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
    
    // Tasks collection - All authenticated users can read all tasks
    match /tasks/{taskId} {
      // Allow all authenticated users to read any task
      allow read: if isAuthenticated();
      
      // Allow create if user is authenticated
      allow create: if isAuthenticated() 
        && request.resource.data.createdBy == request.auth.token.email;
      
      // Allow update/delete if user created the task
      allow update, delete: if isAuthenticated() 
        && resource.data.createdBy == request.auth.token.email;
    }
    
    // Notes collection - All authenticated users can read all notes
    match /notes/{noteId} {
      // Allow all authenticated users to read any note
      allow read: if isAuthenticated();
      
      // Allow create if user is authenticated and userId matches
      allow create: if isAuthenticated() 
        && request.resource.data.userId == request.auth.uid;
      
      // Allow update/delete if user owns the note
      allow update, delete: if isOwner(resource.data.userId);
    }
    
    // Documents collection - All authenticated users can read all documents
    match /documents/{documentId} {
      // Allow all authenticated users to read any document
      allow read: if isAuthenticated();
      
      // Allow create if user is authenticated and userId matches
      allow create: if isAuthenticated() 
        && request.resource.data.userId == request.auth.uid;
      
      // Allow delete if user owns the document
      allow delete: if isOwner(resource.data.userId);
    }
  }
}
```

## What Changed

### Tasks Collection
- ✅ **Read**: Changed from owner-only to all authenticated users
- ✅ **Create/Update/Delete**: Still restricted to owner (unchanged)

### Notes Collection
- ✅ **Read**: Changed from `isOwner(resource.data.userId)` to `isAuthenticated()` - now all authenticated users can read
- ✅ **Create/Update/Delete**: Still restricted to owner (unchanged)

### Documents Collection
- ✅ **Read**: Changed from `isOwner(resource.data.userId)` to `isAuthenticated()` - now all authenticated users can read
- ✅ **Create/Delete**: Still restricted to owner (unchanged)

## How to Apply

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database** > **Rules** tab
4. Replace the existing rules with the rules above
5. Click **"Publish"** button

## Security Notes

- ✅ All users must be authenticated to read/write
- ✅ Only the creator can create/update/delete their own items
- ✅ All authenticated users can view all tasks, notes, and documents
- ⚠️ This is suitable for a team workspace where sharing is desired

If you need more restrictive access later, you can modify the rules accordingly.
