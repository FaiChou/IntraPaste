import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import crypto from 'crypto'
import { logger } from '@/lib/logger'

export async function POST(request: Request) {
  const startTime = Date.now()
  const headers = Object.fromEntries(request.headers)
  
  try {
    const { password } = await request.json()

    if (!password) {
      logger.logRequest('AUTH', {
        method: 'POST',
        url: '/api/auth/login',
        headers,
        startTime,
        statusCode: 400,
        error: 'Password is required'
      })
      
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

    const token = crypto.randomBytes(32).toString('hex')
    
    await prisma.user.update({
      where: { id: user.id },
      data: { token }
    })

    const cookieStore = await cookies()
    cookieStore.set('admin_token', token, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24,
      path: '/',
    })

    logger.logAdmin('AUTH', {
      action: 'login',
      userId: user.id,
      details: {
        username: user.username,
        isDefaultPassword: password === 'admin'
      }
    })

    logger.logRequest('AUTH', {
      method: 'POST',
      url: '/api/auth/login',
      headers,
      userId: user.id,
      startTime,
      statusCode: 200
    })

    return NextResponse.json({ 
      success: true,
      isDefaultPassword: password === 'admin'
    })
  } catch (error) {
    logger.logRequest('AUTH', {
      method: 'POST',
      url: '/api/auth/login',
      headers,
      startTime,
      statusCode: 500,
      error
    })
    
    return NextResponse.json(
      { success: false, message: '登录失败' },
      { status: 500 }
    )
  }
} 