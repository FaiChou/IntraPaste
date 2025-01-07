import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  const { password } = await request.json()

  try {
    // 获取用户
    let user = await prisma.user.findFirst()
    
    // 如果没有用户，创建默认用户
    if (!user) {
      const hashedPassword = await bcrypt.hash('admin', 10)
      user = await prisma.user.create({
        data: {
          username: 'admin',
          password: hashedPassword,
        },
      })
    }

    // 验证密码
    const isValid = await bcrypt.compare(password, user.password)
    
    if (!isValid) {
      return NextResponse.json({ success: false })
    }

    // 设置登录 cookie
    const cookieStore = cookies()
    cookieStore.set('admin_token', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    })

    return NextResponse.json({ 
      success: true,
      isDefaultPassword: password === 'admin'
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ success: false })
  }
} 