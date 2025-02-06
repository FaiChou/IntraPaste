export function formatFileSize(bytes: number | undefined) {
  if (!bytes) return 'Unknown Size'
  
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
}

export function formatFileType(mimeType: string | undefined) {
  if (!mimeType) return 'Unknown Type'
  
  // Common type mappings
  const typeMap: Record<string, string> = {
    // Document types
    'application/pdf': 'PDF',
    'application/msword': 'Word',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
    'application/vnd.ms-excel': 'Excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
    'application/vnd.ms-powerpoint': 'PowerPoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint',
    'application/x-iwork-pages-sffpages': 'Pages',
    'application/x-iwork-numbers-sffnumbers': 'Numbers',
    // Text types
    'text/plain': 'Text File',
    'text/html': 'HTML',
    'text/css': 'CSS',
    'text/javascript': 'JavaScript',
    // Archive types
    'application/zip': 'ZIP',
    'application/x-rar-compressed': 'RAR',
    'application/x-7z-compressed': '7Z',
    // Video types
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
    'video/MP2T': 'TS',
    // Audio types
    'audio/mpeg': 'MP3',
    'audio/mp4': 'M4A',
    'audio/ogg': 'OGG',
    'audio/wav': 'WAV',
    'audio/x-m4a': 'M4A',
    'audio/webm': 'WEBM',
    'audio/aac': 'AAC',
    'audio/flac': 'FLAC',
    'audio/x-ms-wma': 'WMA',
  }

  // Check if exists in mapping
  if (typeMap[mimeType]) {
    return typeMap[mimeType]
  }

  // Handle generic types
  if (mimeType.startsWith('image/')) {
    return mimeType.split('/')[1].toUpperCase()
  }
  if (mimeType.startsWith('video/')) {
    // For unknown video types, try to extract a friendlier format name
    const format = mimeType.split('/')[1]
    if (format.startsWith('x-')) {
      return format.slice(2).toUpperCase() // Remove 'x-' prefix
    }
    return format.toUpperCase()
  }
  if (mimeType.startsWith('audio/')) {
    return mimeType.split('/')[1].toUpperCase()
  }

  // If no match, return simplified MIME type
  const format = mimeType.split('/').pop() || 'Unknown Type'
  if (format.startsWith('x-')) {
    return format.slice(2).toUpperCase() // Remove 'x-' prefix
  }
  return format.toUpperCase()
}

export function getFileTypeIcon(type: string) {
  switch (type) {
    case 'image':
      return '🖼️'
    case 'video':
      return '🎥'
    case 'audio':
      return '🎵'
    case 'file':
      return '📄'
    default:
      return '📝'
  }
}