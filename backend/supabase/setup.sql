
DROP TABLE IF EXISTS public.users CASCADE;

-- Users table
CREATE TABLE public.users (
  username    TEXT PRIMARY KEY,
  phone_number TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Allow anonymous reads (needed for login lookup via anon key)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public register" ON public.users;
CREATE POLICY "Allow public register"
  ON public.users FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public login lookup" ON public.users;
CREATE POLICY "Allow public login lookup"
  ON public.users FOR SELECT
  USING (true);
