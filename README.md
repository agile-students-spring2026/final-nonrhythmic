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
