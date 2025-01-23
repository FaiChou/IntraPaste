# syntax=docker.io/docker/dockerfile:1

FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json .npmrc ./

RUN npm ci --no-audit --no-fund || \
    (rm -rf node_modules && npm cache clean --force && npm ci --no-audit --no-fund)

ENV PRISMA_CLIENT_ENGINE_TYPE="binary"
ENV PRISMA_ENGINES_TIMEOUT=30000

COPY . .

RUN npx prisma generate

RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app

RUN mkdir -p /app/logs /app/prisma

COPY --from=builder /app/.npmrc ./
COPY --from=builder /app/prisma ./prisma/
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/docker-entrypoint.sh ./

RUN chown -R node:node /app && \
    chmod -R 777 /app/logs && \
    chmod 777 /app/prisma && \
    chmod +x docker-entrypoint.sh

RUN apk add --no-cache curl

USER node

EXPOSE 3210

ENV PORT=3210
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/api/health || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]