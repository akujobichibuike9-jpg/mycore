import { OpenAI } from 'openai'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

async function getCalendarEvents(accessToken: string) {
  const timeMin = new Date().toISOString()
  const timeMax = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime&maxResults=10`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

  if (!res.ok) return null
  const data = await res.json()
  return (data.items || []).map((e: any) => ({
    title: e.summary,
    start: e.start?.dateTime || e.start?.date,
    end: e.end?.dateTime || e.end?.date,
  }))
}

async function getEmails(accessToken: string) {
  const listRes = await fetch(
    `https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=5&q=is:unread`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

  if (!listRes.ok) return null
  const listData = await listRes.json()
  const messages = listData.messages || []

  const emails = await Promise.all(
    messages.slice(0, 5).map(async (msg: any) => {
      const detailRes = await fetch(
        `https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      const detail = await detailRes.json()
      const headers = detail.payload?.headers || []
      return {
        from: headers.find((h: any) => h.name === 'From')?.value || '',
        subject: headers.find((h: any) => h.name === 'Subject')?.value || '',
        snippet: detail.snippet,
      }
    })
  )
  return emails
}

async function sendEmail(accessToken: string, to: string, subject: string, body: string) {
  const email = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset=utf-8',
    '',
    body
  ].join('\r\n')

  const encodedEmail = Buffer.from(email)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  const res = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: encodedEmail }),
  })

  return res.ok
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('google_access_token')?.value

    // Build context from connected services
    let context = ''
    let canSendEmail = false
    
    if (accessToken) {
      canSendEmail = true
      const [events, emails] = await Promise.all([
        getCalendarEvents(accessToken),
        getEmails(accessToken),
      ])

      if (events && events.length > 0) {
        context += `\n\nUser's upcoming calendar events:\n${events.map((e: any) => `- ${e.title} at ${e.start}`).join('\n')}`
      }

      if (emails && emails.length > 0) {
        context += `\n\nUser's unread emails:\n${emails.map((e: any) => `- From: ${e.from}\n  Subject: ${e.subject}\n  Preview: ${e.snippet?.slice(0, 100)}...`).join('\n')}`
      }
    }

    const SYSTEM_PROMPT = `You are MyCore, a calm, intelligent personal assistant. You help users manage their day through scheduling, email summaries, reminders, and task automation.

Your personality:
- Concise and helpful, never verbose
- Proactive - suggest actions the user might want
- Friendly but professional tone

Current date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

CAPABILITIES:
${canSendEmail ? `- You CAN send emails on behalf of the user. When they ask to send an email, ask for: recipient email, subject, and message content. Then format your response with [SEND_EMAIL] tag like this:
[SEND_EMAIL]
to: recipient@example.com
subject: Email Subject Here
body: The email message content here
[/SEND_EMAIL]
After the tag, confirm to the user that you're sending the email.` : '- Email sending not available (Google not connected)'}
- You can read and summarize emails
- You can check calendar events
- You can help set reminders (direct user to /reminders page)
- You can help schedule meetings (direct user to /schedule page)
- You can help compose emails (direct user to /compose page for manual sending)

${context}

When the user asks about their schedule or emails, use the data provided above. If no data is available, let them know they need to connect their Google account at /connect.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    let aiMessage = response.choices[0].message.content || ''

    // Check if AI wants to send an email
    const emailMatch = aiMessage.match(/\[SEND_EMAIL\]([\s\S]*?)\[\/SEND_EMAIL\]/)
    if (emailMatch && accessToken) {
      const emailContent = emailMatch[1]
      const toMatch = emailContent.match(/to:\s*(.+)/i)
      const subjectMatch = emailContent.match(/subject:\s*(.+)/i)
      const bodyMatch = emailContent.match(/body:\s*([\s\S]+)/i)

      if (toMatch && subjectMatch && bodyMatch) {
        const success = await sendEmail(
          accessToken,
          toMatch[1].trim(),
          subjectMatch[1].trim(),
          bodyMatch[1].trim()
        )

        if (success) {
          aiMessage = aiMessage.replace(emailMatch[0], '') + '\n\n✅ Email sent successfully!'
        } else {
          aiMessage = aiMessage.replace(emailMatch[0], '') + '\n\n❌ Failed to send email. Please try again or use the compose page at /compose.'
        }
      }
    }

    // Clean up any remaining tags
    aiMessage = aiMessage.replace(/\[SEND_EMAIL\][\s\S]*?\[\/SEND_EMAIL\]/g, '').trim()

    return NextResponse.json({
      message: aiMessage,
    })
  } catch (error: any) {
    console.error('OpenAI Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get response' },
      { status: 500 }
    )
  }
}
