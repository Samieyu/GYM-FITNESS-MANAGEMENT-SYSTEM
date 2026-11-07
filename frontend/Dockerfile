# Multi-stage frontend Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json tsconfig*.json vite.config.ts postcss.config.js tailwind.config.js index.html ./
COPY src/ ./src/

RUN npm ci
RUN npm run build

# Nginx static server stage
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html

# Custom Nginx SPA configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
