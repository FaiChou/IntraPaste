interface UploadRecord {
  ip: string;
  uploadHistory: number[];
}

// 使用 Map 来存储,比数组查找更快
const userUploadRecord = new Map<string, number[]>();

export function checkUploadLimit(ip: string): { allowed: boolean; message?: string } {
  const now = Date.now();
  const oneMinuteAgo = now - 60 * 1000;
  const oneHourAgo = now - 60 * 60 * 1000;
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  // 获取该IP的上传历史
  let history = userUploadRecord.get(ip) || [];
  
  // 清理超过24小时的记录
  history = history.filter(time => time > oneDayAgo);
  
  // 计算各时间段的上传次数
  const minuteCount = history.filter(time => time > oneMinuteAgo).length;
  const hourCount = history.filter(time => time > oneHourAgo).length;
  const dayCount = history.length; // 已经过滤掉了24小时前的记录

  // 检查限制
  if (minuteCount >= 20) {
    return { allowed: false, message: '已达到每分钟上传限制(20次/分钟)' };
  }
  if (hourCount >= 200) {
    return { allowed: false, message: '已达到每小时上传限制(200次/小时)' };
  }
  if (dayCount >= 1000) {
    return { allowed: false, message: '已达到每天上传限制(1000次/天)' };
  }

  // 记录这次上传
  history.push(now);
  userUploadRecord.set(ip, history);

  return { allowed: true };
}

// 导出清理函数和记录Map供cleanup使用
export function cleanupUploadRecords() {
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  let cleanedCount = 0;
  
  for (const [ip, history] of userUploadRecord.entries()) {
    // 只保留24小时内的记录
    const validHistory = history.filter(time => time > oneDayAgo);
    if (validHistory.length === 0) {
      userUploadRecord.delete(ip);
      cleanedCount++;
    } else {
      userUploadRecord.set(ip, validHistory);
    }
  }

  return cleanedCount;
}

export function getUploadRecordSize() {
  return userUploadRecord.size;
} 