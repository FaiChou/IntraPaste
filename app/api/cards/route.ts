import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  const cards = await prisma.card.findMany({
    where: {
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
  
  return NextResponse.json(cards)
}

export async function POST(request: Request) {
  const { content } = await request.json()
  
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 1)
  
  const card = await prisma.card.create({
    data: {
      content,
      expiresAt,
    },
  })
  
  return NextResponse.json(card)
}

export async function DELETE() {
  await prisma.card.deleteMany()
  return NextResponse.json({ success: true })
}