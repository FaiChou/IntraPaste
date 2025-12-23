FROM node:18-alpine AS builder

WORKDIR /app

ENV NO_UPDATE_NOTIFIER=1

COPY package*.json .npmrc ./

RUN npm ci --no-audit --no-fund --quiet || \
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

RUN mkdir -p /app/logs /app/prisma

COPY --from=builder /app/.npmrc ./
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY entrypoint.sh ./

RUN chmod +x entrypoint.sh

# Runtime permissions will be determined by the user ID

EXPOSE 3210
ENV PORT=3210
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["/app/entrypoint.sh"]