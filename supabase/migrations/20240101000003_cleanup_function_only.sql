-- Create a database function that calls the Edge Function
CREATE OR REPLACE FUNCTION cleanup_videos()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Call the Edge Function using the HTTP extension
  PERFORM net.http_post(
    url := 'https://gltvuathwtbmrdjcqkqg.supabase.co/functions/v1/cleanup-videos',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsdHZ1YXRod3RibXJkamNxa3FnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTI5NzEsImV4cCI6MjA2NzE2ODk3MX0.YAPvDHmuCzIaiDaUqwThIIjzzOePIRnWBwFvo99JYWw"}',
    body := '{}',
    timeout_milliseconds := 30000
  );
END;
$$;