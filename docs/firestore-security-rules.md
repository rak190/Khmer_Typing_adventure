# Firestore Security Rules

Use owner-only rules for the current Firebase economy schema. These rules keep each signed-in student inside their own `users/{uid}` document and subcollections, with no public or unauthenticated writes.

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() {
      return request.auth != null;
    }

    function ownsUserDoc(uid) {
      return signedIn() && request.auth.uid == uid;
    }

    match /users/{uid} {
      allow read, create, update, delete: if ownsUserDoc(uid);

      match /{document=**} {
        allow read, create, update, delete: if ownsUserDoc(uid);
      }
    }

    match /students/{uid} {
      allow read, create, update, delete: if ownsUserDoc(uid);

      match /{document=**} {
        allow read, create, update, delete: if ownsUserDoc(uid);
      }
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

TODO: add stricter validation for numeric economy fields before production, especially non-negative coins/gems/hearts, max heart limits, allowed inventory item IDs, and claim document IDs.
