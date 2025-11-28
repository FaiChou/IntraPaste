import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies, headers } from 'next/headers'
import { deleteObject } from '@/lib/minio'
import { sseManager } from '@/lib/sse'

export async function GET() {
  try {
    const cards = await prisma.card.findMany({
      where: {
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    
    return NextResponse.json(cards)
  } catch (error) {
    console.error('Fetch cards error:', error)
    return NextResponse.json(
      { success: false, message: 'Get cards failed' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { content, type, fileName, fileType, objectName, fileUrl, fileSize } = await request.json()
    
    if (!content && !objectName) {
      return NextResponse.json(
        { success: false, message: 'Content cannot be empty' },
        { status: 400 }
      )
    }

    const headersList = await headers()
    const ipAddress = headersList.get('x-forwarded-for') || 'unknown'
    const userAgent = headersList.get('user-agent') || 'unknown'

    const setting = await prisma.setting.findFirst({
      where: { key: 'cardExpirationMinutes' }
    })
    const expirationMinutes = setting ? parseInt(setting.value) : 60

    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + expirationMinutes)
    
    const card = await prisma.card.create({
      data: {
        content,
        type,
        fileName,
        fileSize: fileSize ? parseInt(fileSize) : null,
        fileType,
        filePath: fileUrl,
        ipAddress,
        userAgent,
        expiresAt,
      },
    })
    
    // 异步广播，不阻塞响应
    void sseManager.broadcast({ type: 'new_card', card }).catch((error) => {
      console.error('SSE broadcast error:', error)
    })
    
    return NextResponse.json(card)
  } catch (error) {
    console.error('Create card error:', error)
    return NextResponse.json(
      { success: false, message: 'Create card failed' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  const cookieStore = await cookies()
  const adminToken = cookieStore.get('admin_token')

  if (!adminToken?.value) {
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
    const cards = await prisma.card.findMany({
      where: {
        type: {
          in: ['image', 'video', 'audio', 'file']
        },
        filePath: {
          not: null
        }
      },
      select: {
        filePath: true
      }
    })

    for (const card of cards) {
      if (card.filePath) {
        const objectName = card.filePath.split('/').pop()
        if (objectName) {
          try {
            await deleteObject(objectName)
          } catch (error) {
            console.error('Failed to delete file:', objectName, error)
          }
        }
      }
    }

    await prisma.card.deleteMany()
    // 异步广播，不阻塞响应
    void sseManager.broadcast({ type: 'clear_cards' }).catch((error) => {
      console.error('SSE broadcast error:', error)
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete all cards error:', error)
    return NextResponse.json(
      { success: false, message: 'Delete all cards failed' },
      { status: 500 }
    )
  }
}