import { startCleanupJob } from '@/lib/cleanup'
import { ensureBucket } from '@/lib/minio'
import { NextResponse } from 'next/server'

Promise.all([
  startCleanupJob(),
  ensureBucket()
]).catch(console.error)

export async function GET() {
  return NextResponse.json({ status: 'System initialized' })
}