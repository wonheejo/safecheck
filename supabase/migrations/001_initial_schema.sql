-- SafeCheck Database Schema
-- Run this in your Supabase SQL editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  inactivity_threshold_hours INTEGER DEFAULT 24 CHECK (inactivity_threshold_hours IN (24, 48, 72)),
  grace_period_hours INTEGER DEFAULT 2 CHECK (grace_period_hours IN (1, 2, 4)),
  reminder_frequency_hours INTEGER DEFAULT 4 CHECK (reminder_frequency_hours IN (1, 2, 4, 6, 12)),
  sleep_start_time TIME,
  sleep_end_time TIME,
  timezone TEXT DEFAULT 'UTC',
  alert_status TEXT DEFAULT 'ok' CHECK (alert_status IN ('ok', 'warning_sent', 'alert_sent')),
  warning_sent_at TIMESTAMPTZ,
  fcm_token TEXT,
  monitoring_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trusted contacts table
CREATE TABLE IF NOT EXISTS public.trusted_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  country_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Check-ins audit log
CREATE TABLE IF NOT EXISTS public.check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('app_open', 'manual', 'notification')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alerts log
CREATE TABLE IF NOT EXISTS public.alerts_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('warning', 'sms_alert')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_alert_status ON public.users(alert_status);
CREATE INDEX IF NOT EXISTS idx_users_last_seen_at ON public.users(last_seen_at);
CREATE INDEX IF NOT EXISTS idx_users_monitoring ON public.users(monitoring_enabled);
CREATE INDEX IF NOT EXISTS idx_trusted_contacts_user_id ON public.trusted_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_user_id ON public.check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_created_at ON public.check_ins(created_at);
CREATE INDEX IF NOT EXISTS idx_alerts_log_user_id ON public.alerts_log(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_log_created_at ON public.alerts_log(created_at);

-- Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trusted_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts_log ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trusted contacts policies
CREATE POLICY "Users can view own contacts"
  ON public.trusted_contacts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contacts"
  ON public.trusted_contacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contacts"
  ON public.trusted_contacts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own contacts"
  ON public.trusted_contacts FOR DELETE
  USING (auth.uid() = user_id);

-- Check-ins policies
CREATE POLICY "Users can view own check-ins"
  ON public.check_ins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own check-ins"
  ON public.check_ins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Alerts log policies
CREATE POLICY "Users can view own alerts"
  ON public.alerts_log FOR SELECT
  USING (auth.uid() = user_id);

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Limit trusted contacts per user (max 3)
CREATE OR REPLACE FUNCTION public.check_contact_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.trusted_contacts WHERE user_id = NEW.user_id) >= 3 THEN
    RAISE EXCEPTION 'Maximum of 3 trusted contacts allowed per user';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_contact_limit ON public.trusted_contacts;
CREATE TRIGGER enforce_contact_limit
  BEFORE INSERT ON public.trusted_contacts
  FOR EACH ROW EXECUTE FUNCTION public.check_contact_limit();

-- Service role policy for Edge Functions
CREATE POLICY "Service role can read all users for monitoring"
  ON public.users FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role can update users for monitoring"
  ON public.users FOR UPDATE
  TO service_role
  USING (true);

CREATE POLICY "Service role can read all contacts for alerts"
  ON public.trusted_contacts FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role can insert alerts"
  ON public.alerts_log FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update alerts"
  ON public.alerts_log FOR UPDATE
  TO service_role
  USING (true);
