# MiniTA - AI Teaching Assistant

MiniTA is a React Native + Expo web application built as a student productivity assistant. It combines account login, a dashboard, assignment tracking, custom study blocks/tasks, a calendar, a local MiniTA chatbot demo, and user settings in one cohesive app.

The final solution is designed to run locally without requiring an API key, backend, or database. Seeded assignment data simulates synced course data, while user-created study blocks/tasks and account data are stored locally.

## Team Feature Classes

| No. | Feature/Class | Contributor(s) |
| --- | --- | --- |
| 1 | User Account Login Class | Hazel White |
| 2 | MiniTA Chat Bot Class | Ricky Lu |
| 3 | Calendar and Drag-and-Drop Rescheduling Class | Khoa Minh & Hazel White |
| 4 | User Settings and Appearance Class | Hazel White |
| 5 | Dashboard, Search, and Navigation Class | Ngoc Tran |

## How To Run

Install dependencies:

```bash
npm install
```

Run the web app:

```bash
npm run web
```

Expo usually opens the app in the browser. If it does not, open:

```text
http://localhost:8081
```

If the app shows stale behavior after recent edits, restart Expo with a cleared cache:

```bash
npx expo start --web --clear
```

## Important Notes

- No `.env` file is required.
- No Gemini/API key is required in this final version.
- The MiniTA chatbot runs in local demo mode using built-in responses.
- User accounts are stored locally for the demo.
- Seeded assignments simulate class data that would normally come from a backend.

## Feature/Class Details

### 1. User Account Login Class

Contributor: Hazel White

This class controls the login and registration flow. It allows a user to create a local MiniTA account, log in with a NetID and password, and access the main app only after authentication.

Main files:

- `src/screens/LoginScreen.tsx`
- `src/services/authStorage.ts`
- `App.tsx`

Responsibilities:

- Display login and registration forms.
- Validate that required fields are filled in.
- Create a local account using first name, last name, NetID, and password.
- Hash passwords before storing them.
- Store user records locally.
- Log users in by checking the entered NetID and password hash.
- Reset session state when the user logs out.

How it works:

- `LoginScreen.tsx` handles the UI for login and registration.
- `authStorage.ts` handles local account storage, password hashing, login checks, registration checks, and password updates.
- `App.tsx` stores the active user in `currentUser`. If no user is logged in, only the login screen is shown. After login, the dashboard and navigation become available.

### 2. MiniTA Chat Bot Class

Contributor: Ricky Lu

This class controls the MiniTA AI page. In the final repo-ready version, the chatbot runs locally instead of connecting to Gemini. This makes the project easier to run and present without managing API keys or external service errors.

Main files:

- `src/screens/AIChatScreen.tsx`
- `src/data/index.ts`

Responsibilities:

- Show the MiniTA Assistant chat page.
- Display starter conversation messages.
- Let the user type questions.
- Provide suggested prompt chips.
- Return useful local responses for due dates, study plans, grade calculations, and exam tips.
- Show a typing animation for a more natural chat experience.

How it works:

- `AIChatScreen.tsx` stores chat messages in local React state.
- When a user sends a message, the app immediately adds the user message to the conversation.
- The app waits briefly, then calls `localMiniTAReply()`.
- `localMiniTAReply()` first checks for an exact prompt match in `AI_REPLIES`.
- If there is no exact match, it uses keywords such as `due`, `deadline`, `study`, `plan`, `grade`, `final`, `physics`, and `quiz` to choose the best local response.
- If no keyword matches, MiniTA gives a general help message.

Why local mode is used:

- It avoids blank-page crashes caused by API setup issues.
- It avoids committing API keys.
- It keeps the final branch ready for the actual repository.
- It still demonstrates the intended chatbot workflow and UI behavior.

### 3. Calendar and Drag-and-Drop Rescheduling Class

Contributors: Khoa Minh & Hazel White

This class controls the calendar page, monthly/weekly calendar views, event details, custom task/study-block creation, and drag-and-drop rescheduling.

Main files:

- `src/screens/CalendarScreen.tsx`
- `src/components/modals/AddStudyModal.tsx`
- `src/data/index.ts`
- `App.tsx`

