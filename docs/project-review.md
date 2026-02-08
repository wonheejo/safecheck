# SafeCheck — Full Project Review

## Backend & Infrastructure
- [x] Supabase project set up (ref: ncslcqdcbzfglfoozrtz)
- [x] Database migrations deployed (users, trusted_contacts, check_ins, alerts_log)
- [x] Row-level security policies configured
- [x] pg_cron and pg_net extensions enabled
- [x] Firebase project created (safecheck-372f1)
- [x] google-services.json + GoogleService-Info.plist placed
- [x] Twilio account set up (phone: +12272300413)
- [x] 3 Edge Functions deployed (check-in, monitor-inactivity, send-reminders)
- [x] FCM v1 API configured (service account JSON in Supabase secrets)
- [x] Backend tested and working (all edge functions return success)

## App Features & Code
- [x] React Native 0.76.3 project scaffolded
- [x] TypeScript configured (moduleResolution=bundler, module=esnext)
- [x] Supabase client + auth helpers
- [x] Google Sign-In authentication
- [x] Forgot Password flow
- [x] Navigation (Auth stack + Main stack)
- [x] Check-in logic (auto on foreground + manual)
- [x] Trusted contacts CRUD (up to 3, E.164 phone format)
- [x] FCM push notification setup
- [x] Settings screen (inactivity threshold, grace period, quiet hours)
- [x] Terms of Service screen (in-app)
- [x] Privacy Policy screen (in-app)
- [x] Consent screen with ToS/Privacy agreement

## App Icon & Splash Screen
- [x] Icon generation script (`scripts/generate-icons.js` using sharp)
- [x] iOS icons — 9 PNGs (40px to 1024px), black "SC" on white
- [x] Android icons — 10 PNGs (48px to 192px, square + round)
- [x] Android adaptive icon — black SC vector foreground, white background
- [x] iOS LaunchScreen.storyboard — black "SC" 72pt bold, centered, white bg
- [x] Android SplashTheme — white background, switches to AppTheme in onCreate
- [x] iOS build verified on iPhone 16 Pro simulator

## Store Submission Prep
- [x] Developer accounts — Signed up for Apple Developer + Google Play Developer (awaiting approval)
- [x] GitHub repo set to public (for GitHub Pages hosting)
- [x] Privacy Policy hosted — https://wonheejo.github.io/safecheck/privacy-policy.html
- [x] Terms of Service hosted — https://wonheejo.github.io/safecheck/terms-of-service.html
- [x] Android release keystore generated (alias: safecheck, 10,000 day validity)
- [x] Release signing config in build.gradle (credentials in ~/.gradle/gradle.properties)
- [x] Store metadata drafted — `docs/store-metadata.md` (English + Korean descriptions, categories, keywords, content rating)

## Git & Deployment
- [x] GitHub repo: wonheejo/safecheck (main branch, public)
- [x] All code committed and pushed (latest: e1d9928)
- [x] .env and keystore properly gitignored

---

## Remaining Tasks
- [ ] **Restrict Firebase API key** — Add Android app restriction in Google Cloud Console
- [ ] **Configure iOS production build** — Needs Apple Developer account for provisioning profiles + distribution certificate
- [ ] **End-to-end testing on real device** — Google Sign-In + FCM won't work on simulator
- [ ] **Capture store screenshots** — Both stores, on real device
- [ ] **Finalize version number** — Align across package.json and build.gradle
- [ ] **Review store metadata** — User to review docs/store-metadata.md
