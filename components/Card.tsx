'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { PhotoProvider, PhotoView } from 'react-photo-view'
import { formatFileSize, formatFileType } from '@/lib/format'
import { useI18n } from '@/lib/i18n/context'
import 'react-photo-view/dist/react-photo-view.css'

interface CardProps {
  content?: string
  createdAt: string
  expiresAt: string
  type: string
  fileName?: string
  fileSize?: number
  filePath?: string
  fileType?: string
}

export function Card({ content, createdAt, expiresAt, type, fileName, fileSize, filePath, fileType }: CardProps) {
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const { t } = useI18n()

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const expires = new Date(expiresAt).getTime()
      const remaining = expires - now

      if (remaining > 0) {
        setTimeLeft(remaining)
      } else {
        setTimeLeft(0)
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [expiresAt])

  if (timeLeft <= 0) {
    return null
  }

  const isExpiringSoon = timeLeft > 0 && timeLeft <= 60000 // 1分钟 = 60000毫秒
  const progressPercentage = isExpiringSoon ? (timeLeft / 60000) * 100 : 0

  const isUrl = (text: string | undefined) => {
    if (!text) return false;
    try {
      new URL(text);
      return true;
    } catch {
      return false;
    }
  }

  const fallbackCopyToClipboard = (text: string) => {
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    
    try {
      document.execCommand('copy')
    } catch (err) {
      console.error('复制失败:', err)
    }
    
    document.body.removeChild(textArea)
  }

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(content ?? '')
      } else {
        fallbackCopyToClipboard(content ?? '')
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('复制失败:', err)
      fallbackCopyToClipboard(content ?? '')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const renderFileInfo = () => (
    <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
      <div>{new Date(createdAt).toLocaleString()}</div>
      <div className="flex items-center justify-between">
        <span>{formatFileSize(fileSize!)}</span>
        <a 
          href={filePath}
          download={fileName}
          className="text-blue-500 hover:text-blue-600"
          onClick={(e) => e?.stopPropagation?.()}
        >
          {t.common.download}
        </a>
      </div>
    </div>
  )

  const renderExpiryProgress = () => {
    if (!isExpiringSoon) return null

    return (
      <div className="mt-3">
        <div className="flex justify-between text-xs text-red-500 dark:text-red-400 mb-1">
          <span>{t.common.expiringSoon}</span>
          <span>{Math.ceil(timeLeft / 1000)}s</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
          <div
            className="bg-red-500 h-1.5 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    )
  }

  if (type === 'video') {
    return (
      <div className="p-4 bg-white dark:bg-[#1a1a1a] rounded-lg shadow">
        <div className="aspect-video mb-2">
          <video 
            src={filePath} 
            controls
            className="w-full h-full rounded"
            preload="metadata"
          >
            {t.common.videoNotSupported}
          </video>
        </div>
        {renderFileInfo()}
        {renderExpiryProgress()}
      </div>
    )
  }

  if (type === 'file') {
    return (
      <div className="p-4 bg-white dark:bg-[#1a1a1a] rounded-lg shadow h-fit">
        <div className="mb-2">
          <p className="font-medium mb-1 break-words">{fileName}</p>
          <p className="text-sm text-gray-500">
            {formatFileType(fileType)}
          </p>
        </div>
        {renderFileInfo()}
        {renderExpiryProgress()}
      </div>
    )
  }

  if (type === 'image') {
    return (
      <PhotoProvider>
        <div className="p-4 bg-white dark:bg-[#1a1a1a] rounded-lg shadow hover:shadow-md dark:shadow-gray-900 transition-shadow cursor-pointer border border-gray-100 dark:border-gray-800">
          <PhotoView src={filePath!}>
            <div className="relative aspect-video mb-2">
              <Image
                src={filePath!}
                alt={fileName || t.common.image}
                fill
                className="object-cover rounded"
              />
            </div>
          </PhotoView>
          {renderFileInfo()}
          {renderExpiryProgress()}
        </div>
      </PhotoProvider>
    )
  }

  if (type === 'audio') {
    return (
      <div className="p-4 bg-white dark:bg-[#1a1a1a] rounded-lg shadow h-fit">
        <div className="mb-2">
          <audio 
            controls
            className="w-full"
            preload="metadata"
            onError={(e) => {
              const target = e.target as HTMLAudioElement;
              target.parentElement?.classList.add('hidden');
              const fallback = target.parentElement?.nextElementSibling;
              if (fallback) {
                fallback.classList.remove('hidden');
              }
            }}
          >
            <source src={filePath} type={fileType} />
            {t.common.audioNotSupported}
          </audio>
          
          <div className="hidden flex items-center justify-between">
            <div className="flex-1 mr-4">
              <p className="font-medium mb-1">{fileName}</p>
              <p className="text-sm text-gray-500">
                {formatFileType(fileType)}
              </p>
            </div>
          </div>
        </div>
        {renderFileInfo()}
        {renderExpiryProgress()}
      </div>
    )
  }

  return (
    <div 
      className="p-4 bg-white dark:bg-[#1a1a1a] rounded-lg shadow hover:shadow-md dark:shadow-gray-900 transition-shadow cursor-pointer border border-gray-100 dark:border-gray-800 h-fit max-h-[300px] flex flex-col"
      onClick={() => {
        if (content && isUrl(content)) {
          window.open(content, '_blank');
        } else {
          handleCopy();
        }
      }}
    >
      <p 
        className="text-gray-800 dark:text-gray-100 break-words whitespace-pre-wrap line-clamp-[10] overflow-hidden flex-1"
        title={content || ''}
      >
        {content}
      </p>
      <div className="mt-2 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
        <span>{new Date(createdAt).toLocaleString()}</span>
        <div className="flex items-center gap-2">
          {content && isUrl(content) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopy();
              }}
              className="text-blue-500 hover:text-blue-600"
            >
              {copied ? t.common.copied : t.common.copy}
            </button>
          )}
          {!isUrl(content) && (
            <span className={copied ? "text-green-500 dark:text-green-400" : ""}>
              {copied ? t.common.copied : t.common.clickToCopy}
            </span>
          )}
        </div>
      </div>
      {renderExpiryProgress()}
    </div>
  )
}