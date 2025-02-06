export function formatFileSize(bytes: number | undefined) {
  if (!bytes) return '未知大小'
  
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
}

export function formatFileType(mimeType: string | undefined) {
  if (!mimeType) return '未知类型'
  
  // 常见类型映射
  const typeMap: Record<string, string> = {
    // 文档类型
    'application/pdf': 'PDF',
    'application/msword': 'Word',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
    'application/vnd.ms-excel': 'Excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
    'application/vnd.ms-powerpoint': 'PowerPoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint',
    'application/x-iwork-pages-sffpages': 'Pages',
    'application/x-iwork-numbers-sffnumbers': 'Numbers',
    // 文本类型
    'text/plain': '文本文件',
    'text/html': 'HTML',
    'text/css': 'CSS',
    'text/javascript': 'JavaScript',
    // 压缩文件
    'application/zip': 'ZIP',
    'application/x-rar-compressed': 'RAR',
    'application/x-7z-compressed': '7Z',
    // 视频类型
    'video/x-matroska': 'MKV',
    'video/x-msvideo': 'AVI',
    'video/x-flv': 'FLV',
    'video/quicktime': 'MOV',
    'video/x-ms-wmv': 'WMV',
    'video/3gpp': '3GP',
    'video/x-m4v': 'M4V',
    'video/mpeg': 'MPEG',
    'video/mp4': 'MP4',
    'video/webm': 'WEBM',
    'video/ogg': 'OGV',
    'application/x-mpegURL': 'M3U8',
    'video/MP2T': 'TS'
  }

  // 检查是否存在于映射表中
  if (typeMap[mimeType]) {
    return typeMap[mimeType]
  }

  // 处理通用类型
  if (mimeType.startsWith('image/')) {
    return mimeType.split('/')[1].toUpperCase()
  }
  if (mimeType.startsWith('video/')) {
    // 对于未知的视频类型,尝试提取更友好的格式名
    const format = mimeType.split('/')[1]
    if (format.startsWith('x-')) {
      return format.slice(2).toUpperCase() // 移除 'x-' 前缀
    }
    return format.toUpperCase()
  }
  if (mimeType.startsWith('audio/')) {
    return mimeType.split('/')[1].toUpperCase()
  }

  // 如果都不匹配,返回简化的MIME类型
  const format = mimeType.split('/').pop() || '未知类型'
  if (format.startsWith('x-')) {
    return format.slice(2).toUpperCase() // 移除 'x-' 前缀
  }
  return format.toUpperCase()
}

export function getFileTypeIcon(type: string) {
  switch (type) {
    case 'image':
      return '🖼️'
    case 'video':
      return '🎥'
    case 'file':
      return '📄'
    default:
      return '📝'
  }
}