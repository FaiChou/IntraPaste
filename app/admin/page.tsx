'use client'

import { useState, useEffect } from 'react'
import { Card as PrismaCard } from '@prisma/client'
import { Dialog } from '@headlessui/react'

export default function AdminPage() {
  const [cards, setCards] = useState<PrismaCard[]>([])
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  
  useEffect(() => {
    fetchCards()
  }, [])

  const fetchCards = async () => {
    const res = await fetch('/api/cards')
    const data = await res.json()
    setCards(data)
  }

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

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">管理面板</h1>
        
        <div className="space-y-4 mb-8">
          {cards.map((card) => (
            <div key={card.id} className="flex items-center justify-between p-4 bg-white dark:bg-[#1a1a1a] rounded-lg shadow">
              <div className="flex-1 mr-4 min-w-0">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  {new Date(card.createdAt).toLocaleString()}
                </p>
                <p className="truncate">{card.content}</p>
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

        <button
          onClick={() => setIsConfirmOpen(true)}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          清空所有数据
        </button>

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
      </div>
    </main>
  )
} 