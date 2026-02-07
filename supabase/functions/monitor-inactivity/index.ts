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
  inactivity_threshold_hours: number;
  grace_period_hours: number;
  alert_status: 'ok' | 'warning_sent' | 'alert_sent';
  warning_sent_at: string | null;
  fcm_token: string | null;
  monitoring_enabled: boolean;
}

interface TrustedContact {
  id: string;
  user_id: string;
  name: string;
  phone_number: string;
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

    // Import private key and sign
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
              priority: 'HIGH',
              notification: { sound: 'default' },
            },
            apns: {
              payload: {
                aps: { sound: 'default', badge: 1 },
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

// Send SMS via Twilio
async function sendSms(to: string, message: string) {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
  const fromNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

  if (!accountSid || !authToken || !fromNumber) {
    console.error('Twilio credentials not configured');
    return false;
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: to,
          From: fromNumber,
          Body: message,
        }),
      }
    );

    if (!response.ok) {
      console.error('Twilio send failed:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Twilio error:', error);
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
      warnings_sent: 0,
      alerts_sent: 0,
      errors: [] as string[],
    };

    // 1. Find users who need a warning (inactive past threshold, status = 'ok')
    const { data: usersNeedingWarning, error: warningQueryError } = await supabase
      .from('users')
      .select('*')
      .eq('monitoring_enabled', true)
      .eq('alert_status', 'ok')
      .not('fcm_token', 'is', null);

    if (warningQueryError) {
      console.error('Warning query error:', warningQueryError);
      results.errors.push('Failed to query users for warnings');
    }

    // Process users needing warnings
    for (const user of (usersNeedingWarning || []) as User[]) {
      const lastSeen = new Date(user.last_seen_at);
      const hoursSinceLastSeen = (now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastSeen >= user.inactivity_threshold_hours) {
        console.log(`User ${user.id} needs warning (inactive ${hoursSinceLastSeen.toFixed(1)}h)`);

        // Send warning push notification
        if (user.fcm_token) {
          const sent = await sendPushNotification(
            user.fcm_token,
            'SafeCheck: Please Check In',
            `You haven't checked in for ${Math.floor(hoursSinceLastSeen)} hours. Your contacts will be notified in ${user.grace_period_hours} hours if you don't respond.`,
            { action: 'check_in' }
          );

          if (sent) {
            // Update user status
            await supabase
              .from('users')
              .update({
                alert_status: 'warning_sent',
                warning_sent_at: now.toISOString(),
                updated_at: now.toISOString(),
              })
              .eq('id', user.id);

            // Log the warning
            await supabase.from('alerts_log').insert({
              user_id: user.id,
              alert_type: 'warning',
              status: 'sent',
              message: `Warning sent after ${Math.floor(hoursSinceLastSeen)} hours of inactivity`,
              sent_at: now.toISOString(),
            });

            results.warnings_sent++;
          }
        }
      }
    }

    // 2. Find users who need SMS alert (warning sent, grace period expired)
    const { data: usersNeedingAlert, error: alertQueryError } = await supabase
      .from('users')
      .select('*')
      .eq('monitoring_enabled', true)
      .eq('alert_status', 'warning_sent')
      .not('warning_sent_at', 'is', null);

    if (alertQueryError) {
      console.error('Alert query error:', alertQueryError);
      results.errors.push('Failed to query users for alerts');
    }

    // Process users needing SMS alerts
    for (const user of (usersNeedingAlert || []) as User[]) {
      if (!user.warning_sent_at) continue;

      const warningSentAt = new Date(user.warning_sent_at);
      const hoursSinceWarning = (now.getTime() - warningSentAt.getTime()) / (1000 * 60 * 60);

      if (hoursSinceWarning >= user.grace_period_hours) {
        console.log(`User ${user.id} needs SMS alert (grace period expired)`);

        // Get trusted contacts
        const { data: contacts, error: contactsError } = await supabase
          .from('trusted_contacts')
          .select('*')
          .eq('user_id', user.id);

        if (contactsError || !contacts?.length) {
          console.error(`No contacts for user ${user.id}`);
          results.errors.push(`No contacts for user ${user.id}`);
          continue;
        }

        const lastSeen = new Date(user.last_seen_at);
        const hoursSinceLastSeen = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60));
        const userName = user.full_name || 'A SafeCheck user';

        // Send SMS to all contacts
        let allSent = true;
        for (const contact of contacts as TrustedContact[]) {
          const message = `This is an automated message from SafeCheck. ${userName} has not checked in for ${hoursSinceLastSeen} hours. Please try contacting them directly.`;

          const sent = await sendSms(contact.phone_number, message);
          if (!sent) {
            allSent = false;
            results.errors.push(`Failed to send SMS to ${contact.phone_number}`);
          }
        }

        // Update user status
        await supabase
          .from('users')
          .update({
            alert_status: 'alert_sent',
            updated_at: now.toISOString(),
          })
          .eq('id', user.id);

        // Log the alert
        await supabase.from('alerts_log').insert({
          user_id: user.id,
          alert_type: 'sms_alert',
          status: allSent ? 'sent' : 'failed',
          message: `SMS alert sent to ${contacts.length} contacts after ${hoursSinceLastSeen} hours of inactivity`,
          sent_at: now.toISOString(),
        });

        if (allSent) {
          results.alerts_sent++;
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
    console.error('Monitor inactivity error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
