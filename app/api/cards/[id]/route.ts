import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { deleteObject } from '@/lib/minio'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 验证身份
  const cookieStore = await cookies()
  const adminToken = cookieStore.get('admin_token')

  if (!adminToken?.value) {
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
      }
    }

    // 删除卡片记录
    await prisma.card.delete({
      where: { id },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete card error:', error)
    return NextResponse.json(
      { success: false, message: '删除失败' },
      { status: 500 }
    )
  }
} 