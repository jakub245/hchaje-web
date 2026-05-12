
  # Web redesign for hchaje.cz

  This is a code bundle for Web redesign for hchaje.cz. The original project is available at https://www.figma.com/design/RwQLVy8myryXEcqyqXvRTv/Web-redesign-for-hchaje.cz.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Web3Forms - Contact Form (`/chci-se-pridat`)

  The "Chci se přidat" (Recruitment) page uses Web3Forms to handle form submissions.

  **Setup:**

  1. Create account at https://web3forms.com
  2. Create new form and configure:
     - Recipient Email (where form notifications are sent)
     - Email Subject
     - Sender Name
     - Leave Redirect URL empty (custom success message used)
  3. Verify email (confirmation link will be sent)
  4. Copy the access key (UUID)

  **Environment variable:**

  ```bash
  VITE_WEB3FORMS_ACCESS_KEY=your_access_key_from_web3forms
  ```

  The form sends directly to Web3Forms API at `https://api.web3forms.com/submit` with no server required.

  ## Akce page data source (Notion)

  The `/akce` page loads events from the backend endpoint `/api/events`.

  Configure these environment variables for Notion access:

  - `NOTION_TOKEN`
  - `NOTION_DATABASE_ID`

  ## Aktuality media (Google Drive folders)

  Required environment variable for `/api/news`:

  - `NOTION_NEWS_DATABASE_ID`

  This must point to the Aktuality database.
  The news endpoint intentionally does not fallback to `NOTION_DATABASE_ID`, so news and events are never mixed.

  The `/api/news` endpoint can automatically expand Google Drive folder links and map files into the article media layout (gallery + videos).

  Optional environment variable:

  - `GOOGLE_DRIVE_API_KEY`

  Notes:

  - Without `GOOGLE_DRIVE_API_KEY`, direct media URLs still work (single image/video links), but folder links are not expanded.
  - For folder expansion, shared folder content must be accessible (e.g., "Anyone with the link" viewer access).
  - This key is read in both production API (`api/news.ts`) and local dev proxy (`vite.config.ts`).

  Local usage example:

  ```bash
  export GOOGLE_DRIVE_API_KEY=your_key_here
  npm run dev
  ```

  If Notion is unavailable, the frontend automatically falls back to events from local team data.
  