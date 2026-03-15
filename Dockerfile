# ── Stage 1: Build the React frontend ─────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

# Install build tools required by better-sqlite3 (native module)
RUN apk add --no-cache python3 make g++

# Install all dependencies (including devDependencies for the React build)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY public/ ./public/
COPY src/ ./src/
RUN npm run build

# ── Stage 2: Production server ─────────────────────────────────────────────
FROM node:18-alpine

WORKDIR /app

# Install build tools required by better-sqlite3
RUN apk add --no-cache python3 make g++

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the Express backend
COPY server/ ./server/

# Copy the compiled React frontend from Stage 1
COPY --from=builder /app/build ./build

# Create a directory for the persistent database
RUN mkdir -p /app/data

EXPOSE 4000

ENV NODE_ENV=production \
    PORT=4000 \
    DB_PATH=/app/data/queueflow.db

CMD ["node", "server/index.js"]
