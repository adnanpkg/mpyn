#!/usr/bin/env node

/**
 * Run this script to migrate all users from the users table to creatorProfiles/businessProfiles
 * 
 * Usage:
 *   npx node scripts/migrate-users.js
 * 
 * This will:
 * 1. Move all users with role='creator' to creatorProfiles table
 * 2. Move all users with role='business' to businessProfiles table
 * 3. Keep the users table for reference (don't delete yet)
 */

const { ConvexClient } = require('convex/browser');
const { api } = require('../convex/_generated/api.js');

async function migrate() {
  try {
    console.log('🔄 Starting user migration...');
    
    const convex = new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL);
    
    // Run migration mutation
    const result = await convex.mutation(api.users.migrateUsers);
    
    if (result.success) {
      console.log('✅ Migration complete!');
      console.log(`   📝 Creators migrated: ${result.migrated.creators}`);
      console.log(`   🏢 Businesses migrated: ${result.migrated.businesses}`);
      console.log(`   📊 Total: ${result.migrated.total}`);
      console.log('\n✨ All users have been migrated to their respective profile tables!');
    }
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
