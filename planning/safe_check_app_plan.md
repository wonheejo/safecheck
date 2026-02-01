# SafeCheck App — Full Product & Technical Plan

> **No news is good news — until it isn’t.**

A quiet safety net for people living alone.

---

## 1. Purpose & Vision

**Problem**
- People living alone may go unnoticed for long periods during emergencies.
- Families worry but don’t want to intrude daily.
- Existing solutions are intrusive, expensive, or overly medical.

**Vision**
SafeCheck exists to quietly confirm that someone is okay — and only speaks up when silence lasts too long.

**What SafeCheck is NOT**
- Not a medical device
- Not an emergency diagnosis system
- Not constant surveillance

---

## 2. Target Users

### Primary Users
- Young professionals living alone in cities
- International students living abroad
- Elderly parents living independently

### Secondary Users
- Family members
- Non-medical caregivers

---

## 3. Core Concept

SafeCheck uses a **dead-man’s-switch–style check-in system**.

- The user periodically confirms they are okay
- The server tracks the last confirmation time
- If no confirmation is received within a defined window, alerts are triggered

> The system escalates **absence**, not **danger**.

---

## 4. Core Features (MVP)

### 4.1 User Check-In

A check-in is recorded when the user:
- Opens the app
- Taps an **“I’m OK”** button
- Responds to a push notification

Each check-in updates:
```
last_seen_at = current_timestamp
```

---

### 4.2 Inactivity Monitoring

User-configurable settings:
- Inactivity threshold (e.g. 24h, 48h)
- Grace period after warning (e.g. 2 hours)

Server-side logic:
```
if now - last_seen_at > threshold:
    trigger_warning()
```

The app does **not** rely on background execution.

---

### 4.3 Warning Phase (Pre-Alert)

Before notifying trusted contacts, SafeCheck attempts to reach the user:
- Push notification
- Optional repeated push reminders

Example warning message:
> “We haven’t heard from you. Please confirm you’re okay within 2 hours.”

Purpose:
- Reduce false positives
- Avoid unnecessary panic
- Maintain app-store compliance

---

### 4.4 Alert Phase (Last Resort)

If the user does not respond within the grace period, alerts are sent **from the server**.

**Supported channels (MVP):**
- SMS only

**Transparency-first message example:**
> “This is an automated message from SafeCheck. Alex has not checked in for 24 hours. Please try contacting them directly.”

Alerts are intentionally neutral and non-diagnostic.

---

### 4.5 Trusted Contacts

Users configure:
- Contact name
- Phone number
- Alert priority order
- Region / country (for SMS routing)

Limits (MVP):
- Small fixed number of contacts (e.g. up to 3)

---

## 5. Optional Features (Post-MVP)

- Passive signals (strictly opt-in):
  - App open frequency
  - Device activity signals
- Escalation ladder (multi-step alerts)
- Vacation / Pause mode
- Activity and alert history log

---

## 6. User Experience Flow

### Onboarding
1. Purpose & philosophy explanation
2. Explicit consent & transparency screen
3. Add trusted contacts
4. Set inactivity threshold
5. Optional test alert

### Daily Use
- Passive by default
- Minimal notifications
- One-tap confirmation when prompted

### Alert Scenario
```
Inactivity → Warning → Grace Period → SMS Alert
```

---

## 7. Technical Architecture

### 7.1 Frontend

**Framework:** Flutter

**Reasons:**
- Single codebase for iOS & Android
- Strong push notification support
- Consistent UI across devices
- Good accessibility support for elderly users

---

### 7.2 Backend

**Initial Backend:** Supabase

Components:
- PostgreSQL database
- Authentication
- Edge Functions (alert logic)
- Scheduled background jobs

Supabase is chosen for:
- Fast iteration
- Predictable cost
- Low operational overhead

AWS migration is optional and not required early.

---

### 7.3 Background Jobs & Notifications

**Key rule:** Never rely on the app running in the background.

- App sends `last_seen_at` on check-in
- Server evaluates inactivity on a schedule
- Push notifications are used for reminders and warnings

Recommended defaults:
- Reminder push every ~12 hours
- Warning push at inactivity threshold

---

### 7.4 Push Notifications

- Android: Firebase Cloud Messaging (FCM)
- iOS: Apple Push Notification Service (APNs)

Push notifications are:
- Free
- Battery-friendly
- Review-safe

---

### 7.5 SMS Strategy (Global)

**MVP Provider:** Twilio

Reasons:
- Global coverage
- Handles local telecom compliance
- Reliable delivery
- Single API

Supported initial regions:
- South Korea
- Japan
- Singapore
- Indonesia
- Philippines
- Malaysia
- Vietnam

**SMS is used only as a last-resort alert.**

---

### 7.6 Regional SMS Considerations

| Region | Notes |
|------|------|
| Korea | Strict regulations, Twilio recommended |
| Japan | Long codes preferred, Twilio reliable |
| Singapore | Very friendly SMS environment |
| Indonesia | Reliable, wording matters |
| Philippines | High SMS usage, low friction |
| Malaysia | Straightforward |
| Vietnam | Filtering exists, neutral wording required |

---

## 8. Privacy & Trust Principles

- Data minimization
- No content inspection
- No contact scraping
- No location tracking by default

User controls:
- Enable / disable alerts
- Edit contacts anytime
- Delete all data

---

## 9. App Store & Play Store Compliance

- No impersonation of the user
- No silent SMS sending
- Explicit consent
- Clear disclosure that alerts are automated

---

## 10. Pricing Model

- **One-time purchase:** 5,000 KRW

Rationale:
- Low friction
- High trust
- Fits safety-utility positioning

Costs are controlled by:
- Low SMS volume
- Push-first alerting
- Contact limits

---

## 11. Cost Overview (100,000 Users)

Approximate monthly cost:
- Backend (Supabase): $250 – $600
- Push notifications: ~$0
- SMS alerts (rare): $10 – $50

**Estimated total:** $300 – $700 / month

---

## 12. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| False alarms | Warning & grace period |
| Panic | Neutral wording |
| Background task killing | Server-driven logic |
| Legal exposure | Non-diagnostic language |

---

## 13. One-Sentence Pitch

> “SafeCheck is a quiet safety net for people living alone — it only speaks up when silence lasts too long.”

