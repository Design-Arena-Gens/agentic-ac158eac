# Driver Helper

Offline-first progressive web app built for professional drivers across India. Driver Helper stores data locally in a browser-powered SQLite database, syncs to the cloud whenever connectivity returns, and augments daily operations with Gemini-powered voice, chat and translation tools.

## ✨ Features

- **Offline-first storage** – Uses `sql.js` (WebAssembly SQLite) + IndexedDB persistence for profile, earnings, expenses, notes, health logs, SOS events and reminders.
- **Smart sync** – Changes queue locally, then auto-pushes to a configurable cloud webhook (`CLOUD_SYNC_URL`) as soon as the device is online. A floating indicator shows sync status and pending changes.
- **SOS cockpit** – One-tap SOS trigger, trusted contacts list, and live Google Maps view of current location (requires `NEXT_PUBLIC_GOOGLE_MAPS_KEY`).
- **Finance tracker** – Quick capture of income and expense entries with daily summaries on the dashboard.
- **Community feed** – Lightweight bulletin board for driver-to-driver updates that remains available offline.
- **Wellness & notes** – Log sleep, hydration, vitals and jot trip notes. Data is cached offline immediately.
- **AI co-pilot** – Gemini integration for chat, voice transcription, Hindi ↔ English translation and contextual smart search tailored for Indian road scenarios.
- **Installable PWA** – `next-pwa` generates a service worker/manifest so the app can be installed on Android devices and used without network access.

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Navigate to http://localhost:3000. The splash screen asks for the driver name, stores it offline, then routes to the dashboard.

### Required environment variables

Create a `.env.local` file in the project root and populate:

```bash
GEMINI_API_KEY=your_google_generative_ai_key
# Optional but recommended for the SOS live map
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_google_maps_browser_key
# Optional cloud sync webhook (Supabase Edge Function, Firebase HTTPS endpoint, etc.)
CLOUD_SYNC_URL=https://your-cloud-endpoint.example.com/sync
CLOUD_SYNC_KEY=optional_bearer_token_for_sync_endpoint
```

- `GEMINI_API_KEY` – required for chat, translation, voice-to-text and smart search.
- `NEXT_PUBLIC_GOOGLE_MAPS_KEY` – enables live Google Map rendering inside the SOS module; without it, the UI falls back to a helpful placeholder.
- `CLOUD_SYNC_URL`/`CLOUD_SYNC_KEY` – optional hook to forward queued SQLite changes to any backend (Supabase, Firebase Functions, Amplify, etc.). When unset, sync acknowledges locally without remote forwarding, keeping the UI responsive offline.

## 🧱 Tech Stack

- **Next.js 16 (App Router, TypeScript)** – deploy-ready for Vercel.
- **sql.js + localforage** – WebAssembly SQLite stored in IndexedDB for robust offline tables.
- **Zustand** – Lightweight state manager coordinating DB calls, sync queue, summaries and UI hydration.
- **next-pwa** – Service worker + manifest to support installable usage and caching.
- **@google/generative-ai** – Gemini models for chat/translation/voice.
- **@react-google-maps/api** – optional Google Maps rendering for SOS scenarios.
- **lucide-react, framer-motion** – UI polish and icons.

## 📱 Deployment

1. Build to ensure the project is production-ready:
   ```bash
   npm run build
   ```
2. Deploy to Vercel (token-based, non-interactive) once the build succeeds:
   ```bash
   vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-ac158eac
   ```
3. After Vercel finishes, confirm the production deployment:
   ```bash
   curl https://agentic-ac158eac.vercel.app
   ```

## 🧪 Testing Checklist

Before shipping, validate:

- `npm run lint` – no lint errors.
- `npm run build` – succeeds (also confirms TypeScript correctness).
- Interact with core flows (profile, earnings, notes, SOS, AI assistant) in localhost to ensure offline DB writes succeed.

## 🔐 Security Notes

- All Gemini calls run through Next.js API routes so the client never exposes the API key.
- Cloud sync webhook (if configured) receives a batch of queued mutations with table/action/payload metadata; secure it with HTTPS + bearer token or signed headers.
- The offline SQLite file is stored in IndexedDB and survives refreshes; add your own encryption layer if required for production deployments.

## 🗺️ Project Structure Highlights

```
src/
  app/
    (main)/            # Authenticated shell with bottom navigation
    api/               # Gemini + sync API routes
  components/
    providers/         # DriverProvider loads SQLite + handles sync loop
  lib/
    database.ts        # SQLite helpers, schema, CRUD + sync queue
  store/
    driver-store.ts    # Zustand store bridging DB and UI
```

Driver Helper is optimised for installation on Android devices via Vercel-hosted PWA, providing a native-like offline experience without Play Store packaging.
