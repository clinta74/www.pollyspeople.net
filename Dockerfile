# ── Stage 1: Build ────────────────────────────────────────────
FROM node:22 AS build

WORKDIR /app

# Install dependencies first (layer cache)
COPY package*.json ./
RUN rm -f package-lock.json && npm install

# Copy source and build
COPY . .
RUN npm run build

# ── Stage 2: Serve ────────────────────────────────────────────
FROM nginx:alpine

# Set nginx user UID/GID to 568 to match the app user on the Docker host
RUN apk add --no-cache shadow \
    && usermod -u 568 nginx \
    && groupmod -g 568 nginx

# Custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Copy dog photos (volume-mount at runtime overrides these for live updates)
COPY dogs/ /usr/share/nginx/html/dogs/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
