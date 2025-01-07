import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { success: false, message: '密码不能为空' },
        { status: 400 }
      )
    }

    let user = await prisma.user.findFirst()
    
    if (!user) {
      const hashedPassword = await bcrypt.hash('admin', 10)
      user = await prisma.user.create({
        data: {
          username: 'admin',
          password: hashedPassword,
        },
      })
    }

    const isValid = await bcrypt.compare(password, user.password)
    
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: '密码错误' },
        { status: 401 }
      )
    }

    // 生成随机 token
    const token = crypto.randomBytes(32).toString('hex')
    
    const cookieStore = await cookies()
    cookieStore.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })

    return NextResponse.json({ 
      success: true,
      isDefaultPassword: password === 'admin'
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: '登录失败' },
      { status: 500 }
    )
  }
} 