Responsibilities:

- Show a monthly calendar view.
- Show a weekly calendar view.
- Display seeded assignments, quizzes, and exams.
- Display user-created personal tasks.
- Display user-created study blocks.
- Show event details in the right-side detail panel.
- Create custom study blocks or tasks.
- Move custom tasks to another day.
- Move custom study blocks to another day/time.
- Resize custom study blocks in the weekly time grid.
- Prevent custom study blocks from overlapping with other study blocks.

Monthly view behavior:

- Seeded assignments and custom items appear on their assigned dates.
- Clicking an event shows details in the side panel.
- Custom items can be dragged to another day.
- Dragging a task changes its due date.
- Dragging a study block changes its date while keeping its time and duration.

Weekly view behavior:

- Seeded assignments, quizzes, exams, and custom tasks appear in the `All day` row.
- Custom study blocks appear on the hourly grid.
- Study block height represents duration.
- Study block vertical position represents start time.
- Study blocks can be dragged to another day/time slot.
- Study blocks can be resized using the handle at the bottom.
- Custom tasks can be dragged between days in the all-day row.

Conflict handling:

- If a moved or resized study block overlaps another study block, the app blocks the change and shows a warning.
- The original study block is not deleted or duplicated.

Data flow:

- `App.tsx` stores `extraBlocks`, which are custom user-created tasks/study blocks.
- `CalendarScreen.tsx` receives `extraBlocks`, `addBlock`, and `updateBlock`.
- `AddStudyModal.tsx` creates or edits an `ExtraBlock`.
- Updating an `ExtraBlock` immediately syncs the dashboard and calendar.

### 4. User Settings and Appearance Class

Contributor: Hazel White

This class controls the Settings page, account information, password changes, notification preferences, and appearance controls.

Main files:

- `src/screens/SettingsScreen.tsx`
- `src/services/authStorage.ts`
- `src/styles/shared.ts`
- `App.tsx`

Responsibilities:

- Display user profile information.
- Display enrolled courses and account details.
- Allow password updates.
- Toggle notification settings.
- Toggle dark mode.
- Keep light and dark themes consistent across screens.

Dark mode:

- The app uses a shared theme object.
- `App.tsx` stores the `darkMode` state.
- `src/styles/shared.ts` defines both `lightTheme` and `darkTheme`.
- Screens receive the active `theme` through props.
- The dark mode style uses dark grays, black tones, and gold accent colors.

Password updates:

- The Settings page asks for current password, new password, and confirmation.
- The local auth service checks the current password hash.
- If the password is correct, the stored password hash is updated.

### 5. Dashboard, Search, and Navigation Class

Contributor: Ngoc Tran

This class controls the main dashboard, assignment cards, search behavior, status badges, mini-calendar, navigation, and dashboard-to-calendar/dashboard-to-AI shortcuts.

Main files:

- `src/screens/DashboardScreen.tsx`
- `src/components/TaskCard.tsx`
- `src/components/TabBar.tsx`
- `src/components/Header.tsx`
- `src/data/index.ts`
- `App.tsx`

Responsibilities:

- Display seeded assignments in card form.
- Display custom tasks and study blocks in the same visual style as assignment cards.
- Separate assignments into upcoming, overdue, and completed sections.
- Track completion using checkboxes.
- Show status badges for upcoming, overdue, and done counts.
- Search assignments, courses, types, and due dates.
- Show a dashboard mini-calendar.
- Let the user click mini-calendar events to focus matching dashboard cards.
- Navigate to Calendar from the mini-calendar.
- Navigate to MiniTA AI from the recommendation section.

Dashboard behavior:

- Seeded tasks come from `TASKS`.
- Seeded task dates come from `TASK_DATES`.
- Custom tasks and study blocks come from `extraBlocks`.
- Completion state is stored in `checked`.
- Searching filters seeded tasks and brings matching results to the top.
- Clicking a mini-calendar item fills search with that item title and focuses the matching card.

## Data Model Overview

### `Task`

`Task` represents seeded course assignments.

Important fields:

