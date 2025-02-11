'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card as PrismaCard } from '@prisma/client'
import { Dialog } from '@headlessui/react'
import Link from 'next/link'
import { formatFileSize, getFileTypeIcon, formatFileType } from '@/lib/format'
import { useI18n } from '@/lib/i18n/context'

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
  const { t, language, setLanguage } = useI18n()

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
            {t.admin.fileInfo.fileName}: {card.fileName}
          </p>
        )}
        
        {card.fileSize && (
          <p>{t.admin.fileInfo.fileSize}: {formatFileSize(card.fileSize)}</p>
        )}
        
        {card.fileType && (
          <p>{t.admin.fileInfo.fileType}: {formatFileType(card.fileType)}</p>
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
                  {t.common.preview}
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
                  {t.common.preview}
                </a>
                <span>|</span>
              </>
            ) : null}
            <a 
              href={card.filePath}
              download={card.fileName}
              className="text-blue-500 hover:underline"
            >
              {t.common.download}
            </a>
          </div>
        )}
      </div>
    )
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">{t.admin.title}</h1>
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-4 mb-8">
          <Link 
            href="/"
            className="inline-flex justify-center items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            {t.admin.backToHome}
          </Link>

          <button
            onClick={() => setIsConfirmOpen(true)}
            disabled={cards.length === 0}
            className={`inline-flex justify-center items-center px-4 py-2 text-white rounded-lg ${
              cards.length === 0 
                ? 'bg-red-300 cursor-not-allowed' 
                : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            {t.admin.clearAll}
          </button>

          <button
            onClick={() => setIsChangePasswordOpen(true)}
            className="inline-flex justify-center items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
          >
            {t.admin.changePassword}
          </button>

          <button
            onClick={() => setIsExpirationOpen(true)}
            className="inline-flex justify-center items-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            {t.admin.expirationSetting}
          </button>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'en' | 'zh')}
            className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-center md:text-left"
          >
            <option value="en">English</option>
            <option value="zh">中文</option>
          </select>
        </div>
        
        <div className="space-y-4 mb-8">
          {cards.map((card) => (
            <div key={card.id} className="flex items-start justify-between p-4 bg-white dark:bg-[#1a1a1a] rounded-lg shadow">
              <div className="flex-1 mr-4 min-w-0 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>{t.admin.fileInfo.createdAt}: {new Date(card.createdAt).toLocaleString()}</span>
                  <span>|</span>
                  <span>{t.admin.fileInfo.expiresAt}: {new Date(card.expiresAt).toLocaleString()}</span>
                </div>
                
                {renderCardContent(card)}

                <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                  <p>{t.admin.fileInfo.ip}: {card.ipAddress}</p>
                  <p className="truncate" title={card.userAgent || undefined}>
                    {t.admin.fileInfo.ua}: {card.userAgent || '-'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleDelete(card.id)}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
              >
                {t.common.delete}
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
              <Dialog.Title className="text-lg font-medium mb-4">{t.admin.confirmDelete.title}</Dialog.Title>
              <Dialog.Description className="mb-4">
                {t.admin.confirmDelete.message}
              </Dialog.Description>

              <div className="flex justify-end gap-4">
                <button
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={() => setIsConfirmOpen(false)}
                >
                  {t.common.cancel}
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={handleDeleteAll}
                >
                  {t.common.confirm}
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
                {t.admin.password.title}
              </Dialog.Title>
              
              <div className="space-y-4">
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder={t.admin.password.oldPassword}
                />
                
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder={t.admin.password.newPassword}
                />
                
                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}
                
                <div className="flex justify-end gap-4">
                  <button
                    className="px-4 py-2 text-gray-500"
                    onClick={() => setIsChangePasswordOpen(false)}
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                    onClick={handleChangePassword}
                  >
                    {t.common.confirm}
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
                {t.admin.expiration.title}
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
                  <span>{t.admin.expiration.minutes}</span>
                </div>
                
                <p className="text-sm text-gray-500">
                  {t.admin.expiration.minTime}
                </p>
                
                {expirationError && (
                  <p className="text-red-500 text-sm">{expirationError}</p>
                )}
                
                <div className="flex justify-end gap-4">
                  <button
                    className="px-4 py-2 text-gray-500"
                    onClick={() => setIsExpirationOpen(false)}
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                    onClick={handleUpdateExpiration}
                  >
                    {t.common.confirm}
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