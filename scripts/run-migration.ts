import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

async function runMigration() {
  // Create a Supabase client with admin access (service role key)
  // Get this from Supabase dashboard > Settings > API > service_role key (keep it secret)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseServiceKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is not defined. Get it from Supabase dashboard > Settings > API');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Read the migration file
  const migrationPath = path.join(__dirname, '../supabase/migrations/20240702000000_create_saved_jobs.sql');
  let migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  console.log('Executing migration...');
  
  // Execute the SQL - we need to use rpc for complex SQL
  const { error } = await supabase.rpc('pg_query', { query: migrationSQL });

  if (error) {
    console.error('Migration failed:', error);
  } else {
    console.log('Migration successful!');
  }
}

runMigration().catch(console.error);
