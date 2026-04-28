
  # Web redesign for hchaje.cz

  This is a code bundle for Web redesign for hchaje.cz. The original project is available at https://www.figma.com/design/RwQLVy8myryXEcqyqXvRTv/Web-redesign-for-hchaje.cz.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Akce page data source (Notion)

  The `/akce` page loads events from the backend endpoint `/api/events`.

  Configure these environment variables for Notion access:

  - `NOTION_TOKEN`
  - `NOTION_DATABASE_ID`

  If Notion is unavailable, the frontend automatically falls back to events from local team data.
  