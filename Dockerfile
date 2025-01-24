# syntax=docker.io/docker/dockerfile:1

FROM node:18-alpine AS builder

WORKDIR /app

ENV NO_UPDATE_NOTIFIER=1
ENV NPM_CONFIG_UPDATE_NOTIFIER=false

COPY package*.json .npmrc ./

RUN npm config set update-notifier false && \
    npm ci --no-audit --no-fund --quiet || \
    (rm -rf node_modules && npm cache clean --force && npm ci --no-audit --no-fund --quiet)

ENV PRISMA_CLIENT_ENGINE_TYPE="binary"
ENV PRISMA_ENGINES_TIMEOUT=30000

COPY . .

RUN npx prisma generate

RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NO_UPDATE_NOTIFIER=1
ENV NPM_CONFIG_UPDATE_NOTIFIER=false

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

RUN mkdir -p /app/logs /app/prisma

COPY --from=builder /app/.npmrc ./
COPY --from=builder /app/prisma ./prisma/
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY entrypoint.sh ./

RUN chown -R node:node /app && \
    chmod -R 777 /app/logs && \
    chmod -R 777 /app/prisma && \
    chmod +x entrypoint.sh

USER nextjs

EXPOSE 3210
ENV PORT=3210
ENV HOSTNAME="0.0.0.0"


ENTRYPOINT ["/app/entrypoint.sh"]