- `id`: unique seeded task id
- `title`: assignment name
- `course`: course key such as `CS`, `PHY`, `MATH`, `HIST`, or `SELF`
- `due`: readable due date text
- `type`: homework, quiz, exam, essay, project, etc.
- `status`: `overdue` or `upcoming`
- `detail`: full description shown in detail views

### `ExtraBlock`

`ExtraBlock` represents user-created study blocks or personal tasks.

Important fields:

- `id`: unique custom item id
- `title`: custom item name
- `course`: assigned course or `SELF`
- `itemType`: `study` or `task`
- `dateISO`: calendar date
- `dueDateISO`: due date for tasks
- `startHour`: start time for study blocks
- `endHour`: end time for study blocks
- `durationSeconds`: exact duration for study blocks
- `notes`: custom description

### `COURSES`

`COURSES` controls course names and colors. The same course color is reused across dashboard cards, calendar events, badges, and detail views.

## Main File Map

```text
App.tsx
  Shared app state, active user, navigation tab, dark mode, checked tasks, custom blocks

index.js
  Expo entry point

babel.config.js
  Expo Babel configuration

src/data/index.ts
  Seeded assignments, course colors, chatbot replies, calendar helpers, shared types

src/services/authStorage.ts
  Local account registration, login, password hashing, password updates

src/styles/shared.ts
  Shared light/dark themes and reusable styles

src/screens/LoginScreen.tsx
  Login and registration page

src/screens/DashboardScreen.tsx
  Dashboard cards, search, status badges, mini-calendar, custom item cards

src/screens/CalendarScreen.tsx
  Monthly view, weekly view, all-day row, timed study blocks, drag/drop, resize

src/screens/AIChatScreen.tsx
  Local MiniTA chatbot demo

src/screens/SettingsScreen.tsx
  Profile, account settings, password update, notifications, dark mode

src/components/Header.tsx
  Shared top header, notification dropdown, profile shortcut

src/components/TabBar.tsx
  Desktop sidebar and mobile bottom navigation

src/components/TaskCard.tsx
  Seeded assignment card

src/components/modals/AddStudyModal.tsx
  Create/edit study blocks and tasks

src/components/modals/TaskDetailModal.tsx
  Seeded assignment detail modal

src/components/modals/NotificationModal.tsx
  Seeded notification modal

src/components/modals/EventDetailModal.tsx
  Calendar event detail modal for legacy event objects

src/components/modals/ConflictModal.tsx
  Demo conflict warning modal
```

## Current Functionality Checklist

- Login and registration
- Local password hashing
- Dashboard task cards
- Upcoming, overdue, and done sections
- Completion checkboxes
- Dashboard search
- Dashboard mini-calendar
- Create custom study blocks
- Create custom personal tasks
- Edit custom study blocks/tasks
- View custom item details
- Monthly calendar view
- Weekly calendar view
- Weekly all-day row
- Timed study block display
- Drag custom tasks between days
- Drag custom study blocks between calendar days/times
- Resize custom study blocks
- Conflict warning for overlapping study blocks
- Settings profile view
- Password update screen
- Notification settings
- Dark mode
- Local MiniTA chatbot demo

## Known Limitations

- There is no backend database.
- Seeded assignments are hardcoded demo data.
- Custom tasks/study blocks reset when the user logs out or refreshes, because they are stored in app state.
- The MiniTA chatbot is local demo logic, not a live AI model.
- Seeded assignments are not draggable because they represent simulated synced course data.
- Calendar drag-and-drop is meant as a working demo interaction, not a full production scheduler.

## Suggested Future Improvements

- Add a backend database for persistent tasks, users, courses, and study blocks.
- Connect seeded assignments to a real course/syllabus source.
- Re-add a live AI provider through a backend proxy instead of exposing API keys in the frontend.
- Persist custom study blocks/tasks between sessions.
- Add conflict side-by-side display instead of only blocking overlap.
- Add better mobile drag-and-drop affordances.
- Add unit tests and end-to-end tests.

## Verification

The final local branch has been checked with:

```bash
npx tsc --noEmit
```

This confirms the TypeScript project compiles successfully.
