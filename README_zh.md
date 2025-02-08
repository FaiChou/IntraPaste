> [English](README.md) | 中文

# IntraPaste

[![CI 状态](https://github.com/FaiChou/IntraPaste/actions/workflows/ci.yml/badge.svg)](https://github.com/FaiChou/IntraPaste/actions)
[![Docker 拉取次数](https://img.shields.io/docker/pulls/phyllislapin/intrapaste)](https://hub.docker.com/r/phyllislapin/intrapaste)
[![许可证](https://img.shields.io/github/license/FaiChou/IntraPaste)](LICENSE)

IntraPaste 是一个简单高效的临时内容分享服务，支持文本和图片的快速分享。所有内容都会在指定时间后自动清理，保证系统整洁。

> ⚠️ **安全提醒**：建议将本服务部署在内网环境中使用，避免暴露在公网环境下。这可以防止敏感信息泄露和恶意使用。

## 功能特性

- 📱 iOS 客户端
  - 基于 SwiftUI 的原生应用
  - 多服务器管理
  - 深色模式支持
  - 媒体预览与下载
- 📝 文本分享
  - 支持多行文本
  - 点击即可复制
  - Shift + Enter 换行
- 📸 媒体分享（可选）
  - 需要配置 MinIO
  - 图片预览与放大
  - 视频播放 (mp4, webm, mov)
  - 音频播放 (mp3, wav, ogg 等)
  - 通用文件上传
  - 一键下载
- 🎨 界面设计
  - 自适应深色/浅色主题
  - 完全响应式布局
  - 简洁直观的操作界面
  - 上传进度提示
- 👨‍💼 管理功能
  - 管理员面板
  - 内容管理
  - 密码管理
  - 上传设置
- 🧹 系统功能
  - 自动清理过期内容
  - 可选的文件存储（MinIO）
  - 上传频率限制
  - 系统日志记录
  - 文件类型验证
  - 上传大小限制（最大1GB）

## 技术栈

- [Next.js 15](https://nextjs.org/) - React 框架
- [React 19](https://react.dev/) - UI 库
- [Prisma](https://www.prisma.io/) - 数据库 ORM
- [TailwindCSS](https://tailwindcss.com/) - CSS 框架
- [TypeScript](https://www.typescriptlang.org/) - 类型系统
- [MinIO](https://min.io/) - 对象存储（可选）
- [PM2](https://pm2.keymetrics.io/) - 进程管理器
- [SwiftUI](https://developer.apple.com/xcode/swiftui/) - iOS UI 框架
- [Docker](https://www.docker.com/) - 容器化工具

## 部署方式

### Docker 部署（推荐）

1. 克隆仓库：
```bash
git clone https://github.com/FaiChou/IntraPaste.git
cd IntraPaste
```

2. 配置环境变量：

```bash
cp .env.example .env
```

3. MinIO 配置（可选）：

如果你想启用图片分享功能，需要在 `.env` 文件中配置 MinIO：

```bash
MINIO_ENDPOINT=http://your-minio-server
MINIO_PORT=9000
MINIO_ROOT_USER=your-user
MINIO_ROOT_PASSWORD=your-password
```

如果不配置 MinIO，系统将以纯文本模式运行。

你也可以使用 Docker 在本地运行 MinIO：

```bash
docker run -d \
  --name minio \
  -p 9000:9000 \
  -p 9001:9001 \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  minio/minio server /data --console-address ":9001"
```

然后更新你的 `.env` 文件：

```bash
MINIO_ENDPOINT=http://192.168.2.100
MINIO_PORT=9000
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
```

4. 启动服务：

```bash
chmod +x start.sh
./start.sh
```

启动脚本会自动：

- 启动应用容器
- 初始化数据库并运行迁移
- 检查并初始化 MinIO（如果已配置）

5. 访问服务：

- Web 界面：http://localhost:3210
- MinIO 控制台（如果在本地运行）：http://192.168.2.100:9001

### 手动部署

#### 环境要求

- Node.js 18+
- SQLite
- MinIO Server（可选，用于图片分享）
- Xcode 15+（用于 iOS 开发）

#### 后端设置

1. 安装依赖

```bash
npm install
```

2. 配置环境变量

```bash
cp .env.example .env
# 根据需要编辑 .env 文件
```

3. 初始化数据库

```bash
npx prisma generate
npx prisma migrate deploy
```

4. 构建并使用 PM2 启动

```bash
npm run build
pm2 start ecosystem.config.js
```

#### MinIO 设置(可选，不配置 MinIO 则默认仅启用文本分享)

1. 安装 MinIO Server

```bash
# 使用 Docker
docker run -p 9000:9000 -p 9002:9001 minio/minio server /data --console-address ":9001"
```

2. Bucket 创建

系统会自动创建名为 `intrapaste` 的 bucket，并设置适当的访问策略。

### iOS 应用设置

1. 打开 iOS 项目

```bash
cd ios/IntraPaste
open IntraPaste.xcodeproj
```

2. 构建和运行

- 选择目标设备/模拟器
- 按下 Cmd+R 或点击运行按钮
- 应用需要 iOS 17.0 或更高版本

## 开发说明

- `app/page.tsx` - 主页面
- `components/` - React 组件
- `lib/` - 工具函数
- `prisma/` - 数据库模型
- `ios/` - iOS 原生应用
  - `Views/` - SwiftUI 视图
  - `Services/` - API 和服务器管理
  - `Models/` - 数据模型

### 文件上传限制

- 最大文件大小：1GB
- 支持的视频格式：mp4, webm, mov
- 支持的音频格式：mp3, wav, ogg, m4a, webm, aac
- 频率限制：可配置的 IP 上传限制
- 文件类型安全验证 
