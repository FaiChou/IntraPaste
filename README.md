# IntraPaste

IntraPaste is a simple and efficient temporary content sharing service that supports text and image sharing. All content will be automatically cleaned up after a specified time to keep the system clean.

> ⚠️ **Security Notice**: It is recommended to deploy this service within an intranet environment rather than exposing it to the public internet. This helps prevent potential information leaks and malicious usage.

## Features

- 📱 iOS Client
  - Native iOS app with SwiftUI
  - Multiple server management
  - Dark mode support
  - Image preview & download
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
- [SwiftUI](https://developer.apple.com/xcode/swiftui/) - iOS UI Framework
- [Docker](https://www.docker.com/) - Containerization

## Deployment

### Docker Deployment (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/FaiChou/IntraPaste.git
cd IntraPaste
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` file according to your needs:
- Use built-in MinIO service:
```bash
MINIO_ENDPOINT=http://minio
MINIO_PORT=9000
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
```
- Use external MinIO service:
```bash
MINIO_ENDPOINT=http://your-minio-server
MINIO_PORT=9000
MINIO_ROOT_USER=your-user
MINIO_ROOT_PASSWORD=your-password
```

3. Start the service:
```bash
chmod +x start.sh
./start.sh
```

The script will automatically:
- Detect if you're using built-in or external MinIO service
- Start necessary containers based on your configuration
- Initialize the database and run migrations

4. Access the service:
- Web UI: http://localhost:3210
- MinIO Console (if using built-in service): http://localhost:9002

### Manual Deployment

#### Requirements

- Node.js 18+
- SQLite
- MinIO Server
- Xcode 15+ (for iOS development)

#### Backend Setup

1. Install dependencies
```bash
npm install
```

2. Configure environment variables
```bash
cp .env.example .env
# Edit .env with your settings
```

3. Initialize database
```bash
npx prisma generate
npx prisma migrate deploy
```

4. Build and start with PM2
```bash
npm run build
pm2 start ecosystem.config.js
```

#### MinIO Setup

1. Install MinIO Server
```bash
# Using Docker
docker run -p 9000:9000 -p 9002:9001 minio/minio server /data --console-address ":9001"
```

2. Bucket Creation
The system will automatically create a bucket named `intrapaste` and set appropriate access policies.

### iOS App Setup

1. Open iOS project
```bash
cd ios/IntraPaste
open IntraPaste.xcodeproj
```

2. Build and run
- Select your target device/simulator
- Press Cmd+R or click the Run button
- The app requires iOS 17.0 or later

## Development

- `app/page.tsx` - Main page
- `components/` - React components
- `lib/` - Utility functions
- `prisma/` - Database models
- `ios/` - iOS native app
  - `Views/` - SwiftUI views
  - `Services/` - API and server management
  - `Models/` - Data models

## License

[MIT License](LICENSE)
