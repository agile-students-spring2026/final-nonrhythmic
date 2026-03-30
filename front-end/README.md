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

## Secrets and configuration

Do **not** commit API keys, database connection strings, or other secrets. If the project later uses environment variables, keep real values in a local `.env` file that is listed in `.gitignore` and never checked in. Submit any required `.env` contents to course staff only through the channel your team uses.

## Scripts reference

| Command | Description |
|--------|---------------|
| `npm run dev` | Development server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview `dist/` locally |
| `npm run lint` | Run ESLint |
