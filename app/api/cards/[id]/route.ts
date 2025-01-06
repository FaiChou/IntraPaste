import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id)
  
  await prisma.card.delete({
    where: {
      id,
    },
  })
  
  return NextResponse.json({ success: true })
} 