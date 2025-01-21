# IntraPaste

IntraPaste is a simple and efficient temporary content sharing service that supports text and image sharing. All content will be automatically cleaned up after a specified time to keep the system clean.

## Features

- 📝 Text Sharing
  - Multi-line text support
  - Click to copy
  - Shift + Enter for new line
- 📸 Image Sharing
  - Image preview
  - Click to zoom
  - One-click download
- 🎨 UI/UX
  - Light/Dark theme
  - Fully responsive design
  - Clean and intuitive interface
- 👨‍💼 Admin Features
  - Admin dashboard
  - Content management
  - Password management
- 🧹 System Features
  - Auto cleanup expired content
  - File storage management
  - System logging

## Tech Stack

- [Next.js 15](https://nextjs.org/) - React Framework
- [React 19](https://react.dev/) - UI Library
- [Prisma](https://www.prisma.io/) - Database ORM
- [TailwindCSS](https://tailwindcss.com/) - CSS Framework
- [TypeScript](https://www.typescriptlang.org/) - Type System
- [MinIO](https://min.io/) - Object Storage
- [PM2](https://pm2.keymetrics.io/) - Process Manager

## Requirements

- Node.js 18+
- SQLite
- MinIO Server

## Getting Started

1. Clone and install dependencies

```bash
git clone https://github.com/FaiChou/IntraPaste.git
cd IntraPaste
npm install
```

2. Configure environment variables

Create `.env` file:

```bash
# MinIO Config
MINIO_ENDPOINT=http://your-minio-server
MINIO_PORT=9000
MINIO_ROOT_USER=your-access-key
MINIO_ROOT_PASSWORD=your-secret-key
```

3. Initialize database

```bash
npx prisma generate
npx prisma migrate deploy
```

4. Start development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the result.

## Deployment Guide

### MinIO Setup

1. Install MinIO Server

```bash
# Using Docker
docker run -p 9000:9000 -p 9001:9001 minio/minio server /data --console-address ":9001"
```

2. Bucket Creation

The system will automatically create a bucket named `intrapaste` and set appropriate access policies.

### Deploy with PM2

1. Build the project

```bash
npm run build
```

2. Start with PM2

```bash
pm2 start ecosystem.config.js
```

The project runs on port 3210 by default.

### Admin Access

The default password for first-time admin panel access is `admin`. Please change it immediately for security.

Access path: `http://your-domain/admin`

## Development

- `app/page.tsx` - Main page
- `components/` - React components
- `lib/` - Utility functions
- `prisma/` - Database models

## License

[MIT License](LICENSE)
