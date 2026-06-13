CREATE TABLE applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  job_id uuid REFERENCES jobs(id),
  company text, 
  title text,
  status text DEFAULT 'applied' CHECK (status IN ('applied','interview','offer','rejected')),
  applied_at timestamptz DEFAULT now(),
  notes text
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own applications" ON applications FOR ALL USING (auth.uid() = user_id);