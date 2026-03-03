# Gainx — 1-Week MVP Plan (~1 hour/day)

## Progress
- Day 1: Completed (Flutter scaffold, deps, structure, validation)
- Day 2: Completed (Clerk auth flow, auth gate, profile setup, validation)
- Next: Day 3 — AI Plan Generation Backend

## Goal
Build a working MVP Flutter app: AI generates a weekly training plan, user logs workouts (reps, weight, effort 1-10), basic volume analytics. Scoped tight for 7 hours total.

## Tech Stack
- **Frontend:** Flutter (iOS + Android)
- **Backend:** Firebase (Auth, Firestore, Cloud Functions)
- **AI:** OpenAI API (via Cloud Functions)
- **Auth:** Clerk (Email + Google + Apple)

## MVP Scope (In / Out)

**IN:**
- Clerk sign-in (Email + Google + Apple)
- Quick profile (experience level, goal, equipment — single screen)
- AI generates weekly plan (OpenAI via Cloud Function)
- View weekly plan (day-by-day exercise list)
- Active workout: log sets with reps, weight, effort (1-10)
- Workout history list
- Basic volume chart (total volume per workout over time)
- Simple overload suggestion (badge/text on exercises)

**OUT (post-MVP):**
- AI chat for exercise substitutions
- Per-muscle-group analytics
- Effort/RPE trend charts
- Notifications/reminders
- Dark mode / advanced theming
- Offline-first architecture

---

## Daily Plan

### Day 1 — Project & Firebase Setup
- `flutter create gainx`, set up folder structure
- Add dependencies: firebase_core, cloud_firestore, flutter_riverpod, fl_chart, clerk_flutter
- Create Firebase project, download google-services.json / GoogleService-Info.plist
- Configure Firebase in Flutter (main.dart init)
- Scaffold folder structure (models/, services/, providers/, screens/, widgets/)

### Day 2 — Authentication
- Integrate Clerk SDK (email sign-up/in, Google sign-in, Apple sign-in, sign-out)
- Create AuthProvider (Riverpod)
- Build login screen (email + Google + Apple buttons)
- Build signup screen
- Add auth state listener → route to home or login
- Quick profile setup screen (experience, goal, equipment dropdowns → save to Firestore `users/{clerkUserId}`)

### Day 3 — AI Plan Generation (Backend)
- Init Cloud Functions (TypeScript)
- Write `generatePlan` callable function:
  - Receives: user profile (experience, goal, equipment)
  - Builds OpenAI prompt → requests structured JSON weekly plan
  - Validates response shape, returns plan
- Deploy function
- Create Flutter AiService that calls the Cloud Function
- Create PlanProvider (Riverpod)

### Day 4 — Plan UI & Storage
- Define TrainingPlan and Exercise models (Dart)
- Save AI-generated plan to Firestore (`users/{uid}/plans/{planId}`)
- Build "Generate Plan" screen with loading state
- Build weekly plan view: tab/swipe per day, list of exercises with sets × reps × target weight
- "Start Workout" button on each day

### Day 5 — Workout Logging
- Define WorkoutLog model
- Build active workout screen:
  - Pre-populated from plan day's exercises
  - For each exercise: expandable card with set rows
  - Each set row: reps input, weight input, effort slider (1-10)
  - "Complete Workout" button
- Save log to Firestore (`users/{uid}/workoutLogs/{logId}`)
- Create WorkoutProvider

### Day 6 — History & Analytics
- Build workout history screen (list of past workouts, date + summary)
- Tap → detail view showing all exercises/sets logged
- Build basic volume chart:
  - X-axis: workout date, Y-axis: total volume (Σ sets×reps×weight)
  - Use fl_chart LineChart
- Create AnalyticsProvider that queries logs and computes volume

### Day 7 — Overload Suggestions & Polish
- Implement simple overload logic (on-device in OverloadService):
  - Compare last 2 sessions for same exercise
  - If effort ≤ 7 and target reps hit → show "↑ Increase weight" suggestion
  - If effort ≥ 9 → show "→ Maintain or deload"
- Display suggestion badges on plan view next to exercises
- Wire up navigation (bottom nav: Plan, Workout, History, Profile)
- Basic error handling (try/catch on network calls, snackbar errors)
- Test full flow end-to-end, fix bugs

---

## Data Model (Firestore)

### `users/{uid}`
```
{ displayName, email, createdAt,
  profile: { experience, goal, equipment } }
```

### `users/{uid}/plans/{planId}`
```
{ name, createdAt, splitType,
  days: [{ dayName, exercises: [{ name, sets, targetReps, targetWeight }] }] }
```

### `users/{uid}/workoutLogs/{logId}`
```
{ planId, dayIndex, date, completedAt,
  exercises: [{ name, sets: [{ reps, weight, effort }] }] }
```

## Folder Structure
```
lib/
  main.dart
  app.dart
  models/        (user_profile, training_plan, workout_log)
  services/      (auth_service, firestore_service, ai_service, overload_service)
  providers/     (auth, plan, workout, analytics)
  screens/       (auth/, plan/, workout/, analytics/, profile/)
  widgets/       (common/, charts/)
functions/
  src/
    index.ts
    generatePlan.ts
```

## Day 2 Detailed Execution Plan (Clerk auth)

### Objective
Ship complete authentication flow with Clerk (Email, Google, Apple) plus initial profile capture.

### Current State
- Flutter scaffold exists with dependencies installed.
- App is still default counter app (`lib/main.dart`), no auth code yet.
- `day2-auth` is ready to start in todo tracker.

### Implementation Steps
1. **App shell & routing**
   - Replace default `main.dart` with Firebase init + Riverpod `ProviderScope`.
   - Add simple auth gate widget (signed-in -> placeholder home, signed-out -> login).
2. **Clerk integration**
   - Add Clerk Flutter SDK and configure publishable key.
   - Create `lib/services/auth_service.dart` wrapping Clerk methods:
     - Email sign up / sign in / sign out
     - Google sign in
     - Apple sign in
3. **Auth state management**
   - Create `lib/providers/auth_provider.dart` exposing Clerk session state and auth actions.
4. **Auth UI**
   - Build `screens/auth/login_screen.dart`:
     - Email/password form
     - Continue with Google button
     - Continue with Apple button
     - Link to signup screen
   - Build `screens/auth/signup_screen.dart` for email registration.
5. **Profile onboarding**
   - Build `screens/profile/profile_setup_screen.dart` with 3 fields:
     - experience (beginner/intermediate/advanced)
     - goal (hypertrophy/strength/fat-loss)
     - equipment (gym/home/minimal)
   - Save to `users/{clerkUserId}` in Firestore.
6. **Flow wiring**
   - First login with missing profile -> profile setup screen.
   - Profile exists -> placeholder home screen.
7. **Validation**
   - `flutter analyze`
   - `flutter test`
   - Manual smoke check: email signup/login, Google login, Apple login, profile save.

### Risks / Notes
- Clerk dashboard OAuth setup (Google/Apple) is required before runtime testing.
- Apple Sign-In still requires iOS capability setup.

## Key Decisions
- **Riverpod** for state management
- **Clerk for all auth providers** in Day 2 (Email + Google + Apple)
- **Overload logic on-device** (no Cloud Function needed for MVP)
- **Single volume chart** for MVP (per-muscle breakdown later)
- **No offline mode** for MVP (Firestore has basic offline caching by default)
