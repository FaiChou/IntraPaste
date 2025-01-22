# syntax=docker.io/docker/dockerfile:1

# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 复制 package.json 和 .npmrc
COPY package*.json .npmrc ./

# 安装构建依赖
RUN npm ci --no-audit --no-fund || \
    (rm -rf node_modules && npm cache clean --force && npm ci --no-audit --no-fund)

# 设置 Prisma 相关环境变量
ENV PRISMA_CLIENT_ENGINE_TYPE="binary"
ENV PRISMA_ENGINES_TIMEOUT=30000

# 复制源代码
COPY . .

# 生成 Prisma Client
RUN npx prisma generate

# 构建应用
RUN npm run build

# 运行阶段
FROM node:18-alpine AS runner

WORKDIR /app

# 创建必要的目录并设置权限
RUN mkdir -p /app/logs /app/prisma && \
    chown -R node:node /app && \
    chmod 777 /app/prisma

# 复制构建产物和必要文件
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma/
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# 设置权限
RUN chown -R node:node /app && \
    chmod 777 /app/prisma

# 切换到非 root 用户
USER node

# 暴露端口
EXPOSE 3210

# 环境变量配置
ENV PORT=3210
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

# 健康检查
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/api/health || exit 1

# 启动命令
COPY --from=builder /app/docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

ENTRYPOINT ["./docker-entrypoint.sh"]