'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/Card'
import { TextInput } from '@/components/TextInput'

export default function Home() {
  const [cards, setCards] = useState([])

  useEffect(() => {
    fetchCards()
  }, [])

  const fetchCards = async () => {
    const res = await fetch('/api/cards')
    const data = await res.json()
    setCards(data)
  }

  const handleNewCard = async (content: string) => {
    await fetch('/api/cards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    })
    fetchCards()
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">IntraPaste</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {cards.map((card) => (
            <Card key={card.id} {...card} />
          ))}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
          <div className="max-w-4xl mx-auto">
            <TextInput onSubmit={handleNewCard} />
          </div>
        </div>
      </div>
    </main>
  )
}
