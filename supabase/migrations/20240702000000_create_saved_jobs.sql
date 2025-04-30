-- Create saved_jobs table
CREATE TABLE IF NOT EXISTS public.saved_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  job_id TEXT NOT NULL,
  job_title TEXT NOT NULL,
  employer_name TEXT NOT NULL,
  employer_logo TEXT,
  job_location TEXT,
  job_description TEXT,
  job_apply_link TEXT,
  job_posted TEXT,
  job_employment_type TEXT,
  job_is_remote BOOLEAN DEFAULT FALSE,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, job_id)
);

-- Add RLS policies
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved jobs"
  ON public.saved_jobs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved jobs"
  ON public.saved_jobs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved jobs"
  ON public.saved_jobs
  FOR DELETE
  USING (auth.uid() = user_id);

-- Enable realtime for saved_jobs table
alter publication supabase_realtime add table saved_jobs;
