import {
    S3Client,
    ListBucketsCommand,
    HeadBucketCommand,
    CreateBucketCommand,
    PutBucketPolicyCommand,
    PutObjectCommand,
    HeadObjectCommand,
    DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { logger } from './logger'

const S3_CONFIG = {
    endpoint: process.env.S3_ENDPOINT || '',
    publicUrl: process.env.S3_PUBLIC_URL || '', // Optional: Public URL for accessing files (e.g., R2.dev URL)
    region: process.env.S3_REGION || 'us-east-1',
    accessKey: process.env.S3_ACCESS_KEY || '',
    secretKey: process.env.S3_SECRET_KEY || '',
    bucket: process.env.S3_BUCKET || 'intrapaste',
} as const

const s3Client = new S3Client({
    endpoint: S3_CONFIG.endpoint || undefined,
    region: S3_CONFIG.region,
    credentials: {
        accessKeyId: S3_CONFIG.accessKey,
        secretAccessKey: S3_CONFIG.secretKey,
    },
    forcePathStyle: true, // Required for MinIO and other S3-compatible services
})

export async function checkS3Connection() {
    if (!S3_CONFIG.endpoint ||
        !S3_CONFIG.accessKey ||
        !S3_CONFIG.secretKey) {
        return false
    }

    try {
        await s3Client.send(new ListBucketsCommand({}))
        return true
    } catch (error) {
        logger.error('s3', {
            action: 'check_connection',
            error: error instanceof Error ? error.message : String(error)
        })
        return false
    }
}

export async function ensureBucket() {
    const isConnected = await checkS3Connection()
    if (!isConnected) {
        logger.warn('s3', {
            action: 'ensure_bucket',
            message: 'S3 is not configured or unavailable'
        })
        return false
    }

    try {
        try {
            await s3Client.send(new HeadBucketCommand({ Bucket: S3_CONFIG.bucket }))
        } catch {
            // Bucket doesn't exist, create it
            await s3Client.send(new CreateBucketCommand({ Bucket: S3_CONFIG.bucket }))

            const policy = {
                Version: '2012-10-17',
                Statement: [
                    {
                        Effect: 'Allow',
                        Principal: { AWS: ['*'] },
                        Action: ['s3:GetObject'],
                        Resource: [`arn:aws:s3:::${S3_CONFIG.bucket}/*`],
                    },
                ],
            }
            await s3Client.send(new PutBucketPolicyCommand({
                Bucket: S3_CONFIG.bucket,
                Policy: JSON.stringify(policy),
            }))
        }
        logger.info('s3', {
            action: 'ensure_bucket',
            message: 'Bucket exists and policy set'
        })
        return true
    } catch (error) {
        logger.error('s3', {
            action: 'ensure_bucket',
            error: error instanceof Error ? error.message : String(error)
        })
        return false
    }
}

export async function generatePresignedUrl(fileName: string, fileType: string) {
    logger.info('generatePresignedUrl', { fileName, fileType })
    const objectName = `${Date.now()}-${fileName}`

    const command = new PutObjectCommand({
        Bucket: S3_CONFIG.bucket,
        Key: objectName,
        ContentType: fileType,
    })

    const url = await getSignedUrl(s3Client, command, { expiresIn: 60 * 5 })
    logger.info('generatePresignedUrl', { url })

    // Construct the public file URL
    // Use S3_PUBLIC_URL if configured (for R2, CloudFront, etc.), otherwise construct from endpoint
    let fileUrl: string
    if (S3_CONFIG.publicUrl) {
        // Public URL provided (e.g., https://pub-xxx.r2.dev or custom domain)
        fileUrl = `${S3_CONFIG.publicUrl}/${objectName}`
    } else {
        // Fallback to endpoint URL (for MinIO and similar)
        const endpointUrl = new URL(S3_CONFIG.endpoint)
        fileUrl = `${endpointUrl.protocol}//${endpointUrl.host}/${S3_CONFIG.bucket}/${objectName}`
    }

    return {
        uploadUrl: url,
        objectName,
        fileUrl,
    }
}

export async function getObjectSize(objectName: string) {
    const response = await s3Client.send(new HeadObjectCommand({
        Bucket: S3_CONFIG.bucket,
        Key: objectName,
    }))
    return response.ContentLength || 0
}

export async function deleteObject(objectName: string) {
    try {
        await s3Client.send(new DeleteObjectCommand({
            Bucket: S3_CONFIG.bucket,
            Key: objectName,
        }))
        return true
    } catch (error) {
        console.error('Failed to delete object from S3:', error)
        return false
    }
}
