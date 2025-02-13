import { createSSEConnection } from '@/lib/sse'

export async function GET() {
  return createSSEConnection()
}
