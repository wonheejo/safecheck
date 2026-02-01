import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface User {
  id: string;
  email: string;
  full_name: string | null;
  last_seen_at: string;
  reminder_frequency_hours: number;
  sleep_start_time: string | null;
  sleep_end_time: string | null;
  timezone: string;
  fcm_token: string | null;
  monitoring_enabled: boolean;
}

// Check if current time is within sleep hours
function isWithinSleepHours(
  sleepStart: string | null,
  sleepEnd: string | null,
  timezone: string
): boolean {
  if (!sleepStart || !sleepEnd) {
    return false;
  }

  try {
    // Get current time in user's timezone
    const now = new Date();
    const userTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    const currentHour = userTime.getHours();
    const currentMinute = userTime.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;

    // Parse sleep times (format: "HH:mm")
    const [startHour, startMinute] = sleepStart.split(':').map(Number);
    const [endHour, endMinute] = sleepEnd.split(':').map(Number);
    const startTimeMinutes = startHour * 60 + startMinute;
    const endTimeMinutes = endHour * 60 + endMinute;

    // Handle overnight sleep (e.g., 23:00 to 07:00)
    if (startTimeMinutes > endTimeMinutes) {
      return currentTimeMinutes >= startTimeMinutes || currentTimeMinutes < endTimeMinutes;
    }

    // Normal case (e.g., 01:00 to 09:00)
    return currentTimeMinutes >= startTimeMinutes && currentTimeMinutes < endTimeMinutes;
  } catch (error) {
    console.error('Error checking sleep hours:', error);
    return false;
  }
}

// Send push notification via FCM
async function sendPushNotification(fcmToken: string, title: string, body: string, data?: Record<string, string>) {
  const fcmServerKey = Deno.env.get('FCM_SERVER_KEY');
  if (!fcmServerKey) {
    console.error('FCM_SERVER_KEY not configured');
    return false;
  }

  try {
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Authorization': `key=${fcmServerKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: fcmToken,
        notification: { title, body },
        data: data || {},
        android: {
          priority: 'normal',
          notification: {
            sound: 'default',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
            },
          },
        },
      }),
    });

    if (!response.ok) {
      console.error('FCM send failed:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('FCM error:', error);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    const results = {
      reminders_sent: 0,
      skipped_sleep_hours: 0,
      errors: [] as string[],
    };

    // Get all users with monitoring enabled and FCM token
    const { data: users, error: queryError } = await supabase
      .from('users')
      .select('*')
      .eq('monitoring_enabled', true)
      .eq('alert_status', 'ok')
      .not('fcm_token', 'is', null);

    if (queryError) {
      console.error('Query error:', queryError);
      return new Response(
        JSON.stringify({ error: 'Failed to query users' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process each user
    for (const user of (users || []) as User[]) {
      // Check if within sleep hours
      if (isWithinSleepHours(user.sleep_start_time, user.sleep_end_time, user.timezone)) {
        results.skipped_sleep_hours++;
        continue;
      }

      // Calculate time since last seen
      const lastSeen = new Date(user.last_seen_at);
      const hoursSinceLastSeen = (now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60);

      // Check if it's time for a reminder based on frequency
      // Send reminder if hours since last seen is a multiple of reminder frequency
      const reminderDue = hoursSinceLastSeen >= user.reminder_frequency_hours &&
        Math.floor(hoursSinceLastSeen) % user.reminder_frequency_hours === 0;

      if (reminderDue && user.fcm_token) {
        const sent = await sendPushNotification(
          user.fcm_token,
          'SafeCheck Reminder',
          'Take a moment to check in and let your loved ones know you\'re okay.',
          { action: 'check_in' }
        );

        if (sent) {
          results.reminders_sent++;
        } else {
          results.errors.push(`Failed to send reminder to user ${user.id}`);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: now.toISOString(),
        ...results,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Send reminders error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
