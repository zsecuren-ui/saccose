-- Enable online cross-device updates for institution and member records.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'institutions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.institutions;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'members'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.members;
  END IF;
END $$;

ALTER TABLE public.institutions REPLICA IDENTITY FULL;
ALTER TABLE public.members REPLICA IDENTITY FULL;
