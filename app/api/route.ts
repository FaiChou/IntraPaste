import { startCleanupJob } from '@/lib/cleanup'
import { ensureBucket } from '@/lib/minio'
import { NextResponse } from 'next/server'

// 在服务端启动时初始化清理任务和 Minio bucket
Promise.all([
  startCleanupJob(),
  ensureBucket()
]).catch(console.error)

export async function GET() {
  return NextResponse.json({ status: 'System initialized' })
}