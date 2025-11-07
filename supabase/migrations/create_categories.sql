-- Create categories table for skills-hub
-- Compatible with Supabase (Postgres). Uses gen_random_uuid() for UUID generation.

CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_en text,
  slug text UNIQUE NOT NULL,
  description text,
  description_en text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Helpful index for ordering and lookups
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON public.categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_categories_created_at ON public.categories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_categories_name ON public.categories(name);

-- Enable RLS and allow public read (anon, authenticated)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories" ON public.categories
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- No public write policies; writes are reserved for backend using service role key