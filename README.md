# Next.js Control Panel for ISDN 2602

Student manual for the control panel can be found here: https://aioscout.io/FinalProjectDocs/controlPanel/

## Set up

- Create a Firebase project with a Realtime Database, then copy `.env.example` to `.env.local` and fill in your Firebase config.
- The expected database structure is documented in [`docs/database-template.json`](docs/database-template.json); traffic lights auto-initialize on first access, so an empty database also works.
- Install dependencies with `npm install`
- Run in dev mode with `npm run dev`

## Design

- Auth with Firebase; admins are identified by a uid whitelist (`ADMIN_WHITELIST`), there is no separate role system
- Each student gets their own exam state at `users/{uid}/examState` (field, task, route, countdown), created on first login by `initializeUserData`, isolated between users
- Traffic lights are global shared data: a single copy at `admin/trafficLights`, read by everyone through the public API, writable only by admins; state changes are driven by an open admin page calling `/api/traffic-lights/update` once per second while students only poll for display, and the data auto-initializes on first access
- Demo mode (`demoMode/active`): when on, everyone (students included) reads and writes the same admin-path data, with `canWrite()` restricting writes to admins at the app level; when off, each user works on their own user path
- System settings: admins maintain the `settings` node (`maxPoints`, `countdownTime`, `numberOfTasks`) on the `/settings` page; it provides defaults when initializing a new user's exam state
- Architecture: Next.js API routes only handle traffic lights (public read, auto-init, state updates); exam state, settings and auth logic all talk to Firebase directly from client components
- Extras: presence tracking with auto logout on timeout, plus an active users monitor for admins
