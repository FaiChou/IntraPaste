import cron from 'node-cron'
import { prisma } from './prisma'
import { deleteObject } from './minio'
import { cleanupUploadRecords, getUploadRecordSize } from './uploadLimit'
import { logger } from './logger'

export function startCleanupJob() {
  logger.logSystem('CLEANUP', {
    action: 'start_cleanup_job',
    details: { message: 'Cleanup job scheduled for 2 AM daily' }
  })

  cron.schedule('0 2 * * *', async () => {
    try {
      logger.logSystem('CLEANUP', {
        action: 'cleanup_started',
        details: { message: 'Starting daily cleanup task' }
      })

      const expiredCards = await prisma.card.findMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
        select: {
          id: true,
          filePath: true,
        },
      })

      logger.logSystem('CLEANUP', {
        action: 'found_expired_cards',
        details: {
          count: expiredCards.length
        }
      })

      let deletedCount = 0
      for (const card of expiredCards) {
        logger.debug('CLEANUP', {
          action: 'deleting_file',
          details: {
            cardId: card.id,
            filePath: card.filePath
          }
        })

        if (card.filePath) {
          const objectName = card.filePath.split('/').pop()
          if (objectName) {
            await deleteObject(objectName)
            deletedCount++
          }
        }
      }

      const result = await prisma.card.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      })
      
      // 清理上传记录
      const beforeSize = getUploadRecordSize();
      const cleanedRecords = cleanupUploadRecords();
      const afterSize = getUploadRecordSize();
      
      logger.logSystem('CLEANUP', {
        action: 'cleanup_completed',
        details: {
          deletedFiles: deletedCount,
          deletedCards: result.count,
          uploadRecords: {
            before: beforeSize,
            cleaned: cleanedRecords,
            after: afterSize
          }
        }
      })
    } catch (error) {
      logger.logSystem('CLEANUP', {
        action: 'cleanup_failed',
        error: error instanceof Error ? error : new Error(String(error))
      })
    }
  })

  // 每10分钟清理一次上传记录
  cron.schedule('*/10 * * * *', () => {
    try {
      const beforeSize = getUploadRecordSize();
      const cleanedRecords = cleanupUploadRecords();
      const afterSize = getUploadRecordSize();

      logger.logSystem('CLEANUP', {
        action: 'upload_records_cleaned',
        details: {
          before: beforeSize,
          cleaned: cleanedRecords,
          after: afterSize
        }
      })
    } catch (error) {
      logger.logSystem('CLEANUP', {
        action: 'upload_records_cleanup_failed',
        error: error instanceof Error ? error : new Error(String(error))
      })
    }
  })
}