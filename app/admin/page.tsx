'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card as PrismaCard } from '@prisma/client'
import { Dialog } from '@headlessui/react'
import Link from 'next/link'
import { formatFileSize, getFileTypeIcon, formatFileType } from '@/lib/format'

export default function AdminPage() {
  const [cards, setCards] = useState<PrismaCard[]>([])
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [expirationMinutes, setExpirationMinutes] = useState(60)
  const [isExpirationOpen, setIsExpirationOpen] = useState(false)
  const [expirationError, setExpirationError] = useState('')
  const router = useRouter()

  const checkAuth = useCallback(async () => {
    const res = await fetch('/api/auth/check')
    const data = await res.json()
    
    if (!data.success) {
      router.push('/admin/login')
      return
    }
    
    if (data.isDefaultPassword) {
      setIsChangePasswordOpen(true)
    }
  }, [router])

  const fetchCards = useCallback(async () => {
    const res = await fetch('/api/cards')
    const data = await res.json()
    setCards(data)
  }, [])
  
  const fetchExpirationSetting = useCallback(async () => {
    const res = await fetch('/api/settings')
    const data = await res.json()
    if (data.success) {
      setExpirationMinutes(data.data)
    }
  }, [])

  useEffect(() => {
    checkAuth()
    fetchCards()
    fetchExpirationSetting()
  }, [checkAuth, fetchCards, fetchExpirationSetting])

  const handleDelete = async (id: number) => {
    await fetch(`/api/cards/${id}`, {
      method: 'DELETE',
    })
    fetchCards()
  }

  const handleDeleteAll = async () => {
    await fetch('/api/cards', {
      method: 'DELETE',
    })
    setIsConfirmOpen(false)
    fetchCards()
  }

  const handleChangePassword = async () => {
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      })
      
      const data = await res.json()
      
      if (data.success) {
        setIsChangePasswordOpen(false)
        setOldPassword('')
        setNewPassword('')
        setError('')
      } else {
        setError(data.message)
      }
    } catch {
      setError('修改失败')
    }
  }

  const handleUpdateExpiration = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expirationMinutes }),
      })
      
      const data = await res.json()
      
      if (data.success) {
        setIsExpirationOpen(false)
        setExpirationError('')
      } else {
        setExpirationError(data.message)
      }
    } catch {
      setExpirationError('更新失败')
    }
  }

  const renderCardContent = (card: PrismaCard) => {
    if (card.type === 'text') {
      return <p className="break-all">{card.content}</p>
    }

    return (
      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
        <div className="flex items-center gap-2">
          <span>{getFileTypeIcon(card.type)}</span>
          <span className="font-medium">{card.type.charAt(0).toUpperCase() + card.type.slice(1)}</span>
        </div>
        
        {card.fileName && (
          <p className="truncate" title={card.fileName}>
            文件名: {card.fileName}
          </p>
        )}
        
        {card.fileSize && (
          <p>文件大小: {formatFileSize(card.fileSize)}</p>
        )}
        
        {card.fileType && (
          <p>文件类型: {formatFileType(card.fileType)}</p>
        )}
        
        {card.filePath && (
          <div className="flex gap-2">
            {card.type === 'video' ? (
              <>
                <a 
                  href={card.filePath}
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="text-blue-500 hover:underline"
                >
                  预览视频
                </a>
                <span>|</span>
              </>
            ) : card.type === 'image' ? (
              <>
                <a 
                  href={card.filePath}
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="text-blue-500 hover:underline"
                >
                  查看图片
                </a>
                <span>|</span>
              </>
            ) : null}
            <a 
              href={card.filePath}
              download={card.fileName}
              className="text-blue-500 hover:underline"
            >
              下载文件
            </a>
          </div>
        )}
      </div>
    )
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">管理面板</h1>
        
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/"
            className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            ← 返回首页
          </Link>

          <button
            onClick={() => setIsConfirmOpen(true)}
            disabled={cards.length === 0}
            className={`px-4 py-2 text-white rounded-lg ${
              cards.length === 0 
                ? 'bg-red-300 cursor-not-allowed' 
                : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            清空所有数据
          </button>

          <button
            onClick={() => setIsChangePasswordOpen(true)}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
          >
            修改密码
          </button>

          <div className="relative group">
            <button
              onClick={() => setIsExpirationOpen(true)}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              过期时间设置
            </button>
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block">
              <div className="bg-gray-900 text-white text-sm rounded px-3 py-1.5 whitespace-nowrap">
                当前过期时间: {expirationMinutes} 分钟
              </div>
              <div className="border-8 border-transparent border-t-gray-900 w-0 h-0 absolute left-1/2 -translate-x-1/2 -bottom-3"></div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4 mb-8">
          {cards.map((card) => (
            <div key={card.id} className="flex items-start justify-between p-4 bg-white dark:bg-[#1a1a1a] rounded-lg shadow">
              <div className="flex-1 mr-4 min-w-0 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>创建时间: {new Date(card.createdAt).toLocaleString()}</span>
                  <span>|</span>
                  <span>过期时间: {new Date(card.expiresAt).toLocaleString()}</span>
                </div>
                
                {renderCardContent(card)}

                <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                  <p>IP: {card.ipAddress}</p>
                  <p className="truncate" title={card.userAgent || undefined}>
                    UA: {card.userAgent || '-'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleDelete(card.id)}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
              >
                删除
              </button>
            </div>
          ))}
        </div>

        <Dialog
          open={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="mx-auto max-w-sm rounded bg-white dark:bg-gray-800 p-6">
              <Dialog.Title className="text-lg font-medium mb-4">确认删除</Dialog.Title>
              <Dialog.Description className="mb-4">
                确定要删除所有数据吗？此操作不可撤销。
              </Dialog.Description>

              <div className="flex justify-end gap-4">
                <button
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={() => setIsConfirmOpen(false)}
                >
                  取消
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={handleDeleteAll}
                >
                  确认删除
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>

        <Dialog
          open={isChangePasswordOpen}
          onClose={() => setIsChangePasswordOpen(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="mx-auto max-w-sm rounded bg-white dark:bg-gray-800 p-6">
              <Dialog.Title className="text-lg font-medium mb-4">
                修改密码
              </Dialog.Title>
              
              <div className="space-y-4">
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="原密码"
                />
                
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="新密码"
                />
                
                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}
                
                <div className="flex justify-end gap-4">
                  <button
                    className="px-4 py-2 text-gray-500"
                    onClick={() => setIsChangePasswordOpen(false)}
                  >
                    取消
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                    onClick={handleChangePassword}
                  >
                    确认修改
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>

        <Dialog
          open={isExpirationOpen}
          onClose={() => setIsExpirationOpen(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="mx-auto max-w-sm rounded bg-white dark:bg-gray-800 p-6">
              <Dialog.Title className="text-lg font-medium mb-4">
                设置过期时间
              </Dialog.Title>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={expirationMinutes}
                    onChange={(e) => setExpirationMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 px-4 py-2 border rounded-lg"
                  />
                  <span>分钟</span>
                </div>
                
                <p className="text-sm text-gray-500">
                  最小设置为1分钟
                </p>
                
                {expirationError && (
                  <p className="text-red-500 text-sm">{expirationError}</p>
                )}
                
                <div className="flex justify-end gap-4">
                  <button
                    className="px-4 py-2 text-gray-500"
                    onClick={() => setIsExpirationOpen(false)}
                  >
                    取消
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                    onClick={handleUpdateExpiration}
                  >
                    确认修改
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </div>
    </main>
  )
}