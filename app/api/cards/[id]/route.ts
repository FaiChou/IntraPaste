import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

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