FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package*.json tsconfig.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# Copy backend source code and migrations
COPY src/ ./src/

# Compile TypeScript to JavaScript in dist/
RUN npm run build

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json tsconfig.json ./

# Install production dependencies and tsx for migration runner
RUN npm ci --omit=dev && npm install tsx

# Copy compiled code from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/db/migrations ./src/db/migrations
COPY --from=builder /app/src/db ./src/db

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 5000

CMD ["node", "dist/server.js"]
