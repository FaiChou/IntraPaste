import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { deleteObject } from '@/lib/minio'
import { logger } from '@/lib/logger'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now()
  const headers = Object.fromEntries(request.headers)

  // 验证身份
  const cookieStore = await cookies()
  const adminToken = cookieStore.get('admin_token')

  if (!adminToken?.value) {
    logger.logRequest('CARDS', {
      method: 'DELETE',
      url: `/api/cards/${(await params).id}`,
      headers,
      startTime,
      statusCode: 401,
      error: 'Unauthorized'
    })

    return NextResponse.json(
      { success: false, message: '未登录' },
      { status: 401 }
    )
  }

  // 验证 token 是否有效
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
    const id = parseInt((await params).id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: '无效的ID' },
        { status: 400 }
      )
    }

    // 获取卡片信息
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
        error: 'Card not found'
      })

      return NextResponse.json(
        { success: false, message: '卡片不存在' },
        { status: 404 }
      )
    }

    // 如果存在文件，则删除文件
    if (card.type === 'image' && card.filePath) {
      const objectName = card.filePath.split('/').pop()
      if (objectName) {
        await deleteObject(objectName)
        logger.logSystem('MINIO', {
          action: 'delete_file',
          details: {
            objectName,
            cardId: id
          }
        })
      }
    }

    // 删除卡片记录
    await prisma.card.delete({
      where: { id },
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
      error
    })

    return NextResponse.json(
      { success: false, message: '删除失败' },
      { status: 500 }
    )
  }
} 