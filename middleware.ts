import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

export const config = {
  // Match only internationalized pathnames
  matcher: [
    '/',
    '/(ro|en|fr|de)/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};

export default async function middleware(request: NextRequest) {
  const [, locale, ...segments] = request.nextUrl.pathname.split('/');
 
  if (locale != null && segments.join('/') === 'app/test') {
    return NextResponse.redirect(new URL(`/${locale}/app?tab=tests`, request.url));
  }
 
  const handleI18nRouting = createMiddleware(routing);
  const response = handleI18nRouting(request);
  return response;
}