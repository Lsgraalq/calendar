# calendar — equipment booking tool

> **Created: June 2025** — commercial project (booking / scheduling tool).

A **booking and scheduling web app** for managing shared equipment — users can reserve items on a calendar, add notes and events, and manage an equipment catalog. Built as a commercial tool with a modern **Next.js + Firebase** stack.

## Features

- 📅 **Interactive calendar** built on [FullCalendar](https://fullcalendar.io/) (day grid, time grid, and interaction plugins) with three entry types: **events**, **notes**, and **bookings**.
- 🛠️ **Equipment management** — list, view details, and add equipment; bookings can be tied to specific equipment.
- 🔐 **Authentication** — email/password sign-up and login via Firebase Auth, with protected routes and redirects.
- 👤 **User profiles** — personal profile page, public profiles by UID, and a users directory.
- ☁️ **Realtime data** with Cloud Firestore (`onSnapshot`) and file storage via Firebase Storage.
- 🛡️ **Firebase App Check** (reCAPTCHA v3) for abuse protection.
- 💡 Tooltips (Tippy.js), icons (react-icons), and Flowbite/Tailwind UI.

## Tech stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Firebase** — Auth, Firestore, Storage, App Check
- **FullCalendar**, react-calendar
- **Tailwind CSS 4**, Flowbite, Tippy.js, react-icons

## Project structure

| Path                     | Purpose |
|--------------------------|---------|
| `src/app/calendar/`      | Main calendar page. |
| `src/app/equipment/`     | Equipment list, detail (`[id]`), and add pages. |
| `src/app/profile/`       | Own profile and public profiles (`[uid]`). |
| `src/app/login`, `signup`| Auth pages. |
| `src/app/users/`         | Users directory. |
| `src/components/`         | Calendar, Navbar, auth buttons. |
| `src/firebase/`          | Firebase config + App Check init. |
| `src/lib/`, `src/utils/` | User document helpers and data fetching. |

## Getting started

Create a `.env.local` with your Firebase credentials:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

Then:

```bash
npm install
npm run dev
```

Open http://localhost:3000.
