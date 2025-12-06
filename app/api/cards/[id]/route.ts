import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { deleteObject } from '@/lib/s3'
import { logger } from '@/lib/logger'
import { sseManager } from '@/lib/sse'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now()
  const headers = Object.fromEntries(request.headers)

  const cookieStore = await cookies()
  const adminToken = cookieStore.get('admin_token')

  if (!adminToken?.value) {
    logger.logRequest('CARDS', {
      method: 'DELETE',
      url: `/api/cards/${(await params).id}`,
      headers,
      startTime,
      statusCode: 401,
      error: new Error('Unauthorized')
    })

    return NextResponse.json(
      { success: false, message: 'Not logged in' },
      { status: 401 }
    )
  }

  const user = await prisma.user.findFirst({
    where: { token: adminToken.value }
  })

  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Invalid login status' },
      { status: 401 }
    )
  }

  try {
    const id = parseInt((await params).id)

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid ID' },
        { status: 400 }
      )
    }

    const card = await prisma.card.findUnique({
      where: { id },
    })

    if (!card) {
      logger.logRequest('CARDS', {
        method: 'DELETE',
        url: `/api/cards/${id}`,
        headers,
        startTime,
        statusCode: 404,
        error: new Error('Card not found')
      })

      return NextResponse.json(
        { success: false, message: 'Card not found' },
        { status: 404 }
      )
    }

    if (card.type === 'image' && card.filePath) {
      const objectName = card.filePath.split('/').pop()
      if (objectName) {
        await deleteObject(objectName)
        logger.logSystem('S3', {
          action: 'delete_file',
          details: {
            objectName,
            cardId: id
          }
        })
      }
    }

    await prisma.card.delete({
      where: { id },
    })

    // 异步广播，不阻塞响应
    void sseManager.broadcast({ type: 'delete_card', cardId: id }).catch((error) => {
      logger.warn('SSE', { action: 'broadcast_failed', error })
    })

    logger.logAdmin('CARDS', {
      action: 'delete_card',
      userId: user.id,
      details: {
        cardId: id,
        cardType: card.type
      }
    })

    logger.logRequest('CARDS', {
      method: 'DELETE',
      url: `/api/cards/${id}`,
      headers,
      userId: user.id,
      startTime,
      statusCode: 200
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.logRequest('CARDS', {
      method: 'DELETE',
      url: `/api/cards/${(await params).id}`,
      headers,
      startTime,
      statusCode: 500,
      error: error instanceof Error ? error : new Error(String(error))
    })

    return NextResponse.json(
      { success: false, message: 'Delete failed' },
      { status: 500 }
    )
  }
}