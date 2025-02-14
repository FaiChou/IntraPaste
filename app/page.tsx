'use client'

import { useState, useEffect } from 'react'
import { Card as CardComponent } from '@/components/Card'
import { TextInput } from '@/components/TextInput'
import { Card as PrismaCard } from '@prisma/client'
import { useI18n } from '@/lib/i18n/context'
import { translations } from '@/lib/i18n/context'
import Link from 'next/link'
import { Cog6ToothIcon } from '@heroicons/react/24/outline'
import { LanguageSelector } from '@/components/LanguageSelector'

export interface FileInfo {
  fileName: string;
  fileType: string;
  objectName: string;
  fileUrl: string;
  fileSize?: number;
}

export default function Home() {
  const { language, setLanguage, t } = useI18n()
  const [cards, setCards] = useState<PrismaCard[]>([])

  useEffect(() => {
    const isSSESupported = 'EventSource' in window

    fetchCards()

    if (isSSESupported) {
      const eventSource = new EventSource('/api/sse')

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          switch (data.type) {
            case 'new_card':
              setCards(prevCards => {
                if (!prevCards.some(card => card.id === data.card.id)) {
                  return [data.card, ...prevCards]
                }
                return prevCards
              })
              break
            case 'delete_card':
              setCards(prevCards => prevCards.filter(card => card.id !== data.cardId))
              break
            case 'clear_cards':
              setCards([])
              break
            default:
              console.warn('Unknown SSE message type:', data.type)
          }
        } catch (error) {
          console.error('SSE message parsing error:', error)
        }
      }

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error)
        eventSource.close()
      }

      return () => {
        eventSource.close()
      }
    }
  }, [])

  const fetchCards = async () => {
    const res = await fetch('/api/cards')
    const data = await res.json()
    setCards(data)
  }

  const handleNewCard = async (content: string, type: string, fileInfo?: FileInfo) => {
    const payload = type === 'text' 
      ? { content, type }
      : {
          type,
          fileName: fileInfo?.fileName ?? '',
          fileType: fileInfo?.fileType ?? '',
          objectName: fileInfo?.objectName ?? '',
          fileUrl: fileInfo?.fileUrl ?? '',
          fileSize: fileInfo?.fileSize ?? '',
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
      <div className="max-w-4xl mx-auto pb-24">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">IntraPaste</h1>
          
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
              title={t.admin.title}
            >
              <Cog6ToothIcon className="h-6 w-6" />
            </Link>
            
            <LanguageSelector 
              value={language} 
              onChange={(value) => setLanguage(value as keyof typeof translations)} 
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-min">
          {cards.map((card: PrismaCard) => (
            <CardComponent
              key={card.id} 
              content={card.content ?? ''}
              createdAt={typeof card.createdAt === 'string' ? card.createdAt : card.createdAt.toISOString()} 
              type={card.type}
              fileName={card.fileName ?? undefined}
              fileSize={card.fileSize ?? undefined}
              filePath={card.filePath ?? undefined}
              fileType={card.fileType ?? undefined}
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
