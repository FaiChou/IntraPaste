import cron from 'node-cron'
import { prisma } from './prisma'

export function startCleanupJob() {
  // 每天凌晨2点执行清理
  cron.schedule('0 2 * * *', async () => {
    try {
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