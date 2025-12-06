import { NextResponse } from 'next/server'
import { checkS3Connection } from '@/lib/s3'

export async function GET() {
    try {
        const isHealthy = await checkS3Connection()
        return NextResponse.json({
            enabled: isHealthy,
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        console.error('S3 health check failed:', error)
        return NextResponse.json({
            enabled: false,
            error: 'S3 connection failed'
        })
    }
}
