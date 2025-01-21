# IntraPaste

IntraPaste 是一个简单高效的临时内容分享服务，支持文本和图片的快速分享。所有内容都会在指定时间后自动清理，保证系统整洁。

> ⚠️ **安全提醒**：建议将本服务部署在内网环境中使用，避免暴露在公网环境下。这可以防止敏感信息泄露和恶意使用。

## 功能特性

- 📱 iOS 客户端
  - 基于 SwiftUI 的原生应用
  - 多服务器管理
  - 深色模式支持
  - 图片预览与下载
- 📝 文本分享
  - 支持多行文本
  - 点击即可复制
  - Shift + Enter 换行
- 📸 图片分享
  - 图片预览
  - 点击放大
  - 一键下载
- 🎨 界面设计
  - 自适应深色/浅色主题
  - 完全响应式布局
  - 简洁直观的操作界面
- 👨‍💼 管理功能
  - 管理员面板
  - 内容管理
  - 密码管理
- 🧹 系统功能
  - 自动清理过期内容
  - 文件存储管理
  - 系统日志记录

## 技术栈

- [Next.js 15](https://nextjs.org/) - React 框架
- [React 19](https://react.dev/) - UI 库
- [Prisma](https://www.prisma.io/) - 数据库 ORM
- [TailwindCSS](https://tailwindcss.com/) - CSS 框架
- [TypeScript](https://www.typescriptlang.org/) - 类型系统
- [MinIO](https://min.io/) - 对象存储服务
- [PM2](https://pm2.keymetrics.io/) - 进程管理器
- [SwiftUI](https://developer.apple.com/xcode/swiftui/) - iOS UI 框架

## 环境要求

- Node.js 18+
- SQLite
- MinIO Server
- Xcode 15+ (用于 iOS 开发)

## 快速开始

### 后端设置

1. 克隆项目并安装依赖

```bash
git clone https://github.com/FaiChou/IntraPaste.git
cd IntraPaste
npm install
```

2. 配置环境变量

创建 `.env` 文件:

```bash
# MinIO 配置
MINIO_ENDPOINT=http://your-minio-server
MINIO_PORT=9000
MINIO_ROOT_USER=your-access-key
MINIO_ROOT_PASSWORD=your-secret-key
```

3. 初始化数据库

```bash
npx prisma generate
npx prisma migrate deploy
```

4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看效果。

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

## 部署指南

### MinIO 配置

1. 安装 MinIO Server

```bash
# 使用 Docker
docker run -p 9000:9000 -p 9001:9001 minio/minio server /data --console-address ":9001"
```

2. Bucket 创建

系统会自动创建名为 `intrapaste` 的 bucket，并设置适当的访问策略。

### 使用 PM2 部署

1. 构建项目

```bash
npm run build
```

2. 使用 PM2 启动

```bash
pm2 start ecosystem.config.js
```

项目默认运行在 3210 端口。

### 管理员访问

首次访问管理面板时，默认密码为 `admin`。请及时修改密码以确保安全。

访问路径：`http://your-domain/admin`

## 开发说明

- `app/page.tsx` - 主页面
- `components/` - React 组件
- `lib/` - 工具函数
- `prisma/` - 数据库模型
- `ios/` - iOS 原生应用
  - `Views/` - SwiftUI 视图
  - `Services/` - API 和服务器管理
  - `Models/` - 数据模型

## 许可证

[MIT License](LICENSE) 