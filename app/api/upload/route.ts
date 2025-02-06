import { NextResponse } from 'next/server'
import { generatePresignedUrl } from '@/lib/minio'
import { checkUploadLimit } from '@/lib/uploadLimit'
import { headers } from 'next/headers'
import { logger } from '@/lib/logger'
import { checkFileSize, validateFileType } from '@/lib/uploadLimit'

export async function POST(request: Request) {
  try {
    const { fileName, fileType, fileSize } = await request.json()
    
    if (!fileName || !fileType) {
      return NextResponse.json(
        { success: false, message: '文件信息不完整' },
        { status: 400 }
      )
    }

    const sizeCheck = checkFileSize(fileSize)
    if (!sizeCheck.allowed) {
      return NextResponse.json(
        { success: false, message: sizeCheck.message },
        { status: 400 }
      )
    }

    const typeCheck = validateFileType(fileType, fileName)
    if (!typeCheck.allowed) {
      return NextResponse.json(
        { success: false, message: typeCheck.message },
        { status: 400 }
      )
    }

    const headersList = await headers()
    const ipAddress = headersList.get('x-forwarded-for') || 'unknown'

    const { allowed, message } = checkUploadLimit(ipAddress)
    
    if (!allowed) {
      logger.warn('UPLOAD', {
        action: 'rate_limit',
        ipAddress,
        message
      })
      return NextResponse.json(
        { success: false, message },
        { status: 429 }
      )
    }

    const { uploadUrl, objectName, fileUrl } = await generatePresignedUrl(fileName, fileType)
    
    return NextResponse.json({
      success: true,
      data: {
        uploadUrl,
        objectName,
        fileUrl,
        fileType: typeCheck.fileType
      }
    })
  } catch (error) {
    console.error('Generate upload URL error:', error)
    return NextResponse.json(
      { success: false, message: '生成上传链接失败' },
      { status: 500 }
    )
  }
}