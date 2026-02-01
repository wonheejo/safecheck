# SafeCheck

A cross-platform mobile app (iOS + Android) that monitors phone inactivity and alerts trusted contacts via SMS when the user doesn't check in within a configured time window.

## Features

- **Check-in System**: Manual and automatic check-ins when app is opened
- **Trusted Contacts**: Add up to 3 contacts who will be notified via SMS
- **Configurable Alerts**: Set inactivity threshold (24/48/72h) and grace period (1/2/4h)
- **Push Notifications**: Reminders to check in and warnings before alerts
- **Quiet Hours**: Configure sleep hours when reminders are paused
- **Alert History**: View past warnings and SMS alerts

## Tech Stack

- **React Native** with TypeScript
- **Supabase** for backend (auth, database, edge functions)
- **Firebase Cloud Messaging** for push notifications
- **Twilio** for SMS delivery

## Project Structure

```
safecheck/
├── src/
│   ├── api/
│   │   └── supabase.ts          # Supabase client & API helpers
│   ├── components/
│   │   ├── CheckInButton.tsx    # Large "I'm OK" button
│   │   ├── ContactForm.tsx      # Add/edit contact form
│   │   ├── ThresholdPicker.tsx  # Time selection component
│   │   └── TimePicker.tsx       # Time picker for quiet hours
│   ├── hooks/
│   │   ├── useAuth.ts           # Authentication hook
│   │   ├── useCheckIn.ts        # Check-in logic
│   │   └── useContacts.ts       # Contacts management
│   ├── navigation/
│   │   ├── RootNavigator.tsx    # Main navigation
│   │   ├── AuthNavigator.tsx    # Auth flow
│   │   ├── OnboardingNavigator.tsx
│   │   └── MainTabNavigator.tsx
│   ├── screens/
│   │   ├── auth/                # Welcome, SignUp, SignIn, Consent
│   │   ├── onboarding/          # AddContacts, SetThreshold, TestAlert
│   │   └── main/                # Home, Contacts, Settings, AlertHistory
│   ├── services/
│   │   └── notifications/       # FCM setup & handling
│   └── types/
│       └── index.ts             # TypeScript types
├── supabase/
│   ├── migrations/              # Database schema
│   └── functions/               # Edge Functions
│       ├── check-in/
│       ├── monitor-inactivity/
│       └── send-reminders/
└── App.tsx
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

### 3. Set Up Supabase

1. Create a new Supabase project at https://supabase.com
2. Run the migration in `supabase/migrations/001_initial_schema.sql`
3. Deploy the edge functions:
   ```bash
   supabase functions deploy check-in
   supabase functions deploy monitor-inactivity
   supabase functions deploy send-reminders
   ```
4. Set up secrets:
   ```bash
   supabase secrets set FCM_SERVER_KEY=your-fcm-key
   supabase secrets set TWILIO_ACCOUNT_SID=your-sid
   supabase secrets set TWILIO_AUTH_TOKEN=your-token
   supabase secrets set TWILIO_PHONE_NUMBER=your-number
   ```
5. Enable pg_cron extension and run `002_cron_jobs.sql`

### 4. Set Up Firebase

1. Create a Firebase project at https://console.firebase.google.com
2. Add iOS and Android apps
3. Download config files:
   - iOS: `GoogleService-Info.plist` → `ios/`
   - Android: `google-services.json` → `android/app/`
4. Get FCM Server Key from Project Settings > Cloud Messaging

### 5. Set Up Twilio

1. Create account at https://twilio.com
2. Get a phone number for sending SMS
3. Note Account SID, Auth Token, and Phone Number

### 6. iOS Setup

```bash
cd ios && pod install && cd ..
```

### 7. Run the App

```bash
# iOS
npm run ios

# Android
npm run android
```

## Alert Flow

1. User doesn't check in for `inactivity_threshold_hours`
2. Warning push notification sent
3. User has `grace_period_hours` to respond
4. If no response, SMS sent to all trusted contacts

## API Endpoints

### Check-in
- **POST** `/functions/v1/check-in`
- Updates `last_seen_at`, resets alert status

### Monitor Inactivity (Cron)
- Runs every 15 minutes
- Sends warnings and SMS alerts

### Send Reminders (Cron)
- Runs every hour
- Sends check-in reminders (respects quiet hours)

## Configuration Options

| Setting | Options | Default |
|---------|---------|---------|
| Inactivity Threshold | 24h, 48h, 72h | 24h |
| Grace Period | 1h, 2h, 4h | 2h |
| Reminder Frequency | 1h, 2h, 4h, 6h, 12h | 4h |
| Quiet Hours | Start/End time | None |

## License

MIT
