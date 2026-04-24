# Timezone Overlap

A Vite + React timezone planning tool with an interactive globe, hourly overlap windows, local persistence, and shareable board URLs.

## Run

```bash
npm install
npm run dev
```

Open the local Vite URL printed by the dev server.

## Build And Test

```bash
npm test
npm run build
```

## State

The app stores the full board in `localStorage` under `timezone-overlap:v1`. It also keeps the current board encoded in the `?state=` URL parameter, so copying the address bar or using **Share** restores zones, work windows, highlights, date, translator settings, and globe tweaks.
