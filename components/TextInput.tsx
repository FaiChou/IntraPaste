'use client'

import { useState, useRef, useEffect } from 'react'
import { FileInfo } from '@/app/page'

interface TextInputProps {
  onSubmit: (content: string, type: string, fileInfo?: FileInfo) => void
}

export function TextInput({ onSubmit }: TextInputProps) {
  const [content, setContent] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [minioEnabled, setMinioEnabled] = useState(false)

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
    // 检查 MinIO 状态
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

    if (!file.type.startsWith('image/')) {
      alert('只支持上传图片文件')
      return
    }

    try {
      setIsUploading(true)

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
        }),
      })
      
      const result = await res.json()
      
      if (!result.success) {
        alert(result.message || '获取上传链接失败')
        return
      }

      if (!result.data?.uploadUrl) {
        alert('获取上传链接失败')
        return
      }

      await fetch(result.data.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })

      onSubmit('', 'image', {
        fileName: file.name,
        fileType: file.type,
        objectName: result.data.objectName,
        fileUrl: result.data.fileUrl,
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
      if (e.shiftKey) {
        return
      } else {
        e.preventDefault()
        handleSubmit(e as unknown as React.FormEvent)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[44px] max-h-[200px] overflow-y-auto"
        placeholder="输入要分享的文本... (Shift + Enter 换行)"
        rows={1}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      {minioEnabled && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400"
        >
          {isUploading ? '上传中...' : '上传图片'}
        </button>
      )}
      <button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        发送
      </button>
    </form>
  )
}