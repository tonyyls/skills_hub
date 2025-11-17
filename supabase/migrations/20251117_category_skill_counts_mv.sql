-- Materialized view for category skill counts
-- Aggregates published skills per category to accelerate count queries

BEGIN;

-- Drop existing view if present (idempotent migration execution assumed)
DROP MATERIALIZED VIEW IF EXISTS public.category_skill_counts_mv;

-- Create materialized view
CREATE MATERIALIZED VIEW public.category_skill_counts_mv AS
SELECT
  category_id,
  COUNT(*) AS count
FROM public.skills
WHERE status = 'published'
GROUP BY category_id;

-- Index to speed up lookups by category_id
CREATE INDEX IF NOT EXISTS idx_category_skill_counts_mv_category_id
ON public.category_skill_counts_mv (category_id);

COMMIT;