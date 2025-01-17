'use client'

import { useState, useEffect } from 'react'
import { Card as CardComponent } from '@/components/Card'
import { TextInput } from '@/components/TextInput'
import { Card as PrismaCard } from '@prisma/client'

export default function Home() {
  const [cards, setCards] = useState<PrismaCard[]>([])

  useEffect(() => {
    fetchCards()
  }, [])

  const fetchCards = async () => {
    const res = await fetch('/api/cards')
    const data = await res.json()
    setCards(data)
  }

  const handleNewCard = async (content: string, type: string, fileInfo?: any) => {
    const payload = type === 'text' 
      ? { content, type }
      : {
          type,
          fileName: fileInfo.fileName,
          fileType: fileInfo.fileType,
          objectName: fileInfo.objectName,
          fileUrl: fileInfo.fileUrl,
        }

    await fetch('/api/cards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    fetchCards()
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">IntraPaste</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 auto-rows-min">
          {cards.map((card: PrismaCard) => (
            <CardComponent
              key={card.id} 
              content={card.content}
              createdAt={typeof card.createdAt === 'string' ? card.createdAt : card.createdAt.toISOString()} 
              type={card.type}
              fileName={card.fileName}
              fileSize={card.fileSize}
              filePath={card.filePath}
            />
          ))}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-4xl mx-auto">
            <TextInput onSubmit={handleNewCard} />
          </div>
        </div>
      </div>
    </main>
  )
}
