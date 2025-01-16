import { Client } from 'minio'

// 统一环境变量配置
const MINIO_CONFIG = {
  endpoint: process.env.MINIO_ENDPOINT!,
  port: process.env.MINIO_PORT || '9000',
  user: process.env.MINIO_ROOT_USER!,
  password: process.env.MINIO_ROOT_PASSWORD!,
  bucket: 'intrapaste'
} as const

// 初始化 MinIO 客户端
const minioClient = new Client({
  endPoint: MINIO_CONFIG.endpoint.replace('http://', '').replace('https://', ''),
  port: Number(MINIO_CONFIG.port),
  useSSL: MINIO_CONFIG.endpoint.startsWith('https'),
  accessKey: MINIO_CONFIG.user,
  secretKey: MINIO_CONFIG.password,
})

// 确保 bucket 存在
export async function ensureBucket() {
  const exists = await minioClient.bucketExists(MINIO_CONFIG.bucket)
  if (!exists) {
    await minioClient.makeBucket(MINIO_CONFIG.bucket)
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${MINIO_CONFIG.bucket}/*`],
        },
      ],
    }
    await minioClient.setBucketPolicy(MINIO_CONFIG.bucket, JSON.stringify(policy))
  }
}

// 生成预签名上传 URL
export async function generatePresignedUrl(fileName: string, fileType: string) {
  const objectName = `${Date.now()}-${fileName}`
  const url = await minioClient.presignedPutObject(MINIO_CONFIG.bucket, objectName, 60 * 5)
  
  // 使用配置对象简化 URL 生成逻辑
  const fileUrl = MINIO_CONFIG.port !== '80' && MINIO_CONFIG.port !== '443'
    ? `${MINIO_CONFIG.endpoint}:${MINIO_CONFIG.port}/${MINIO_CONFIG.bucket}/${objectName}`
    : `${MINIO_CONFIG.endpoint}/${MINIO_CONFIG.bucket}/${objectName}`

  return {
    uploadUrl: url,
    objectName,
    fileUrl,
  }
}

// 获取文件大小
export async function getObjectSize(objectName: string) {
  const stat = await minioClient.statObject(MINIO_CONFIG.bucket, objectName)
  return stat.size
}

// 删除对象
export async function deleteObject(objectName: string) {
  try {
    await minioClient.removeObject(MINIO_CONFIG.bucket, objectName)
    return true
  } catch (error) {
    console.error('Failed to delete object from MinIO:', error)
    return false
  }
}
