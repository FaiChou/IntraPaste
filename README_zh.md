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
- [Docker](https://www.docker.com/) - 容器化工具

## 部署方式

### Docker 部署（推荐）

1. 克隆仓库：
```bash
git clone https://github.com/yourusername/intrapaste.git
cd intrapaste
```

2. 配置环境变量：
```bash
cp .env.example .env
```

根据需要编辑 `.env` 文件：
- 使用内置 MinIO 服务：
```bash
MINIO_ENDPOINT=http://minio
MINIO_PORT=9000
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
```
- 使用外部 MinIO 服务：
```bash
MINIO_ENDPOINT=http://your-minio-server
MINIO_PORT=9000
MINIO_ROOT_USER=your-user
MINIO_ROOT_PASSWORD=your-password
```

3. 启动服务：
```bash
chmod +x start.sh
./start.sh
```

启动脚本会自动：
- 检测是使用内置还是外部 MinIO 服务
- 根据配置启动必要的容器
- 初始化数据库并运行迁移

4. 访问服务：
- Web 界面：http://localhost:3210
- MinIO 控制台（如果使用内置服务）：http://localhost:9001

### 手动部署

#### 环境要求

- Node.js 18+
- SQLite
- MinIO Server
- Xcode 15+ (用于 iOS 开发)

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

#### MinIO 设置

1. 安装 MinIO Server
```bash
# 使用 Docker
docker run -p 9000:9000 -p 9001:9001 minio/minio server /data --console-address ":9001"
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

## 许可证

[MIT License](LICENSE) 