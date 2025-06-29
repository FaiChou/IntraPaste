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
        error: new Error('Password is required')
      })
      
      return NextResponse.json(
        { success: false, message: 'Password cannot be empty' },
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
        { success: false, message: 'Password is incorrect' },
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
      maxAge: 60 * 60 * 24 * 30, // 30 days
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
      error: error instanceof Error ? error : new Error(String(error))
    })
    
    return NextResponse.json(
      { success: false, message: 'Login failed' },
      { status: 500 }
    )
  }
}