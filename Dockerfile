# syntax=docker.io/docker/dockerfile:1

# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 设置 npm 镜像
RUN npm config set registry https://registry.npmmirror.com

# 安装构建依赖
COPY package*.json ./
RUN npm ci

# 复制源代码
COPY . .

# 生成 Prisma Client
RUN npx prisma generate

# 构建应用
RUN npm run build

# 运行阶段
FROM node:18-alpine AS runner

WORKDIR /app

# 设置 npm 镜像
RUN npm config set registry https://registry.npmmirror.com

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
COPY docker-entrypoint.sh ./

# 设置权限
RUN chmod +x ./docker-entrypoint.sh && \
    chown -R node:node /app && \
    chmod 777 /app/prisma

# 切换到非 root 用户
USER node

# 暴露端口
EXPOSE 3210

# 启动命令
ENTRYPOINT ["./docker-entrypoint.sh"] 