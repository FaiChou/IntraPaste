import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

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
    const { content } = await request.json()
    
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { success: false, message: '内容不能为空' },
        { status: 400 }
      )
    }

    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1)
    
    const card = await prisma.card.create({
      data: {
        content,
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