-- Create applied_jobs table to track jobs the user has applied to
CREATE TABLE IF NOT EXISTS public.applied_jobs (
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
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  application_status TEXT DEFAULT 'Applied', -- Options: Applied, Interview, Rejected, Accepted, etc.
  notes TEXT,
  UNIQUE(user_id, job_id)
);

-- Add RLS policies
ALTER TABLE public.applied_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own applied jobs"
  ON public.applied_jobs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own applied jobs"
  ON public.applied_jobs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applied jobs"
  ON public.applied_jobs
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own applied jobs"
  ON public.applied_jobs
  FOR DELETE
  USING (auth.uid() = user_id);

-- Enable realtime for applied_jobs table
ALTER PUBLICATION supabase_realtime ADD TABLE applied_jobs;
