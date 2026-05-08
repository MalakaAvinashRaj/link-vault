import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const links = await prisma.link.findMany({
      where: {
        archived: false,
      },
      orderBy: { createdAt: 'desc' },
    })

    const formatted = links.map(link => ({
      ...link,
      tags: JSON.parse(link.tags),
    }))

    const json = JSON.stringify(formatted, null, 2)

    return new NextResponse(json, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="links-export.json"',
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to export links' },
      { status: 500 }
    )
  }
}
