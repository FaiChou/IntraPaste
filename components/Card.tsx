'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Dialog } from '@headlessui/react'
import { formatFileSize, formatFileType } from '@/lib/format'
import { useI18n } from '@/lib/i18n/context'

interface CardProps {
  content?: string
  createdAt: string
  type: string
  fileName?: string
  fileSize?: number
  filePath?: string
  fileType?: string
}

export function Card({ content, createdAt, type, fileName, fileSize, filePath, fileType }: CardProps) {
  const [copied, setCopied] = useState(false)
  const [isImageOpen, setIsImageOpen] = useState(false)
  const { t } = useI18n()

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
      </div>
    )
  }

  if (type === 'file') {
    return (
      <div className="p-4 bg-white dark:bg-[#1a1a1a] rounded-lg shadow h-fit">
        <div className="mb-2">
          <p className="font-medium mb-1">{fileName}</p>
          <p className="text-sm text-gray-500">
            {formatFileType(fileType)}
          </p>
        </div>
        {renderFileInfo()}
      </div>
    )
  }

  if (type === 'image') {
    return (
      <>
        <div className="p-4 bg-white dark:bg-[#1a1a1a] rounded-lg shadow hover:shadow-md dark:shadow-gray-900 transition-shadow cursor-pointer border border-gray-100 dark:border-gray-800">
          <div 
            className="relative aspect-video mb-2"
            onClick={() => setIsImageOpen(true)}
          >
            <Image
              src={filePath!}
              alt={fileName || t.common.image}
              fill
              className="object-cover rounded"
            />
          </div>
          {renderFileInfo()}
        </div>

        <Dialog
          open={isImageOpen}
          onClose={() => setIsImageOpen(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
          
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="max-w-4xl w-full relative aspect-[16/9]">
              <Image
                src={filePath!}
                alt={fileName || t.common.image}
                fill
                className="rounded object-contain"
                sizes="(max-width: 896px) 100vw, 896px"
                priority
              />
            </Dialog.Panel>
          </div>
        </Dialog>
      </>
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
      </div>
    )
  }

  return (
    <div 
      className="p-4 bg-white dark:bg-[#1a1a1a] rounded-lg shadow hover:shadow-md dark:shadow-gray-900 transition-shadow cursor-pointer border border-gray-100 dark:border-gray-800 h-fit max-h-[300px] flex flex-col"
      onClick={handleCopy}
    >
      <p 
        className="text-gray-800 dark:text-gray-100 break-words whitespace-pre-wrap line-clamp-[10] overflow-hidden flex-1"
        title={content || ''}
      >
        {content}
      </p>
      <div className="mt-2 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
        <span>{new Date(createdAt).toLocaleString()}</span>
        <span>{copied ? t.common.copied : t.common.clickToCopy}</span>
      </div>
    </div>
  )
}