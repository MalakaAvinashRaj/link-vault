import { NextResponse } from 'next/server'

export async function GET() {
  const url = process.env.DATABASE_URL || 'NOT SET'
  const masked = url.replace(/:([^:@\/]+)@/, ':***@')
  return NextResponse.json({ DATABASE_URL: masked, NODE_ENV: process.env.NODE_ENV })
}
