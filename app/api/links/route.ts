import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
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
    const { url, title, tags, notes } = body

    if (!url || !title) {
      return NextResponse.json(
        { error: 'URL and title are required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    const link = await prisma.link.create({
      data: {
        url,
        title,
        tags: Array.isArray(tags) ? JSON.stringify(tags) : '[]',
        notes: notes || null,
      },
    })

    return NextResponse.json({ ...link, tags: JSON.parse(link.tags) }, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'URL already exists' },
        { status: 409 }
      )
    }
    console.error('[POST /api/links] error:', (error as any)?.message, (error as any)?.code)
    return NextResponse.json(
      { error: 'Failed to create link', detail: (error as any)?.message },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')
    const tag = searchParams.get('tag')

    let where: any = {}

    const archivedParam = searchParams.get('archived')
    if (archivedParam === null) {
      where.archived = false
    } else {
      where.archived = archivedParam === 'true'
    }

    let links = await prisma.link.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    // Client-side filtering for search and tags (since they're stored as JSON)
    if (search) {
      const searchLower = search.toLowerCase()
      links = links.filter(
        link =>
          link.title.toLowerCase().includes(searchLower) ||
          link.url.toLowerCase().includes(searchLower) ||
          (link.notes && link.notes.toLowerCase().includes(searchLower))
      )
    }

    if (tag) {
      links = links.filter(link => {
        try {
          const tags = JSON.parse(link.tags)
          return Array.isArray(tags) && tags.includes(tag)
        } catch {
          return false
        }
      })
    }

    // Parse tags back to arrays for response
    const formattedLinks = links.map(link => ({
      ...link,
      tags: JSON.parse(link.tags),
    }))

    return NextResponse.json(formattedLinks)
  } catch (error: any) {
    console.error('[GET /api/links] error:', error?.message, error?.code)
    return NextResponse.json(
      { error: 'Failed to fetch links', detail: error?.message },
      { status: 500 }
    )
  }
}
