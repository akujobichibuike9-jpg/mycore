import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('google_access_token')?.value

  if (!accessToken) {
    return NextResponse.json({ error: 'Not connected to Google' }, { status: 401 })
  }

  // Get recent unread emails
  const listRes = await fetch(
    `https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=10&q=is:unread`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  )

  if (!listRes.ok) {
    return NextResponse.json({ error: 'Failed to fetch emails' }, { status: listRes.status })
  }

  const listData = await listRes.json()
  const messages = listData.messages || []

  // Fetch details for each email
  const emails = await Promise.all(
    messages.slice(0, 5).map(async (msg: any) => {
      const detailRes = await fetch(
        `https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )
      const detail = await detailRes.json()
      
      const headers = detail.payload?.headers || []
      const getHeader = (name: string) => headers.find((h: any) => h.name === name)?.value || ''

      return {
        id: msg.id,
        from: getHeader('From'),
        subject: getHeader('Subject'),
        date: getHeader('Date'),
        snippet: detail.snippet,
      }
    })
  )

  return NextResponse.json({ emails, unreadCount: messages.length })
}
