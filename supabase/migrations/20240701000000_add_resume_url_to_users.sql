-- Add resume_url column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS resume_url TEXT;

-- Enable realtime for users table
alter publication supabase_realtime add table users;