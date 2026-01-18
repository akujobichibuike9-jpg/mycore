import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  // Get the host from the request
  const host = request.headers.get('host') || 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const baseUrl = `${protocol}://${host}`
  const redirectUri = `${baseUrl}/api/auth/google/callback`

  if (error) {
    return NextResponse.redirect(`${baseUrl}/connect?error=${error}`)
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/connect?error=no_code`)
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    const tokens = await tokenRes.json()

    if (tokens.error) {
      console.error('Token error:', tokens)
      return NextResponse.redirect(`${baseUrl}/connect?error=${tokens.error}`)
    }

    // Store tokens in cookies
    const cookieStore = await cookies()
    
    cookieStore.set('google_access_token', tokens.access_token, {
      httpOnly: true,
      secure: !host.includes('localhost'),
      sameSite: 'lax',
      maxAge: tokens.expires_in,
      path: '/',
    })

    if (tokens.refresh_token) {
      cookieStore.set('google_refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: !host.includes('localhost'),
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      })
    }

    return NextResponse.redirect(`${baseUrl}/connect?connected=google`)
  } catch (err: any) {
    console.error('OAuth error:', err)
    return NextResponse.redirect(`${baseUrl}/connect?error=oauth_failed`)
  }
}
