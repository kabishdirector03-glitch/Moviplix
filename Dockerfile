# Multi-stage build for ultra-lightweight, high-speed container
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and client package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN npm --prefix client install

# Copy source code
COPY . .

# Build frontend production bundle
RUN npm --prefix client run build

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Copy root package files & install production dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy server code and prebuilt frontend
COPY server/ ./server/
COPY --from=builder /app/client/dist ./client/dist

EXPOSE 5000

CMD ["node", "server/index.js"]
