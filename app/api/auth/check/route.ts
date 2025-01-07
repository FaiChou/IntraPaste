import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function GET() {
  const cookieStore = cookies()
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