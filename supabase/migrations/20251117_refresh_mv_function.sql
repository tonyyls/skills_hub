-- RPC function to refresh materialized view concurrently

CREATE OR REPLACE FUNCTION public.refresh_category_skill_counts_mv()
RETURNS void
LANGUAGE sql
AS $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.category_skill_counts_mv;
$$;