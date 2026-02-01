# SafeCheck Implementation Plan

**Goal:** Build a cross-platform mobile app (iOS + Android) that monitors phone inactivity and alerts trusted contacts via SMS when the user doesn't check in within a configured time window.

**Project Directory:** `/Users/endex/heyri/apps/safecheck`

**Stack:** React Native + Supabase + Firebase (FCM) + Twilio

---

## Phase 1: Project Setup & Backend

### 1.1 Initialize React Native Project
```bash
npx react-native init SafeCheck --template react-native-template-typescript
```

Install core dependencies:
- `@supabase/supabase-js` - Backend client
- `@react-navigation/native` + stack/tabs - Navigation
- `@react-native-firebase/messaging` - Push notifications
- `react-native-screens`, `react-native-safe-area-context`

### 1.2 Supabase Database Schema

**Tables to create:**

| Table | Purpose |
|-------|---------|
| `users` | User profile, `last_seen_at`, alert settings, FCM token |
| `trusted_contacts` | Up to 3 contacts per user with phone numbers |
| `check_ins` | Audit log of check-in events (optional) |
| `alerts_log` | Track warning/SMS delivery status |

**Key columns in `users`:**
- `last_seen_at` - Updated on every check-in
- `inactivity_threshold_hours` - User setting (24/48/72h)
- `grace_period_hours` - Warning response window (1/2/4h)
- `reminder_frequency_hours` - How often to send check-in reminders (1/2/4/6/12h)
- `sleep_start_time` - Start of quiet hours (e.g., "23:00")
- `sleep_end_time` - End of quiet hours (e.g., "07:00")
- `timezone` - User's timezone for sleep hours calculation
- `alert_status` - 'ok' | 'warning_sent' | 'alert_sent'
- `fcm_token` - For push notifications

### 1.3 Supabase Edge Functions

| Function | Trigger | Purpose |
|----------|---------|---------|
| `check-in` | App API call | Update `last_seen_at`, reset alert status |
| `monitor-inactivity` | Cron (every 15 min) | Check for users needing warnings/alerts |
| `send-reminders` | Cron (daily, optional) | Gentle reminder push notifications |

---

## Phase 2: React Native App Structure

```
SafeCheck/
├── src/
│   ├── api/
│   │   └── supabase.ts          # Supabase client
│   ├── screens/
│   │   ├── auth/                # Welcome, SignUp, SignIn, Consent
│   │   ├── onboarding/          # AddContacts, SetThreshold, TestAlert
│   │   └── main/                # Home, Contacts, Settings
│   ├── components/
│   │   ├── CheckInButton.tsx    # Large "I'm OK" button
│   │   ├── ContactForm.tsx      # Add/edit contact
│   │   └── ThresholdPicker.tsx  # Time selector
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useCheckIn.ts
│   │   └── useContacts.ts
│   ├── services/
│   │   └── notifications/       # FCM setup & handling
│   └── navigation/
│       └── RootNavigator.tsx
```

---

## Phase 3: Core Features Implementation

### 3.1 Authentication Flow (Simple)
**Options for user:**
- **Google Sign-In** - One-tap OAuth (recommended, easiest)
- **Email/Password** - Traditional sign-up

**Screens:**
1. WelcomeScreen - App intro with "Continue with Google" + "Sign up with Email" buttons
2. SignUpScreen - Only shown if user chooses email (email + password fields)
3. ConsentScreen - Explicit user consent (after auth)

**Dependencies:**
- `@react-native-google-signin/google-signin` - Google OAuth
- Supabase Auth configured with Google provider

### 3.2 Check-In System
- **Auto check-in:** Update `last_seen_at` when app opens
- **Manual check-in:** Large "I'm OK" button on HomeScreen
- **Notification response:** Check-in when user taps warning notification

### 3.3 Contacts Management
- Add up to 3 trusted contacts
- International phone input with country picker (KR, JP, SG, ID, PH, MY, VN)
- Phone numbers stored in E.164 format (+821012345678)

### 3.4 Settings

