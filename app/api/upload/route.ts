import { NextResponse } from 'next/server'
import { generatePresignedUrl } from '@/lib/minio'

export async function POST(request: Request) {
  try {
    const { fileName, fileType } = await request.json()
    
    if (!fileName || !fileType) {
      return NextResponse.json(
        { success: false, message: '文件信息不完整' },
        { status: 400 }
      )
    }

    const { uploadUrl, objectName, fileUrl } = await generatePresignedUrl(fileName, fileType)
    
    return NextResponse.json({
      success: true,
      data: {
        uploadUrl,
        objectName,
        fileUrl,
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