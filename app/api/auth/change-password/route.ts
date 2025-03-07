import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const adminToken = cookieStore.get('admin_token')
  
  if (!adminToken) {
    return NextResponse.json(
      { success: false, message: 'Not logged in' },
      { status: 401 }
    )
  }

  try {
    const { oldPassword, newPassword } = await request.json()

    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Password cannot be empty' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findFirst()
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User does not exist' },
        { status: 404 }
      )
    }

    const isValid = await bcrypt.compare(oldPassword, user.password)
    
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Old password is incorrect' },
        { status: 401 }
      )
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { success: false, message: 'Change password failed' },
      { status: 500 }
    )
  }
}