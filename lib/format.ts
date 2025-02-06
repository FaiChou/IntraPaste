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
    return mimeType.split('/')[1].toUpperCase()
  }
  if (mimeType.startsWith('audio/')) {
    return mimeType.split('/')[1].toUpperCase()
  }

  // 如果都不匹配，返回简化的MIME类型
  return mimeType.split('/').pop()?.toUpperCase() || '未知类型'
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