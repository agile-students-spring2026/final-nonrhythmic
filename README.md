# SubVet

SubVet is a student-focused short-term housing platform for browsing sublease listings, discovering potential roommates, and managing common renter actions in one place.

The project now runs as a split-stack app:

- `front-end/`: Vite + React client
- `back-end/`: Express API backed by MongoDB Atlas via Mongoose

## Current Product State

The app currently supports:

- Browse listings and view listing details
- Browse tenant profiles
- Register and log in with JWT-backed auth
- Create listings and tenant posts through the API
- Save and unsave listings
- Submit applications and contact requests
- Edit the signed-in user profile

## Local Development

### Back-end

From `back-end/`:

```bash
npm install
npm run dev
```

Required environment variables in a local `.env` file:

- `MONGO_URI`
- `JWT_SECRET`

Optional environment variables:

- `PORT`
- `HOST`

### Front-end

From `front-end/`:

```bash
npm install
npm run dev
```

Optional front-end environment variable:

- `VITE_API_BASE_URL`
  Default: `http://localhost:3000/api`

## Verification

- Back-end tests: `cd back-end && npm test`
- Front-end lint: `cd front-end && npm run lint`
- Front-end build: `cd front-end && npm run build`

## Docker (container deployment)

Three services: **MongoDB 7**, **Express API** (`back-end/Dockerfile`), **nginx + static React** (`front-end/Dockerfile`). Nginx proxies `/api` and `/uploads` to the API so the browser uses one origin (good for production and matches `VITE_API_BASE_URL=/api` at image build time).

```bash
cp compose.env.example compose.env
# Edit compose.env — set a strong JWT_SECRET (e.g. openssl rand -hex 32)

docker compose up --build
```

Then open **http://localhost:8080**. Uploads persist in the `api_uploads` volume; Mongo data in `mongo_data`.

For **MongoDB Atlas** on a droplet: put your Atlas `MONGO_URI` in `compose.env`, remove the `mongo` service (and `mongo_data` volume) from `docker-compose.yml`, and remove `api.depends_on.mongo`.

## Team Members

- Jack Chen — https://github.com/hc4893-lab
- Kaiyuan Wu - https://github.com/qiexian-mf
- Anthony Lu - https://www.github.com/anthonylu23
- Jungwoo Park - https://github.com/ParkJ82
- Khushboo Agrawal - https://github.com/KhushbooAgrawal190803

## Course References

- [App Map & Wireframes](./instructions-0a-app-map-wireframes.md)
- [Prototyping](./instructions-0b-prototyping.md)
- [Sprint Planning](./instructions-0d-sprint-planning.md)
- [Front-End Development](./instructions-1-front-end.md)
- [Back-End Development](./instructions-2-back-end.md)
- [Database Integration](./instructions-3-database.md)
- [Deployment](./instructions-4-deployment.md)
