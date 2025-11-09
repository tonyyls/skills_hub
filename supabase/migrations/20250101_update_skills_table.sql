-- Align public.skills columns with admin API payload
-- 1) Add content column (nullable)
ALTER TABLE public.skills
ADD COLUMN IF NOT EXISTS content text;

-- 2) Relax author_id to be nullable (already nullable in current schema, ensure no NOT NULL)
ALTER TABLE public.skills
ALTER COLUMN author_id DROP NOT NULL;

-- 3) Ensure author_name column exists (varchar(50))
ALTER TABLE public.skills
ADD COLUMN IF NOT EXISTS author_name varchar(50);