'use client'

import { useState } from 'react'

interface CardProps {
  content: string
  createdAt: string
}

export function Card({ content, createdAt }: CardProps) {
  const [copied, setCopied] = useState(false)

  const fallbackCopyToClipboard = (text: string) => {
    // 创建临时textarea
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
      // 优先使用现代API
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(content)
      } else {
        // 降级使用传统方法
        fallbackCopyToClipboard(content)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('复制失败:', err)
      // 尝试降级方案
      fallbackCopyToClipboard(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div 
      className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCopy}
    >
      <p className="text-gray-800 break-words">{content}</p>
      <div className="mt-2 flex justify-between items-center text-sm text-gray-500">
        <span>{new Date(createdAt).toLocaleString()}</span>
        <span>{copied ? '已复制!' : '点击复制'}</span>
      </div>
    </div>
  )
}