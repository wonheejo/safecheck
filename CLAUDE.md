# SafeCheck Project

A cross-platform mobile app (iOS + Android) that monitors phone inactivity and alerts trusted contacts via SMS when the user doesn't check in within a configured time window.

## Tech Stack

- **Frontend**: React Native with TypeScript
- **Backend**: Supabase (Auth, Database, Edge Functions)
- **Notifications**: Firebase Cloud Messaging (FCM)
- **SMS**: Twilio

## Project Structure

```
safecheck/
├── src/
│   ├── api/supabase.ts           # Supabase client & helpers
│   ├── components/               # Reusable UI components
│   ├── hooks/                    # Custom React hooks
│   ├── navigation/               # React Navigation setup
│   ├── screens/                  # App screens (auth, onboarding, main)
│   ├── services/notifications/   # FCM setup
│   └── types/                    # TypeScript types
├── supabase/
│   ├── migrations/               # Database schema SQL
│   └── functions/                # Edge Functions (Deno)
├── ios/                          # iOS native code
├── android/                      # Android native code
└── App.tsx                       # App entry point
```

## Key Files

| File | Purpose |
|------|---------|
| `src/api/supabase.ts` | Supabase client, auth helpers, database queries |
| `src/hooks/useAuth.ts` | Authentication state management |
| `src/hooks/useCheckIn.ts` | Check-in logic (auto + manual) |
| `src/hooks/useContacts.ts` | Trusted contacts CRUD |
| `src/services/notifications/index.ts` | FCM token registration, notification handling |
| `supabase/functions/monitor-inactivity/index.ts` | Cron job for warnings/SMS alerts |

## Database Tables

- `users` - User profile, settings, FCM token, alert status
- `trusted_contacts` - Up to 3 contacts per user (phone in E.164 format)
- `check_ins` - Audit log of check-in events
- `alerts_log` - Track warning/SMS delivery status

## Alert Flow

1. User inactive > `inactivity_threshold_hours` (24/48/72h)
2. Warning push notification sent, `alert_status` = 'warning_sent'
3. User doesn't respond within `grace_period_hours` (1/2/4h)
4. SMS sent to all trusted contacts via Twilio, `alert_status` = 'alert_sent'
5. User checks in → `alert_status` reset to 'ok'

## Environment Variables

Required in `.env` and Supabase secrets:
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `FCM_SERVER_KEY`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`

## Commands

```bash
# Install dependencies
npm install

# Run iOS
npm run ios

# Run Android
npm run android

# Deploy Supabase functions
supabase functions deploy check-in
supabase functions deploy monitor-inactivity
supabase functions deploy send-reminders
```

## Development Notes

- Phone numbers stored in E.164 format (e.g., +821012345678)
- Supported countries: KR, JP, SG, ID, PH, MY, VN, US
- Max 3 trusted contacts per user (enforced by DB trigger)
- Quiet hours pause reminders but not the inactivity timer
- Auto check-in occurs when app becomes active (foreground)
