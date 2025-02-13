'use client'

import { useState, useRef, useEffect } from 'react'
import { FileInfo } from '@/app/page'
import { checkFileSize, validateFileType } from '@/lib/uploadLimit'
import { useI18n } from '@/lib/i18n/context'
import { PaperAirplaneIcon, PaperClipIcon } from '@heroicons/react/24/outline'

interface TextInputProps {
  onSubmit: (content: string, type: string, fileInfo?: FileInfo) => void
}

export function TextInput({ onSubmit }: TextInputProps) {
  const { t } = useI18n()
  const [content, setContent] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [minioEnabled, setMinioEnabled] = useState(false)
  const [placeholder, setPlaceholder] = useState(t.home.textPlaceholder)
  const [isMobile, setIsMobile] = useState(false)

  const adjustHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }

  useEffect(() => {
    adjustHeight()
  }, [content])

  useEffect(() => {
    const checkMinioStatus = async () => {
      try {
        const res = await fetch('/api/minio/health')
        const data = await res.json()
        setMinioEnabled(data.enabled)
      } catch (error) {
        console.error('Failed to check MinIO status:', error)
        setMinioEnabled(false)
      }
    }

    checkMinioStatus()
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setPlaceholder(t.home.textPlaceholderMobile || '输入您想问的问题...')
      } else {
        setPlaceholder(t.home.textPlaceholder)
      }
    }

    handleResize()

    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [t.home.textPlaceholder, t.home.textPlaceholderMobile])

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      setIsMobile(isMobileDevice)
    }

    checkMobile()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim()) {
      onSubmit(content, 'text')
      setContent('')
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      
      const sizeCheck = checkFileSize(file.size)
      if (!sizeCheck.allowed) {
        alert(sizeCheck.message)
        return
      }

      const typeCheck = validateFileType(file.type, file.name)
      if (!typeCheck.allowed) {
        alert(typeCheck.message)
        return
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size
        }),
      })
      
      const result = await res.json()
      
      if (!result.success) {
        alert(result.message || '获取上传链接失败')
        return
      }

      await fetch(result.data.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })

      onSubmit('', result.data.fileType, {
        fileName: file.name,
        fileType: file.type,
        objectName: result.data.objectName,
        fileUrl: result.data.fileUrl,
        fileSize: file.size,
      })

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('上传失败: ' + (error instanceof Error ? error.message : '未知错误'))
    } finally {
      setIsUploading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey || isMobile) {
        return
      } else {
        e.preventDefault()
        handleSubmit(e as unknown as React.FormEvent)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[44px] max-h-[200px] overflow-y-auto"
        placeholder={placeholder}
        rows={1}
      />
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileUpload}
        className="hidden"
      />
      {minioEnabled && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="h-11 w-16 flex items-center justify-center bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 flex-shrink-0"
          title={isUploading ? t.home.uploading : t.home.uploadButton}
        >
          <PaperClipIcon className="h-5 w-5" />
        </button>
      )}
      <button
        type="submit"
        className="h-11 w-16 flex items-center justify-center bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-shrink-0"
        title={t.common.send}
      >
        <PaperAirplaneIcon className="h-5 w-5" />
      </button>
    </form>
  )
}