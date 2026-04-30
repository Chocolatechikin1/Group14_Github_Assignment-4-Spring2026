# MiniTA — fixed build

A React Native + Expo app, runs on iOS, Android, and web.

## Setup (first time)

```bash
npm install
```

If you hit `EMFILE: too many open files` on macOS, install Watchman:
```bash
brew install watchman
```

## Run

Web (in your browser at http://localhost:8081):
```bash
npm run web
```

iOS / Android / dev menu:
```bash
npx expo start
```
Then press `w` for web, `i` for iOS simulator, `a` for Android, or scan the QR
code with Expo Go on your phone.

## What changed in this build

**DashboardScreen**
- Web/desktop layout with a max-width centered container.
- Right-hand class schedule sidebar (Mon–Fri, 6 AM–10 PM) appears on screens
  ≥ 900 px wide. Class blocks are positioned by start/end time and colored by
  course.
- Summary chips (Overdue / Upcoming / Done / Study) now filter the visible
  task list. An active filter shows a banner across the top with a "Show all"
  shortcut.
- The Done count is derived from your toggled checkboxes.

**TaskDetailModal**
- "Mark as Complete" is now a real toggle — re-tap to mark incomplete.
- A green banner shows when a task is marked complete.

**Header → NotificationModal** (new)
- The bell icon now opens a modal with seeded notifications, unread dots,
  per-item "tap to mark read", and a "Mark all as read" action.

**AddStudyModal**
- Day-of-week picker, start time picker (8 AM–7 PM in 30-min steps), and
  duration. Live preview shows the scheduled day & time.

**Calendar sync**
- Custom study blocks added on the Dashboard now show up in the Calendar
  week grid alongside scheduled events.

**Shared state**
- Completed tasks (`checked`) and custom study blocks (`extraBlocks`) are
  lifted into App.tsx so the Dashboard and Calendar share one source of
  truth.

## File map

```
App.tsx                                  ← shared state lives here
src/data/index.ts                        ← TASKS, COURSES, CAL_EVENTS, ExtraBlock type
src/screens/
  DashboardScreen.tsx                    ← redesigned (class schedule + filters)
  CalendarScreen.tsx                     ← merges extra blocks into the grid
  AIChatScreen.tsx
  SettingsScreen.tsx
  LoginScreen.tsx
src/components/
  Header.tsx                             ← bell opens NotificationModal
  TaskCard.tsx
  TabBar.tsx
  modals/
    TaskDetailModal.tsx                  ← Mark-as-Complete toggle
    AddStudyModal.tsx                    ← day + start time pickers
    NotificationModal.tsx                ← NEW
    EventDetailModal.tsx
    ConflictModal.tsx
src/styles/shared.ts
```
