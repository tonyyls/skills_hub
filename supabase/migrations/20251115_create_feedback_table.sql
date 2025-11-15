CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  source_id uuid NOT NULL,
  user_id uuid NOT NULL,
  issues text[] NOT NULL,
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feedback_type_source ON public.feedback (type, source_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user_type_source_time ON public.feedback (user_id, type, source_id, created_at);
