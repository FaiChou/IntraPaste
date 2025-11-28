import { NextRequest } from 'next/server'
import { createSSEConnection } from '@/lib/sse'

export async function GET(req: NextRequest) {
  return createSSEConnection(req)
}
