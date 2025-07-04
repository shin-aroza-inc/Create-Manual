-- Fix cleanup_videos function with correct HTTP headers format
CREATE OR REPLACE FUNCTION cleanup_videos()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result record;
BEGIN
  -- Use the correct http_post format with proper headers
  SELECT * FROM extensions.http_post(
    'https://gltvuathwtbmrdjcqkqg.supabase.co/functions/v1/cleanup-videos',
    '{}',
    'application/json',
    ARRAY[
      extensions.http_header('Content-Type', 'application/json'),
      extensions.http_header('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsdHZ1YXRod3RibXJkamNxa3FnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTI5NzEsImV4cCI6MjA2NzE2ODk3MX0.YAPvDHmuCzIaiDaUqwThIIjzzOePIRnWBwFvo99JYWw')
    ]
  ) INTO result;
  
  -- Log the result for debugging
  RAISE NOTICE 'HTTP request completed with status: %', result.status;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'HTTP request failed: %', SQLERRM;
END;
$$;