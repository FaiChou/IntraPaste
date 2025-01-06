import cron from 'node-cron'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export function startCleanupJob() {
  // 每天凌晨2点执行清理
  cron.schedule('0 2 * * *', async () => {
    try {
      await prisma.card.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      })
      console.log('Cleanup completed')
    } catch (error) {
      console.error('Cleanup failed:', error)
    }
  })
}