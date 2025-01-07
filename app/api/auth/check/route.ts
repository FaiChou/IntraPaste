import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  const cookieStore = await cookies()
  const adminToken = cookieStore.get('admin_token')
  
  if (!adminToken) {
    return NextResponse.json({ success: false })
  }

  try {
    const user = await prisma.user.findFirst()
    
    if (!user) {
      return NextResponse.json({ success: false })
    }

    // 检查是否是默认密码
    const isDefaultPassword = await bcrypt.compare('admin', user.password)

    return NextResponse.json({ 
      success: true,
      isDefaultPassword 
    })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({ success: false })
  }
} 