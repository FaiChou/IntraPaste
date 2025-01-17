'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card as PrismaCard } from '@prisma/client'
import { Dialog } from '@headlessui/react'
import Link from 'next/link'

export default function AdminPage() {
  const [cards, setCards] = useState<PrismaCard[]>([])
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
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
  
  useEffect(() => {
    checkAuth()
    fetchCards()
  }, [checkAuth, fetchCards])

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
        </div>
        
        <div className="space-y-4 mb-8">
          {cards.map((card) => (
            <div key={card.id} className="flex items-center justify-between p-4 bg-white dark:bg-[#1a1a1a] rounded-lg shadow">
              <div className="flex-1 mr-4 min-w-0 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>创建时间: {new Date(card.createdAt).toLocaleString()}</span>
                  <span>|</span>
                  <span>过期时间: {new Date(card.expiresAt).toLocaleString()}</span>
                </div>
                
                <div className="space-y-1">
                  {card.content && (
                    <p className="break-all">{card.content}</p>
                  )}
                  
                  {card.type === 'image' && (
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                      <p>类型: 图片</p>
                      {card.fileName && <p>文件名: {card.fileName}</p>}
                      {card.fileSize && <p>文件大小: {(card.fileSize / 1024 / 1024).toFixed(2)} MB</p>}
                      {card.fileType && <p>文件类型: {card.fileType}</p>}
                      {card.filePath && (
                        <a 
                          href={card.filePath}
                          target="_blank"
                          rel="noopener noreferrer" 
                          className="text-blue-500 hover:underline"
                        >
                          查看图片
                        </a>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-xs text-gray-400 dark:text-gray-500 space-y-1">
                  <p>IP: {card.ipAddress}</p>
                  <p>UA: {card.userAgent}</p>
                </div>
              </div>
              
              <button
                onClick={() => handleDelete(card.id)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded shrink-0"
              >
                🗑️
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
      </div>
    </main>
  )
} 