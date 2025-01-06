'use client'

import { useState, useRef, useEffect } from 'react'

interface TextInputProps {
  onSubmit: (content: string) => void
}

export function TextInput({ onSubmit }: TextInputProps) {
  const [content, setContent] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      // 重置高度以获取正确的 scrollHeight
      textarea.style.height = 'auto'
      // 设置新高度
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }

  // 监听内容变化
  useEffect(() => {
    adjustHeight()
  }, [content])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim()) {
      onSubmit(content)
      setContent('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Shift + Enter: 允许换行
        return
      } else {
        // 普通 Enter: 提交表单
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
      <button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        发送
      </button>
    </form>
  )
}