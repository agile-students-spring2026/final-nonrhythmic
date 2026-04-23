# SubVet front-end

Vite + React client for the SubVet housing app.

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- npm

## Install dependencies

From `front-end/`:

```bash
npm install
```

## Run in development

```bash
npm run dev
```

By default the app expects the API at `http://localhost:3000/api`.

To point at a different server, set `VITE_API_BASE_URL` in a local `.env`.

## Production build

```bash
npm run build
```

## Preview the production build locally

```bash
npm run preview
```

## Lint

```bash
npm run lint
```

## API integration notes

- Listings, tenants, auth, profile updates, applications, saved listings, and contact requests all go through the local Express API.
- Auth responses include a JWT token, and the client stores that token in local storage for subsequent API requests.
- Listing and tenant images still use seeded placeholder image URLs in the UI.

## Secrets and configuration

Do not commit real environment variables, database URIs, or JWT secrets. Keep local values in `.env` files that are ignored by git.
