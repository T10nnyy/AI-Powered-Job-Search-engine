-- Create user_resumes table to store parsed resume data
CREATE TABLE IF NOT EXISTS public.user_resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  basic_info JSONB NOT NULL,
  technical_skills TEXT[] NOT NULL,
  soft_skills TEXT[] NOT NULL,
  experience JSONB[] NOT NULL,
  education JSONB[] NOT NULL,
  certifications TEXT[] NOT NULL,
  recommended_job_roles TEXT[] NOT NULL,
  preferred_location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT user_id_unique UNIQUE (user_id)
);

-- Add RLS policies
ALTER TABLE public.user_resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own resume data"
  ON public.user_resumes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resume data"
  ON public.user_resumes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resume data"
  ON public.user_resumes
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resume data"
  ON public.user_resumes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Enable realtime for user_resumes table
ALTER PUBLICATION supabase_realtime ADD TABLE user_resumes;

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to update the updated_at column
CREATE TRIGGER update_user_resumes_updated_at
BEFORE UPDATE ON public.user_resumes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
