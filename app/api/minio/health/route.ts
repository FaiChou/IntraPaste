import { NextResponse } from 'next/server'
import { checkMinioConnection } from '@/lib/minio'

export async function GET() {
  try {
    const isHealthy = await checkMinioConnection()
    return NextResponse.json({ 
      enabled: isHealthy,
      timestamp: new Date().toISOString() 
    })
  } catch (error) {
    console.error('MinIO health check failed:', error)
    return NextResponse.json({ 
      enabled: false,
      error: 'MinIO connection failed' 
    })
  }
} 