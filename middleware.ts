import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Extract token using the NextAuth secret
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  const pathname = req.nextUrl.pathname;
  
  // Define route types that don't require authentication
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  
  // If user is authenticated and tries to access login/register, redirect to projects
  if (isAuthPage) {
    if (token) {
      return NextResponse.redirect(new URL('/projects', req.url));
    }
    return NextResponse.next();
  }
  
  // For all OTHER routes, instantly redirect to login if unauthenticated
  if (!token) {
    let from = req.nextUrl.pathname;
    if (req.nextUrl.search) {
      from += req.nextUrl.search;
    }
    
    // Pass the attempted URL so we can redirect back after login if needed
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(from)}`, req.url)
    );
  }
  
  return NextResponse.next();
}

export const config = {
  // Match all request paths except for the ones starting with:
  // - api (API routes, which handle their own auth)
  // - _next/static (static files)
  // - _next/image (image optimization files)
  // - favicon.ico, sitemap.xml, robots.txt (metadata files)
  // - assets (public assets like images)
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|assets).*)'],
};
