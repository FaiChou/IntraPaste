import { startCleanupJob } from '@/lib/cleanup'
import { NextResponse } from 'next/server'

// 在服务端启动时初始化清理任务
startCleanupJob()

export async function GET() {
  return NextResponse.json({ status: 'Cleanup job initialized' })
}