**Alert Timing (user configurable):**
- Inactivity threshold: 24h / 48h / 72h (when to alert contacts)
- Grace period: 1h / 2h / 4h (time to respond after warning)

**Reminder Settings (user configurable):**
- Reminder frequency: 1h / 2h / 4h / 6h / 12h (how often to prompt check-in)
- Sleep hours: Start time + End time (e.g., 11 PM - 7 AM)
  - No reminders sent during sleep window
  - Inactivity timer still runs, but reminders paused
- **Snooze option:** When reminder arrives, user can snooze for 30 min / 1 hour
  - Snooze delays the reminder, NOT the inactivity timer
  - Snooze action available directly from push notification

**Other Settings:**
- Enable/disable monitoring
- Alert history view

---

## Phase 4: Notification & Alert System

### Alert Flow
```
User inactive > threshold
        ↓
[WARNING] Push notification sent
        ↓
User doesn't respond within grace period
        ↓
[ALERT] SMS sent to all trusted contacts via Twilio
```

### Push Notification Setup
1. Create Firebase project
2. Configure FCM for Android
3. Upload APNs key for iOS
4. Save FCM token to `users` table
5. Handle notification tap → perform check-in

### Twilio SMS Integration
- Account SID, Auth Token, Phone Number as Supabase secrets
- Message template: "This is an automated message from SafeCheck. {name} has not checked in for {hours} hours. Please try contacting them directly."

---

## Phase 5: Cron Job Setup

```sql
-- Run every 15 minutes to check for inactive users
SELECT cron.schedule(
  'monitor-user-inactivity',
  '*/15 * * * *',
  $$ SELECT net.http_post(...) $$
);
```

Logic in `monitor-inactivity`:
1. Find users where `now() - last_seen_at > threshold` AND `alert_status = 'ok'`
2. Send warning push, set `alert_status = 'warning_sent'`
3. Find users where `now() - warning_sent_at > grace_period` AND `alert_status = 'warning_sent'`
4. Send SMS to all contacts, set `alert_status = 'alert_sent'`

---

## Implementation Order

| Step | Task | Dependencies |
|------|------|--------------|
| 1 | Create React Native project, install deps | None |
| 2 | Set up Supabase project, run schema SQL | None |
| 3 | Build auth screens (SignUp, SignIn) | Supabase |
| 4 | Build HomeScreen with check-in button | Auth |
| 5 | Build contacts management screens | Auth |
| 6 | Build settings screens | Auth |
| 7 | Set up Firebase & push notifications | App structure |
| 8 | Deploy Edge Functions | Supabase |
| 9 | Set up Twilio & SMS sending | Edge Functions |
| 10 | Configure cron job | Edge Functions |
| 11 | Test end-to-end flow | All above |
| 12 | Polish UI, handle edge cases | Testing |

---

## Key Files to Create

| File | Purpose |
|------|---------|
| `src/api/supabase.ts` | Supabase client initialization |
| `src/hooks/useCheckIn.ts` | Check-in logic (auto + manual) |
| `src/services/notifications/index.ts` | FCM setup & token management |
| `src/screens/main/HomeScreen.tsx` | Main "I'm OK" button interface |
| `supabase/functions/check-in/index.ts` | Check-in API endpoint |
| `supabase/functions/monitor-inactivity/index.ts` | Cron job for warnings/alerts |

---

## Services to Set Up

1. **Supabase** - https://supabase.com (free tier works for MVP)
2. **Firebase** - https://console.firebase.google.com (for FCM)
3. **Twilio** - https://twilio.com (pay-as-you-go SMS)
4. **Apple Developer** - For iOS push notifications (APNs)

---

## Verification Plan

1. **Check-in works:** Tap button → verify `last_seen_at` updates in Supabase
2. **Warning triggers:** Set threshold to 1 min → verify push notification received
3. **Alert triggers:** Don't respond to warning → verify SMS received
4. **Reset works:** Check-in after warning → verify `alert_status` resets to 'ok'
5. **Contact management:** Add/edit/delete contacts → verify in database
6. **Cross-platform:** Test on both iOS simulator and Android emulator
