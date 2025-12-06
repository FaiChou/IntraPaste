[English](README.md) | 中文

# IntraPaste

[![CI 状态](https://github.com/FaiChou/IntraPaste/actions/workflows/ci.yml/badge.svg)](https://github.com/FaiChou/IntraPaste/actions)
[![Docker 拉取次数](https://img.shields.io/docker/pulls/phyllislapin/intrapaste)](https://hub.docker.com/r/phyllislapin/intrapaste)
[![许可证](https://img.shields.io/github/license/FaiChou/IntraPaste)](LICENSE)

<details>
<summary>📸 预览</summary>

![首页](https://faichou.github.io/IntraPastePrivacy/home.png)

![管理页](https://faichou.github.io/IntraPastePrivacy/admin.png)

![移动端](https://faichou.github.io/IntraPastePrivacy/mobile.png) 

</details>

IntraPaste 是一个简单高效的临时内容分享服务，支持文本和图片的快速分享。所有内容都会在指定时间后自动清理，保证系统整洁。

> ⚠️ **安全提醒**：建议将本服务部署在内网环境中使用，避免暴露在公网环境下。这可以防止敏感信息泄露和恶意使用。

## 为什么选择 IntraPaste？

### 与同类解决方案对比

#### 对比 AirDrop
- AirDrop 仅限于苹果设备之间使用
- 需要设备同时开启蓝牙和 WiFi
- 需要手动发现设备并确认接收
- IntraPaste 可在任何带浏览器的设备上使用
- 无需配对或发现设备
- 通过网页界面即时访问

#### 对比 LocalSend
- LocalSend 需要在所有设备上安装应用
- 需要进行设备发现过程
- IntraPaste 直接在浏览器中运行 - 无需安装
- 通过 URL 即时访问内容
- 特别适合快速文本分享，一键复制

### 核心优势
- **通用访问**：任何带浏览器的设备都可使用
- **零安装**：终端用户无需任何设置
- **即时分享**：粘贴内容即可分享 URL
- **文本优化**：文本内容一键复制
- **内网安全**：在内网环境中安全分享
- **跨平台**：支持任意设备/操作系统之间分享
- **简单部署**：一次部署全网可用

## 功能特性

- 📱 iOS 客户端
  - 基于 SwiftUI 的原生应用（[App Store 下载](https://apps.apple.com/cn/app/intrapaste/id6740268699?l=en-GB)）
  - 多服务器管理
  - 深色模式支持
  - 媒体预览与下载
- 🌍 国际化
  - 多语言支持
  - 支持语言：英语、简体中文、繁体中文、日语、法语、韩语、德语
  - 便捷的语言切换
- 📝 文本分享
  - 支持多行文本
  - 点击即可复制
  - Shift + Enter 换行
- 📸 媒体分享（可选）
  - 需要配置 S3 兼容存储
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
  - 可选的文件存储（S3 兼容服务）
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
- [AWS S3](https://aws.amazon.com/s3/) / [MinIO](https://min.io/) - S3 兼容对象存储（可选）
- [PM2](https://pm2.keymetrics.io/) - 进程管理器
- [SwiftUI](https://developer.apple.com/xcode/swiftui/) - iOS UI 框架
- [Docker](https://www.docker.com/) - 容器化工具

## 部署方式

### Docker 部署（推荐）

1. 克隆仓库：
```bash
git clone --depth=1 https://github.com/FaiChou/IntraPaste.git
cd IntraPaste
```

2. 配置环境变量：

```bash
cp .env.example .env
```

3. S3 配置（可选）：

如果你想启用图片分享功能，需要在 `.env` 文件中配置 S3：

```bash
S3_ENDPOINT=http://your-s3-server:9000
S3_REGION=us-east-1
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_BUCKET=intrapaste
```

如果不配置 S3，系统将以纯文本模式运行。

你也可以使用 Docker 在本地运行 MinIO（S3 兼容）：

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
S3_ENDPOINT=http://192.168.2.100:9000
S3_REGION=us-east-1
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=intrapaste
```

4. 启动服务：

```bash
chmod +x start.sh
./start.sh
```

启动脚本会自动：

- 启动应用容器
- 初始化数据库并运行迁移
- 检查并初始化 S3 存储桶（如果已配置）

5. 访问服务：

- Web 界面：http://localhost:3210
- MinIO 控制台（如果在本地运行）：http://192.168.2.100:9001
- 管理系统：http://localhost:3210/admin (默认密码：admin)

> ⚠️ 出于安全考虑，请在首次登录后立即修改默认密码。

### 手动部署

#### 环境要求

- Node.js 18+
- SQLite
- S3 兼容存储（可选，用于图片分享）
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

#### S3 设置（可选，不配置 S3 则默认仅启用文本分享）

1. 运行 S3 兼容存储服务（例如 MinIO）

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

### Nginx 反向代理

在使用 nginx 作为反向代理部署 IntraPaste 时，需要特别注意 `/api/sse` 接口的配置。该接口使用 Server-Sent Events (SSE) 实现实时更新功能，需要特定的 nginx 设置才能正常工作。

> ⚠️ **重要提示**：对于 `/api/sse` 接口，**必须**设置 `proxy_cache off` 和 `proxy_buffering off`。这些设置对 SSE 的正常工作至关重要，因为缓冲和缓存会破坏流式连接。

nginx 配置示例：

```nginx
server {
    listen 80;
    server_name example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate     /etc/nginx/ssl/example.crt;
    ssl_certificate_key /etc/nginx/ssl/example.key;

    proxy_http_version 1.1;
    proxy_set_header Connection "";

    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    location /api/sse {
        proxy_pass http://127.0.0.1:3210;
        proxy_buffering off;
        proxy_cache off;
        chunked_transfer_encoding on;
        proxy_read_timeout 24h;
        proxy_send_timeout 24h;
    }
    location / {
        proxy_pass http://127.0.0.1:3210;
    }
}
```

关键配置说明：

- **`proxy_buffering off`**：禁用响应缓冲，允许 SSE 事件立即发送给客户端
- **`proxy_cache off`**：禁止缓存 SSE 响应，确保实时数据传输
- **`proxy_read_timeout 24h`** 和 **`proxy_send_timeout 24h`**：延长超时时间以支持长连接的 SSE
- **`proxy_http_version 1.1`** 和 **`Connection ''`**：SSE 使用的 HTTP/1.1 长连接所必需

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
