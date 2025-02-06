// Using Map for faster lookups compared to array
const userUploadRecord = new Map<string, number[]>();

const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1GB in bytes

export function checkUploadLimit(ip: string): { allowed: boolean; message?: string } {
  const now = Date.now();
  const oneMinuteAgo = now - 60 * 1000;
  const oneHourAgo = now - 60 * 60 * 1000;
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  let history = userUploadRecord.get(ip) || [];
  
  // Clean records older than 24 hours
  history = history.filter(time => time > oneDayAgo);
  
  const minuteCount = history.filter(time => time > oneMinuteAgo).length;
  const hourCount = history.filter(time => time > oneHourAgo).length;
  const dayCount = history.length;

  // Check limits
  if (minuteCount >= 20) {
    return { allowed: false, message: 'Rate limit reached (20/minute)' };
  }
  if (hourCount >= 200) {
    return { allowed: false, message: 'Rate limit reached (200/hour)' };
  }
  if (dayCount >= 1000) {
    return { allowed: false, message: 'Rate limit reached (1000/day)' };
  }

  history.push(now);
  userUploadRecord.set(ip, history);

  return { allowed: true };
}

export function cleanupUploadRecords() {
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  let cleanedCount = 0;
  
  for (const [ip, history] of userUploadRecord.entries()) {
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
      message: 'File size exceeds limit (1GB)' 
    };
  }
  return { allowed: true };
}

export function validateFileType(type: string, fileName: string): { 
  allowed: boolean; 
  message?: string;
  fileType?: 'image' | 'video' | 'audio' | 'file';
} {
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  if (type.startsWith('image/')) {
    return { allowed: true, fileType: 'image' };
  }
  
  if (type.startsWith('video/')) {
    const playableVideoFormats = ['mp4', 'webm', 'mov'];
    if (ext && playableVideoFormats.includes(ext)) {
      return { allowed: true, fileType: 'video' };
    }
    return { allowed: true, fileType: 'file' };
  }

  if (type.startsWith('audio/')) {
    const playableAudioFormats = ['mp3', 'wav', 'ogg', 'm4a', 'webm', 'aac'];
    if (ext && playableAudioFormats.includes(ext)) {
      return { allowed: true, fileType: 'audio' };
    }
    return { allowed: true, fileType: 'file' };
  }
  
  return { allowed: true, fileType: 'file' };
} 