# ==========================================
# 🌸 SAKURA BIRTHDAY — PRODUCTION DOCKERFILE
# Multi-stage build for lightweight container
# ==========================================

# Stage 1: Build Frontend with Vite
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production Runtime Server
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY package*.json ./
RUN npm ci --only=production

# Copy server code and built frontend static assets
COPY server/ ./server/
COPY --from=builder /app/dist ./dist

# Create persistent storage directories
RUN mkdir -p /app/data /app/uploads

EXPOSE 5000

CMD ["node", "server/index.js"]
