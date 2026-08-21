-- Migration: Create announcements table and RLS policies for Supabase
-- Run this SQL in your Supabase SQL editor or via migration tooling

CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  content text NOT NULL,
  status text NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Optional index for ordering
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON public.announcements (created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Only authenticated users may insert, and they must own the row via author_id.
CREATE POLICY insert_if_logged_in ON public.announcements
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND author_id = auth.uid()
  );

-- Allow everyone to read announcements in the app.
CREATE POLICY select_for_all ON public.announcements
  FOR SELECT
  USING (true);

-- Allow only the owner to update their announcement.
CREATE POLICY update_own ON public.announcements
  FOR UPDATE
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- Allow delete only by owner.
CREATE POLICY delete_own ON public.announcements
  FOR DELETE
  USING (author_id = auth.uid());

-- Trigger to keep updated_at in sync
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_announcements_updated_at ON public.announcements;
CREATE TRIGGER trg_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_updated_at();
