import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const DEFAULT_PASSWORD = 'admin'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const adminToken = cookieStore.get('admin_token')

    if (!adminToken?.value) {
      return NextResponse.json({
        success: false,
        message: 'No token provided'
      }, { status: 401 })
    }

    const user = await prisma.user.findFirst({
      where: {
        token: adminToken.value
      }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Invalid token'
      }, { status: 401 })
    }

    // 直接判断密码是否是硬编码的 "admin"
    const isDefaultPassword = await bcrypt.compare(DEFAULT_PASSWORD, user.password)

    return NextResponse.json({
      success: true,
      isDefaultPassword
    })

  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
} 