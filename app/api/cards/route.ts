import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies, headers } from 'next/headers'
import { deleteObject, getObjectSize } from '@/lib/minio'

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
      { success: false, message: '获取失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { content, type, fileName, fileType, objectName, fileUrl } = await request.json()
    
    if (!content && !objectName) {
      return NextResponse.json(
        { success: false, message: '内容不能为空' },
        { status: 400 }
      )
    }

    const headersList = await headers()
    const ipAddress = headersList.get('x-forwarded-for') || 'unknown'
    const userAgent = headersList.get('user-agent') || 'unknown'

    // 获取过期时间设置
    const setting = await prisma.setting.findFirst({
      where: { key: 'cardExpirationMinutes' }
    })
    const expirationMinutes = setting ? parseInt(setting.value) : 60

    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + expirationMinutes)
    
    let fileSize: number | undefined

    if (type === 'image') {
      fileSize = await getObjectSize(objectName)
    }
    
    const card = await prisma.card.create({
      data: {
        content,
        type,
        fileName,
        fileSize,
        fileType,
        filePath: fileUrl,
        ipAddress,
        userAgent,
        expiresAt,
      },
    })
    
    return NextResponse.json(card)
  } catch (error) {
    console.error('Create card error:', error)
    return NextResponse.json(
      { success: false, message: '创建失败' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  const cookieStore = await cookies()
  const adminToken = cookieStore.get('admin_token')

  if (!adminToken?.value) {
    return NextResponse.json(
      { success: false, message: '未登录' },
      { status: 401 }
    )
  }

  const user = await prisma.user.findFirst({
    where: { token: adminToken.value }
  })

  if (!user) {
    return NextResponse.json(
      { success: false, message: '无效的登录状态' },
      { status: 401 }
    )
  }

  try {
    const cards = await prisma.card.findMany({
      where: {
        type: 'image',
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
          await deleteObject(objectName)
        }
      }
    }

    await prisma.card.deleteMany()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete all cards error:', error)
    return NextResponse.json(
      { success: false, message: '删除失败' },
      { status: 500 }
    )
  }
}