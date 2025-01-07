import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

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

    // 查找具有匹配 token 的用户
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

    // 检查是否是默认密码
    const isDefaultPassword = await bcrypt.compare('admin', user.password)

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