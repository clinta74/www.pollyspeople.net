# ── Stage 1: Build ────────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

# Install build tools required for native modules (e.g. lmdb via node-gyp)
RUN apk add --no-cache python3 make g++

# Install dependencies first (layer cache)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ── Stage 2: Serve ────────────────────────────────────────────
FROM nginx:alpine

# Custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
