-- Add git_url and install_command columns to public.skills
ALTER TABLE public.skills
ADD COLUMN IF NOT EXISTS git_url text;

ALTER TABLE public.skills
ADD COLUMN IF NOT EXISTS install_command text;