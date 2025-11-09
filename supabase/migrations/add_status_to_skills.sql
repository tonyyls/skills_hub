-- Add status and published_at columns to public.skills
-- Status values: draft | published | archived
ALTER TABLE public.skills
  ADD COLUMN IF NOT EXISTS status text CHECK (status IN ('draft','published','archived')) DEFAULT 'draft' NOT NULL,
  ADD COLUMN IF NOT EXISTS published_at timestamptz;

COMMENT ON COLUMN public.skills.status IS '内容发布状态：draft/published/archived';
COMMENT ON COLUMN public.skills.published_at IS '发布时间（当 status=published 时记录）';