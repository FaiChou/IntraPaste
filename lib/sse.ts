import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { logger } from './logger'

type Client = {
  id: string
  response: Response
  writer: WritableStreamDefaultWriter<Uint8Array>
}

class SSEManager {
  private clients: Map<string, Client>
  private static instance: SSEManager

  private constructor() {
    this.clients = new Map()
  }

  static getInstance(): SSEManager {
    if (!SSEManager.instance) {
      SSEManager.instance = new SSEManager()
    }
    return SSEManager.instance
  }

  addClient(clientId: string, response: Response, writer: WritableStreamDefaultWriter<Uint8Array>) {
    this.clients.set(clientId, { id: clientId, response, writer })
    logger.info('SSE', { action: 'client_connected', clientId })
  }

  removeClient(clientId: string) {
    this.clients.delete(clientId)
    logger.info('SSE', { action: 'client_disconnected', clientId })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async broadcast(data: any) {
    const message = `data: ${JSON.stringify(data)}\n\n`
    const encoder = new TextEncoder()
    const clientsToRemove: string[] = []

    // 使用 Promise.allSettled 并行处理所有客户端，不因单个失败而中断
    const promises = Array.from(this.clients.values()).map(async (client) => {
      try {
        await client.writer.ready
        await client.writer.write(encoder.encode(message))
      } catch (error) {
        logger.warn('SSE', { action: 'write_failed', clientId: client.id, error })
        clientsToRemove.push(client.id)
        try {
          await client.writer.close()
        } catch (closeError) {
          logger.warn('SSE', { action: 'writer_already_closed', clientId: client.id, error: closeError })
        }
      }
    })

    await Promise.allSettled(promises)

    // 清理失败的客户端
    clientsToRemove.forEach((clientId) => {
      this.removeClient(clientId)
    })
  }
}

export const sseManager = SSEManager.getInstance()

export async function createSSEConnection(req: NextRequest): Promise<Response> {
  const headersList = await headers()
  const clientId = headersList.get('x-forwarded-for') || 'unknown'

  const stream = new TransformStream()
  const writer = stream.writable.getWriter()
  const encoder = new TextEncoder()

  const response = new NextResponse(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })

  // 监听请求中止事件
  req.signal.addEventListener('abort', async () => {
    logger.info('SSE', { action: 'client_aborted', clientId })
    try {
      await writer.ready
      await writer.close()
    } catch (error) {
      logger.warn('SSE', { action: 'writer_already_closed', clientId, error })
    }
    sseManager.removeClient(clientId)
  })

  try {
    await writer.write(encoder.encode('retry: 1000\n\n'))
  } catch (error) {
    logger.warn('SSE', { action: 'initial_write_failed', clientId, error })
  }

  const enhancedResponse = Object.assign(response, {
    write: (data: string) => writer.write(encoder.encode(data)),
  })

  sseManager.addClient(clientId, enhancedResponse, writer)

  return response
}
