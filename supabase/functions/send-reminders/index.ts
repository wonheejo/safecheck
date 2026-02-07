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

// FCM v1 API helpers
function base64url(data: Uint8Array): string {
  return btoa(String.fromCharCode(...data))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function getAccessToken(): Promise<string | null> {
  const serviceAccountJson = Deno.env.get('FCM_SERVICE_ACCOUNT_JSON');
  if (!serviceAccountJson) {
    console.error('FCM_SERVICE_ACCOUNT_JSON not configured');
    return null;
  }

  try {
    const sa = JSON.parse(serviceAccountJson);
    const now = Math.floor(Date.now() / 1000);

    const header = base64url(new TextEncoder().encode(JSON.stringify({ alg: 'RS256', typ: 'JWT' })));
    const payload = base64url(new TextEncoder().encode(JSON.stringify({
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/firebase.messaging',
      aud: sa.token_uri,
      iat: now,
      exp: now + 3600,
    })));

    const pemBody = sa.private_key.replace(/-----BEGIN PRIVATE KEY-----/, '').replace(/-----END PRIVATE KEY-----/, '').replace(/\n/g, '');
    const keyData = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));
    const cryptoKey = await crypto.subtle.importKey('pkcs8', keyData, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
    const signature = new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, new TextEncoder().encode(`${header}.${payload}`)));
    const jwt = `${header}.${payload}.${base64url(signature)}`;

    const tokenResponse = await fetch(sa.token_uri, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
    });

    const tokenData = await tokenResponse.json();
    return tokenData.access_token;
  } catch (error) {
    console.error('Failed to get access token:', error);
    return null;
  }
}

// Send push notification via FCM v1 API
async function sendPushNotification(fcmToken: string, title: string, body: string, data?: Record<string, string>) {
  const accessToken = await getAccessToken();
  if (!accessToken) return false;

  const projectId = JSON.parse(Deno.env.get('FCM_SERVICE_ACCOUNT_JSON')!).project_id;

  try {
    const response = await fetch(
      `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            token: fcmToken,
            notification: { title, body },
            data: data || {},
            android: {
              priority: 'NORMAL',
              notification: { sound: 'default' },
            },
            apns: {
              payload: {
                aps: { sound: 'default' },
              },
            },
          },
        }),
      }
    );

    if (!response.ok) {
      console.error('FCM v1 send failed:', await response.text());
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
