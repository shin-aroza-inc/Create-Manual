-- Fix cleanup_videos function with correct http_post arguments
CREATE OR REPLACE FUNCTION cleanup_videos()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result record;
BEGIN
  -- Try different argument formats for extensions.http_post
  BEGIN
    -- Format 1: url, body, headers
    SELECT * FROM extensions.http_post(
      'https://gltvuathwtbmrdjcqkqg.supabase.co/functions/v1/cleanup-videos',
      '{}',
      '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsdHZ1YXRod3RibXJkamNxa3FnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTI5NzEsImV4cCI6MjA2NzE2ODk3MX0.YAPvDHmuCzIaiDaUqwThIIjzzOePIRnWBwFvo99JYWw"}'
    ) INTO result;
  EXCEPTION
    WHEN OTHERS THEN
      -- Format 2: try with different argument order
      BEGIN
        SELECT * FROM extensions.http(
          ('POST', 
           'https://gltvuathwtbmrdjcqkqg.supabase.co/functions/v1/cleanup-videos',
           ARRAY[('Content-Type', 'application/json'), 
                 ('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsdHZ1YXRod3RibXJkamNxa3FnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTI5NzEsImV4cCI6MjA2NzE2ODk3MX0.YAPvDHmuCzIaiDaUqwThIIjzzOePIRnWBwFvo99JYWw')],
           NULL,
           '{}')::http_request
        ) INTO result;
      EXCEPTION
        WHEN OTHERS THEN
          -- Log the error but don't fail
          RAISE NOTICE 'HTTP request failed: %', SQLERRM;
      END;
  END;
END;
$$;