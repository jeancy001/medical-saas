import { NextRequest, NextResponse } from 'next/server'

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/get-started',
  '/clinics',
  '/clinic',
  '/about',
  '/pricing',
  '/contact',
  '/terms',
  '/privacy',
  '/forgot-password',
  '/reset-password'
]

// API routes that are public
const PUBLIC_API_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/register-clinic',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/public'
]

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Allow public routes
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )
  const isPublicApiRoute = PUBLIC_API_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route)
  )
  const isStaticRoute = pathname.startsWith('/_next') || 
                        pathname.startsWith('/static') || 
                        pathname.includes('.')

  if (isPublicRoute || isPublicApiRoute || isStaticRoute) {
    return NextResponse.next()
  }

  // Check authentication for protected routes
  const authToken = request.cookies.get('auth_token')?.value

  if (!authToken) {
    if (pathname.startsWith('/dashboard')) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
    
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
