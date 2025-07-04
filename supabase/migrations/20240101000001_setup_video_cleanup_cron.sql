-- Enable the pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a cron job to run the cleanup-videos function every 15 minutes
-- This will call the Edge Function via HTTP request
SELECT cron.schedule(
    'cleanup-videos-job',
    '*/15 * * * *', -- Every 15 minutes
    $$
    SELECT
      net.http_post(
        url := 'https://gltvuathwtbmrdjcqkqg.supabase.co/functions/v1/cleanup-videos',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.supabase_service_role_key') || '"}',
        body := '{}',
        timeout_milliseconds := 30000
      );
    $$
);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;