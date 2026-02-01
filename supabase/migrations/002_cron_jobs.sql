-- Cron jobs for SafeCheck
-- Run this after enabling pg_cron and pg_net extensions in Supabase

-- Enable required extensions (if not already enabled)
-- Note: These may need to be enabled via Supabase dashboard
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- CREATE EXTENSION IF NOT EXISTS pg_net;

-- Monitor inactivity every 15 minutes
-- This checks for users who need warnings or SMS alerts
SELECT cron.schedule(
  'monitor-user-inactivity',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/monitor-inactivity',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Send reminders every hour
-- This sends gentle check-in reminders based on user's reminder_frequency setting
SELECT cron.schedule(
  'send-check-in-reminders',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/send-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);

-- To view scheduled jobs:
-- SELECT * FROM cron.job;

-- To unschedule a job:
-- SELECT cron.unschedule('monitor-user-inactivity');
-- SELECT cron.unschedule('send-check-in-reminders');

-- To view job run history:
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;
