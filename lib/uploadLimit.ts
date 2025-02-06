// 使用 Map 来存储,比数组查找更快
const userUploadRecord = new Map<string, number[]>();

const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1GB in bytes

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

export function checkFileSize(size: number): { allowed: boolean; message?: string } {
  if (size > MAX_FILE_SIZE) {
    return { 
      allowed: false, 
      message: '文件大小超过限制(1GB)' 
    };
  }
  return { allowed: true };
}

export function validateFileType(type: string, fileName: string): { 
  allowed: boolean; 
  message?: string;
  fileType?: 'image' | 'video' | 'file';
} {
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  // 图片类型
  if (type.startsWith('image/')) {
    return { allowed: true, fileType: 'image' };
  }
  
  // 视频类型
  if (type.startsWith('video/')) {
    const allowedVideoFormats = ['mp4', 'webm', 'mov'];
    if (!ext || !allowedVideoFormats.includes(ext)) {
      return { 
        allowed: false, 
        message: '不支持的视频格式，仅支持 MP4, WebM, MOV' 
      };
    }
    return { allowed: true, fileType: 'video' };
  }
  
  // 其他文件类型
  return { allowed: true, fileType: 'file' };
} 