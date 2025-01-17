import cron from 'node-cron'
import { prisma } from './prisma'
import { deleteObject } from './minio'

export function startCleanupJob() {
  // 每天凌晨2点执行清理
  cron.schedule('0 2 * * *', async () => {
    try {
      // 先查找需要删除的过期记录
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
      let deletedCount = 0
      // 删除 MinIO 中的文件
      for (const card of expiredCards) {
        console.log('Deleting minio file, card id:', card.id, 'with filePath:', card.filePath)
        if (card.filePath) {
          // 从文件URL中提取对象名称
          const objectName = card.filePath.split('/').pop()
          if (objectName) {
            await deleteObject(objectName)
            deletedCount++
          }
        }
      }
      console.log(`Cleanup completed: ${deletedCount} minio files deleted`)

      // 删除数据库记录
      const result = await prisma.card.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      })
      
      console.log(`Cleanup completed: ${result.count} cards deleted`)
    } catch (error) {
      console.error('Cleanup failed:', error)
    }
  })
}