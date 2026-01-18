import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Allow admin and API routes
  if (path.startsWith('/admin') || path.startsWith('/api/admin')) {
    return supabaseResponse
  }

  // Check if app is enabled (for non-auth pages)
  if (user && !path.startsWith('/login') && !path.startsWith('/signup') && !path.startsWith('/api/auth')) {
    try {
      // Check app settings
      const { data: settings } = await supabase
        .from('app_settings')
        .select('app_enabled, core_enabled')
        .eq('id', 1)
        .single()

      if (settings && !settings.app_enabled) {
        // App is disabled - show maintenance page
        const maintenanceUrl = new URL('/maintenance', request.url)
        return NextResponse.redirect(maintenanceUrl)
      }

      // Check if user is blocked
      const { data: blocked } = await supabase
        .from('blocked_users')
        .select('blocked')
        .eq('user_id', user.id)
        .eq('blocked', true)
        .single()

      if (blocked) {
        // User is blocked - sign them out
        const blockedUrl = new URL('/blocked', request.url)
        return NextResponse.redirect(blockedUrl)
      }
    } catch (e) {
      // If check fails, allow access (fail open)
    }
  }

  // Protected routes
  const protectedRoutes = ['/assistant', '/home', '/connect', '/settings', '/reminders', '/schedule', '/compose']
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect logged in users away from auth pages
  if (user && (path === '/login' || path === '/signup')) {
    const url = request.nextUrl.clone()
    url.pathname = '/assistant'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon-.*\\.png|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
