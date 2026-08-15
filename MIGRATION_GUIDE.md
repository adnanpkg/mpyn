# User Table Migration

## Overview
This migration consolidates the `users` table by moving all users to their respective profile tables:
- Users with `role='creator'` → `creatorProfiles` table
- Users with `role='business'` → `businessProfiles` table

## Why?
The new design separates user metadata (email, sessions, ratings) from profile data:
- **users** table: Authentication, sessions, ratings (core data)
- **creatorProfiles** table: Creator-specific info (bio, Instagram, gig charge, categories)
- **businessProfiles** table: Business-specific info (name, category, description)

## Migration Steps

### 1. Run the Migration (via Convex Console)

Go to **https://dashboard.convex.dev → your project → Data → Run function**

Click on `users.migrateUsers()` and execute it.

This will:
- ✅ Create creatorProfile entries for all creators
- ✅ Create businessProfile entries for all businesses
- ✅ Skip users without a role (incomplete signups)
- ✅ Skip users already migrated

Expected output:
```
{
  "success": true,
  "migrated": {
    "creators": X,
    "businesses": Y,
    "total": X + Y
  }
}
```

### 2. Verify in Convex Dashboard

**Before Migration:**
- ✅ users table: Full of users
- ❌ creatorProfiles table: Empty
- ❌ businessProfiles table: Empty

**After Migration:**
- ✅ users table: Still there (reference)
- ✅ creatorProfiles table: Populated with creators
- ✅ businessProfiles table: Populated with businesses

### 3. Clear Old User Data (Optional - After Verification)

Once verified, you can optionally delete the redundant user entries (keep only: email, role for auth):

```javascript
// Delete all user records (ONLY after verification!)
// This is a destructive operation - backup first!
```

**Warning:** Don't delete until you verify everything works!

## Rollback

If something goes wrong, the migration is safe to re-run:
- It skips users already migrated (checks by userId)
- Won't create duplicates
- Non-destructive operation
