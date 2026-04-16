# MiniTA Mobile App

## Description
AI Teaching Assistant – React Native / Expo mobile app.

## Features
(mention features here)

---

## ⚡ Quick Start (2 steps)

### 1. Install dependencies

```bash
npm install
```

### 2. Run on simulator

```bash
# iOS Simulator (Mac only)
npm run ios

# Android Emulator
npm run android

# Or open interactively (scan QR with Expo Go app)
npm start
```

---

## 📁 Project Structure

```
minita-app/
├── App.tsx                         # Root – tab navigation
├── index.js                        # Expo entry point
├── app.json                        # Expo config (name, icons, splash)
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
├── babel.config.js                 # Babel config
├── assets/                         # App icons & splash screen
│   ├── icon.png
│   ├── splash.png
│   ├── adaptive-icon.png
│   └── favicon.png
└── src/
    ├── data/
    │   └── index.ts                # All tasks, events, AI replies, helpers
    ├── styles/
    │   └── shared.ts               # Shared colors, shadows, StyleSheet
    ├── navigation/                 # (reserved for future use)
    ├── components/
    │   ├── Header.tsx              # Top header (logo + avatar + bell)
    │   ├── TabBar.tsx              # Bottom tab bar (4 tabs)
    │   ├── TaskCard.tsx            # Reusable task card
    │   └── modals/
    │       ├── TaskDetailModal.tsx  # Task detail bottom sheet
    │       ├── EventDetailModal.tsx # Calendar event detail
    │       ├── ConflictModal.tsx    # Schedule conflict warning
    │       └── AddStudyModal.tsx    # Add study block form
    └── screens/
        ├── DashboardScreen.tsx     # Main dashboard (tasks, search)
        ├── CalendarScreen.tsx      # Weekly calendar view
        ├── AIChatScreen.tsx        # MiniTA AI chat interface
        └── SettingsScreen.tsx      # Settings & toggles
```

---

## ✅ Interactive Features

### Dashboard
| Feature | Action |
|---|---|
| Search bar | Filters tasks live as you type |
| Checkboxes | Tap to mark tasks done (strikethrough) |
| View Details | Opens bottom sheet with full info |
| Mark Complete | Marks task done from detail modal |
| + Study Block | Opens form to add a personal block |
| Summary chips | Done chip → Calendar; Overdue → filters |
| Pro Tip button | Navigates to AI Chat tab |

### Calendar
| Feature | Action |
|---|---|
| Day pills | Tap to switch day view |
| Wednesday | Auto-shows conflict warning |
| Conflict banner | Tap to re-open conflict modal |
| Event blocks | Tap for event detail modal |
| Reschedule CTA | Shows action confirmation |

### AI Chat
| Feature | Action |
|---|---|
| Prompt chips | Send pre-written questions instantly |
| Type + Send | Real AI-style responses with typing animation |
| 📎 attach | Placeholder attachment button |
| Clear button | Resets chat to initial message |

### Settings
| Feature | Action |
|---|---|
| Dark Mode | Toggle on/off |
| High Contrast | Toggle on/off |
| Push Notifications | Toggle on/off |
| Large Text | Toggle on/off |
| All row items | Tap for Alert feedback |
| Sign Out | Confirmation dialog |

---

## 🎨 Design Tokens

| Token | Value |
|---|---|
| Primary (Canvas Red) | `#BC0001` |
| AI Purple | `#7C3AED` |
| Physics Blue | `#3B82F6` |
| Math Green | `#22C55E` |
| History Orange | `#F97316` |
| CS Red | `#DC2626` |
| Personal Purple | `#A855F7` |

---

## 🛠 Requirements

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`) or `npx expo`
- Xcode (iOS simulator) or Android Studio (Android emulator)
- Or install **Expo Go** on a physical device and scan the QR code from `npm start`
