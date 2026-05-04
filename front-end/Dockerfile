# --- build ---
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

# Same-origin `/api` and `/uploads` → nginx proxies to the API container
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

# --- serve ---
FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.docker.conf /etc/nginx/templates/default.conf.template

ENV PORT=80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
