import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  const cookieStore = cookies()
  const adminToken = cookieStore.get('admin_token')
  
  if (!adminToken) {
    return NextResponse.json({ success: false, message: '未登录' })
  }

  const { oldPassword, newPassword } = await request.json()

  try {
    const user = await prisma.user.findFirst()
    
    if (!user) {
      return NextResponse.json({ success: false, message: '用户不存在' })
    }

    const isValid = await bcrypt.compare(oldPassword, user.password)
    
    if (!isValid) {
      return NextResponse.json({ success: false, message: '原密码错误' })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json({ success: false, message: '修改失败' })
  }
} 