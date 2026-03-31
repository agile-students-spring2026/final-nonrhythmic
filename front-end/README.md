# SubVet front-end

React application (Vite) for the SubVet sublease discovery UI.

## Prerequisites

- [Node.js](https://nodejs.org/) **18 or newer** (LTS recommended)
- npm (included with Node)

## Install dependencies

From this directory (`front-end/`):

```bash
npm install
```

## Run in development

Starts the Vite dev server with hot reload (default URL shown in the terminal, usually `http://localhost:5173`):

```bash
npm run dev
```

## Production build

```bash
npm run build
```

Static output is written to `dist/`.

## Preview the production build locally

After a build, serve the `dist/` folder:

```bash
npm run preview
```

## Lint

```bash
npm run lint
```

## Mock listing data

Sublease listings are loaded at runtime from the public [DummyJSON](https://dummyjson.com/) API (no key). You need network access for listings, profile “My listings,” listing detail, and the profile photo ([Picsum](https://picsum.photos/) placeholder). Tenant profiles still use local mock data in `src/data/tenants.js` until a tenant API exists.

All main screens use the same bottom bar (`MainNav`): Home, Subleases, Listings feed, Listing detail, Tenants list, Tenant profile, Add listing, and Profile.

## Auth screens (UI only)

If the app will eventually support login/registration, the UI placeholders are available at:

- `/login`
- `/register`

## Secrets and configuration

Do **not** commit API keys, database connection strings, or other secrets. If the project later uses environment variables, keep real values in a local `.env` file that is listed in `.gitignore` and never checked in. Submit any required `.env` contents to course staff only through the channel your team uses.

## Scripts reference

| Command | Description |
|--------|---------------|
| `npm run dev` | Development server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview `dist/` locally |
| `npm run lint` | Run ESLint |
