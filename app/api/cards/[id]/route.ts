import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  await prisma.card.delete({
    where: {
      id: parseInt(id),
    },
  })
  
  return NextResponse.json({ success: true })
} 