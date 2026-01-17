import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('google_access_token')?.value

  if (!accessToken) {
    return NextResponse.json({ error: 'Not connected to Google' }, { status: 401 })
  }

  const timeMin = new Date().toISOString()
  const timeMax = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
    `timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  )

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch calendar' }, { status: res.status })
  }

  const data = await res.json()
  
  const events = (data.items || []).map((event: any) => ({
    id: event.id,
    title: event.summary || 'No title',
    start: event.start?.dateTime || event.start?.date,
    end: event.end?.dateTime || event.end?.date,
    location: event.location,
  }))

  return NextResponse.json({ events })
}