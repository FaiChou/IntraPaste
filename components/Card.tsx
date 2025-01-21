'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Dialog } from '@headlessui/react'

interface CardProps {
  content?: string
  createdAt: string
  type: string
  fileName?: string
  fileSize?: number
  filePath?: string
}

export function Card({ content, createdAt, type, fileName, fileSize, filePath }: CardProps) {
  const [copied, setCopied] = useState(false)
  const [isImageOpen, setIsImageOpen] = useState(false)

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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
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
              alt={fileName || '图片'}
              fill
              className="object-cover rounded"
            />
          </div>
          <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
            <span>{new Date(createdAt).toLocaleString()}</span>
            <div className="flex items-center gap-2">
              <span>({formatFileSize(fileSize!)})</span>
              <a 
                href={filePath}
                download={fileName}
                className="text-blue-500 hover:text-blue-600"
                onClick={(e) => e.stopPropagation()}
              >
                下载
              </a>
            </div>
          </div>
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
                alt={fileName || '图片'}
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

  return (
    <div 
      className="p-4 bg-white dark:bg-[#1a1a1a] rounded-lg shadow hover:shadow-md dark:shadow-gray-900 transition-shadow cursor-pointer border border-gray-100 dark:border-gray-800 h-fit max-h-[300px] flex flex-col"
      onClick={handleCopy}
    >
      <p className="text-gray-800 dark:text-gray-100 break-words whitespace-pre-wrap line-clamp-[10] overflow-hidden flex-1">{content}</p>
      <div className="mt-2 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
        <span>{new Date(createdAt).toLocaleString()}</span>
        <span>{copied ? '已复制!' : '点击复制'}</span>
      </div>
    </div>
  )
}