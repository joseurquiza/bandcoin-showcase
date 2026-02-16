const fs = require('fs');
const path = require('path');

// Files to update
const files = [
  'app/vault/supporter-actions.ts',
  'app/vault/artist-actions.ts',
  'app/vault/admin-actions.ts',
  'app/vault/vault-actions.ts',
  'app/support/actions.ts',
  'app/merch/merch-actions.ts',
  'app/rewards/rewards-actions.ts',
  'app/bt/gigs/gig-actions.ts',
  'app/bt/bt-actions.ts',
  'app/band-together/band-together-actions.ts',
  'app/bt/bands/band-actions.ts',
  'app/admin/withdrawal-actions.ts',
  'app/admin/analytics-actions.ts',
  'app/merch/page.tsx',
];

files.forEach((filePath) => {
  const fullPath = path.join('/vercel/share/v0-project', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping ${filePath} - not found`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Replace the import and module-level const
  content = content.replace(
    /import { neon } from "@neondatabase\/serverless"\n\nconst sql = neon\(.*?\)/,
    'import { getDb } from "@/lib/db"'
  );
  
  // Add const sql = getDb() at the start of each function that uses sql
  // This is a simplified approach - functions will need getDb() calls added manually
  
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Updated ${filePath}`);
});

console.log('Done!');
