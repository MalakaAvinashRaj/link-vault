import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const link = await prisma.link.findUnique({
      where: { id },
    })

    if (!link) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...link,
      tags: JSON.parse(link.tags),
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch link' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body — expected JSON' },
      { status: 400 }
    )
  }

  try {
    const { id } = await params
    const { title, tags, notes, archived } = body

    if (tags !== undefined && !Array.isArray(tags)) {
      return NextResponse.json(
        { error: 'tags must be an array' },
        { status: 400 }
      )
    }

    const link = await prisma.link.findUnique({
      where: { id },
    })

    if (!link) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      )
    }

    const updated = await prisma.link.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(tags && { tags: JSON.stringify(tags) }),
        ...(notes !== undefined && { notes: notes || null }),
        ...(archived !== undefined && { archived }),
      },
    })

    return NextResponse.json({
      ...updated,
      tags: JSON.parse(updated.tags),
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update link' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const link = await prisma.link.findUnique({
      where: { id },
    })

    if (!link) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      )
    }

    await prisma.link.delete({
      where: { id },
    })

    return NextResponse.json({ deleted: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete link' },
      { status: 500 }
    )
  }
}
