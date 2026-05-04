# SubVet

SubVet is a student-focused short-term housing platform for browsing sublease listings, discovering potential roommates, and managing common renter actions in one place.

## Live Deployment

- Front end: https://subvet-web-production-e502.up.railway.app
- API health check: https://subvet-api-production-7db9.up.railway.app/api/health

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
- API container build: `docker build -t subvet-api ./back-end`
- Web container build: `docker build -t subvet-web ./front-end`

## Railway Deployment

The production app is deployed on Railway as two Dockerized services in one project:

- `subvet-api`: Express API container from `back-end/Dockerfile`
- `subvet-web`: static React container from `front-end/Dockerfile`

Required Railway variables for `subvet-api`:

- `MONGO_URI`
- `JWT_SECRET`
- `HOST=0.0.0.0`
- `PORT=3000`
- `NODE_ENV=production`
- `RAILWAY_DOCKERFILE_PATH=Dockerfile`

Required Railway variables for `subvet-web`:

- `VITE_API_BASE_URL=https://subvet-api-production-7db9.up.railway.app/api`
- `RAILWAY_DOCKERFILE_PATH=Dockerfile`

Manual Railway deploy commands:

```bash
railway up --service subvet-api --path-as-root back-end
railway up --service subvet-web --path-as-root front-end
```

Continuous deployment is configured in `.github/workflows/railway-deploy.yml`. Add these GitHub repository secrets before relying on the workflow:

- `RAILWAY_TOKEN`
- `RAILWAY_PROJECT_ID`

## Extra Credit Completed

- Docker/container deployment: both production services run from committed Dockerfiles.
- Continuous integration: GitHub Actions runs front-end lint/build, back-end tests, and Docker image builds.
- Continuous deployment: GitHub Actions can deploy both Railway services automatically on pushes to `master` once Railway secrets are configured.

## Docker (container deployment)

Three services: **MongoDB 7**, **Express API** (`back-end/Dockerfile`), **static React web** (`front-end/Dockerfile`). The API is exposed on `http://localhost:3000`, and the front-end image is built with `VITE_API_BASE_URL=http://localhost:3000/api`.

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
