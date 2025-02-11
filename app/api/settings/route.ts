import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    const settings = await prisma.setting.findFirst({
      where: { key: 'cardExpirationMinutes' }
    })
    
    return NextResponse.json({
      success: true,
      data: settings ? parseInt(settings.value) : 60
    })
  } catch (error) {
    logger.error('SETTINGS', {
      action: 'get_settings',
      error: error instanceof Error ? error : new Error(String(error))
    })
    return NextResponse.json(
      { success: false, message: 'Get settings failed' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  const cookieStore = await cookies()
  const adminToken = cookieStore.get('admin_token')

  if (!adminToken?.value) {
    return NextResponse.json(
      { success: false, message: 'Not logged in' },
      { status: 401 }
    )
  }

  const user = await prisma.user.findFirst({
    where: { token: adminToken.value }
  })

  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Invalid login status' },
      { status: 401 }
    )
  }

  try {
    const { expirationMinutes } = await request.json()
    
    if (!expirationMinutes || expirationMinutes < 1) {
      return NextResponse.json(
        { success: false, message: 'Expiration time cannot be less than 1 minute' },
        { status: 400 }
      )
    }

    await prisma.setting.upsert({
      where: { key: 'cardExpirationMinutes' },
      update: { value: expirationMinutes.toString() },
      create: {
        key: 'cardExpirationMinutes',
        value: expirationMinutes.toString()
      }
    })

    logger.logAdmin('SETTINGS', {
      action: 'update_expiration',
      userId: user.id,
      details: { expirationMinutes }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('SETTINGS', {
      action: 'update_settings',
      error: error instanceof Error ? error : new Error(String(error))
    })
    return NextResponse.json(
      { success: false, message: 'Update settings failed' },
      { status: 500 }
    )
  }
}