import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { logger } from './logger'

type Client = {
  id: string
  response: Response
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

  addClient(clientId: string, response: Response) {
    this.clients.set(clientId, { id: clientId, response })
    logger.info('SSE', { action: 'client_connected', clientId })
  }

  removeClient(clientId: string) {
    this.clients.delete(clientId)
    logger.info('SSE', { action: 'client_disconnected', clientId })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  broadcast(data: any) {
    const message = `data: ${JSON.stringify(data)}\n\n`
    this.clients.forEach((client) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const writer = (client.response as any).write(message)
      if (!writer) {
        this.removeClient(client.id)
      }
    })
  }
}

export const sseManager = SSEManager.getInstance()

export async function createSSEConnection(): Promise<Response> {
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

  writer.write(encoder.encode('retry: 1000\n\n'))
  
  const enhancedResponse = Object.assign(response, {
    write: (data: string) => writer.write(encoder.encode(data)),
  })

  sseManager.addClient(clientId, enhancedResponse)

  return response
}
