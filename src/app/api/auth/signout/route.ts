import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  // In Next.js 15+, cookies() is asynchronous
  const cookieStore = await cookies();
  
  // Array of next-auth session and csrf cookies
  const cookiesToClear = [
    'next-auth.session-token',
    'next-auth.callback-url',
    'next-auth.csrf-token',
    '__Secure-next-auth.session-token',
    '__Secure-next-auth.callback-url',
    '__Host-next-auth.csrf-token',
  ];

  for (const cookieName of cookiesToClear) {
    if (cookieStore.has(cookieName)) {
      cookieStore.delete(cookieName);
    }
  }

  return NextResponse.json({ 
    success: true, 
    message: 'User session successfully terminated' 
  });
}
