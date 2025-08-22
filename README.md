## Supabase Notes App (Vanilla JS)

A minimal notes app using Supabase Auth + Database with a modern Tailwind UI. No build tools required — open `index.html` in a browser and go.

### Highlights
- **Zero-build**: Pure HTML/CSS/JS. Open and run.
- **Modern UI**: Tailwind CDN, gradient dark theme, glass panels, responsive layout.
- **Smooth feedback**: Top-right toast/loader replaces alerts; inline loader for notes fetch.
- **Auth**: Email/password sign up, login, logout.
- **CRUD**: Create, read, update, delete personal notes.
- **Per-user data**: Row Level Security restricts notes to the owning user.

### UI Features
- **Header**: App title with gradient text; `Logout` button appears only when logged in.
- **Auth section**:
  - Email and password inputs with focus rings and validation-friendly styling
  - `Sign Up` (accent) and `Login` (neutral) buttons
- **Toast/Loader**:
  - Non-blocking toast in the top-right for progress/success/error messages
  - Auto-hides after short actions; spinner shows during longer operations
- **Notes section** (visible after login):
  - Add note input + `Add` button
  - Grid list of note cards with `Edit` and `Delete` actions
  - Subtle card borders, dark glass, and hover feedback
  - Inline loader shown while fetching notes

### Functionality
- **Authentication**
  - Email/password sign up and login using Supabase Auth (`@supabase/supabase-js@2`)
  - Session checked on page load; UI toggles between Auth and Notes
  - Header `Logout` shown only when a session exists; hidden after sign out
- **Notes CRUD**
  - Reads notes ordered by `created_at` (desc)
  - Creates notes tied to the current user (`user_id`)
  - Inline `Edit` (prompt) and `Delete` actions update the list immediately
  - UI loaders during fetch and toasts for all actions
- **Security**
  - RLS policies ensure users only see and modify their own notes
  - Policies defined in `supabase/sql/setup.sql`

### Tech Stack
- **Frontend**: Vanilla JS, Tailwind CSS via CDN
- **Backend**: Supabase Auth + Postgres (via Supabase)
- **Client**: `@supabase/supabase-js@2` (loaded from CDN)

### Project Structure
- **`index.html`**: App shell, Tailwind, sections for Auth and Notes, header logout, toast/loader
- **`app.js`**: Auth flows, session handling, CRUD, UI updates, toast helpers
- **`styles.css`**: Legacy custom styles (not used by the Tailwind UI)
- **`supabase/sql/setup.sql`**: Database schema and RLS policies

### Setup
1. **Create a Supabase project** and copy your Project URL and anon key.
2. **Configure keys** in `app.js`:
   - Replace `SUPABASE_URL` and `SUPABASE_ANON_KEY` with your own values.
3. **Create the database schema** (optional if starting fresh):
   - Run the SQL from `supabase/sql/setup.sql` in the Supabase SQL editor.
4. **Open** `index.html` in your browser.

### Usage
- **Sign Up**: Enter email + password and click `Sign Up` (verify email if required in your project settings).
- **Login**: Enter credentials and click `Login`.
- **Add Note**: Type a note and click `Add`.
- **Edit/Delete**: Use the `Edit`/`Delete` buttons on each note card.
- **Logout**: Click `Logout` in the header.

### Notes
- The schema includes `title` and `content`, but the current UI uses only `content`.
- For production, prefer loading Tailwind via a build step and store keys using environment variables. The keys in `app.js` are client-side keys intended for public use in Supabase.
