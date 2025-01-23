import { startCleanupJob } from '@/lib/cleanup'
import { ensureBucket } from '@/lib/minio'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

// 系统初始化
Promise.all([
  startCleanupJob(),
  ensureBucket().catch(error => {
    logger.warn('system', {
      action: 'init',
      message: 'MinIO initialization skipped',
      error: error instanceof Error ? error.message : String(error)
    })
    return false
  })
]).catch(error => {
  logger.error('system', {
    action: 'init',
    error: error instanceof Error ? error.message : String(error)
  })
})

export async function GET() {
  return NextResponse.json({ status: 'System initialized' })
}