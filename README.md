## Supabase Notes App (Vanilla JS)

A minimal notes app using Supabase Auth + Database with a modern Tailwind UI. No build tools required — open `index.html` in a browser and go.

### Highlights
- **Zero-build**: Pure HTML/CSS/JS. Open and run.
- **Modern UI**: Tailwind CDN, gradient dark theme, glass panels, responsive layout.
- **Smooth feedback**: Top-right toast/loader (no alerts) + inline loader for notes fetch.
- **Auth**: Email/password sign up, login, logout; session remembered.
- **CRUD**: Create, read, update, delete personal notes with titles.
- **Per-user data**: Row Level Security restricts notes to the owning user.

### UI Features
- **Header**: App title with gradient text; `Logout` button shows only when logged in.
- **Auth section**: Email/password inputs; `Sign Up` and `Login` buttons.
- **Toast/Loader**: Non-blocking toast in the top-right for progress/success/error; auto-hides.
- **Notes section** (after login):
  - **Search**: Live filter by title or content.
  - **Add**: Title and content inputs with compact spacing, aligned placeholders.
  - **Inline edit**: Click `Edit` on a card to load that note into the top inputs, then `Save Changes` or `Cancel`.
  - **List**: Note cards with `Edit` and `Delete` actions; subtle borders and hover states.
  - **Empty state**: Friendly card when there are no notes.

### Functionality
- **Authentication**
  - Email/password sign up and login using Supabase Auth (`@supabase/supabase-js@2`).
  - Session is checked on page load; UI toggles between Auth and Notes.
  - Header `Logout` only visible when authenticated.
- **Notes CRUD**
  - Reads notes ordered by `created_at` (desc).
  - Creates notes with `title` and `content` tied to the current user (`user_id`).
  - Inline edit via the top form; `Save Changes` updates, `Cancel` resets the form.
  - Client-side search over title/content; inline loader during fetch; toast feedback for actions and validation.
- **Security**
  - RLS policies ensure users only see and modify their own notes.

### Tech Stack
- **Frontend**: Vanilla JS, Tailwind CSS via CDN
- **Backend**: Supabase Auth + Postgres (via Supabase)
- **Client**: `@supabase/supabase-js@2` (loaded from CDN)

### Project Structure
- **`index.html`**: App shell, Tailwind, header logout, auth and notes sections, toast/loader
- **`app.js`**: Auth flows, session handling, CRUD, search, inline edit, UI updates, toast helpers
- **`styles.css`**: Legacy custom styles (not used by the Tailwind UI)

### Setup
1. **Create a Supabase project** and copy your Project URL and anon key.
2. **Configure keys** in `app.js`:
   - Replace `SUPABASE_URL` and `SUPABASE_ANON_KEY` with your own values.
3. **Create the database schema** 
4. **Open** `index.html` in your browser.

### Usage
- **Sign Up/Login**: Enter email + password, click the relevant button.
- **Add Note**: Enter title and content; click `Add Note`.
- **Edit Note**: Click `Edit` on any card, modify using the top inputs, then `Save Changes` (or `Cancel`).
- **Search**: Use the search box to filter by title/content.
- **Delete Note**: Click `Delete` on a card.
- **Logout**: Click `Logout` in the header.

### Notes
- The schema includes `title` and `content`, and the UI uses both.
- For production, prefer loading Tailwind via a build step and store keys using environment variables. The keys in `app.js` are client-side keys intended for public use in Supabase.
