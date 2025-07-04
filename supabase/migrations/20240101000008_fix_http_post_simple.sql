-- Fix cleanup_videos function with correct http_post arguments
CREATE OR REPLACE FUNCTION cleanup_videos()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result record;
BEGIN
  -- Use the correct http_post format (uri, content, content_type)
  SELECT * FROM extensions.http_post(
    'https://gltvuathwtbmrdjcqkqg.supabase.co/functions/v1/cleanup-videos',
    '{}',
    'application/json'
  ) INTO result;
  
  -- Log the result for debugging
  RAISE NOTICE 'HTTP request completed with status: %', result;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'HTTP request failed: %', SQLERRM;
END;
$$;