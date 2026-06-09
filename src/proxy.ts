import NextAuth from 'next-auth';

import authConfig from './lib/auth.config';

const { auth } = NextAuth(authConfig);

export default async function proxy(req: any, ev: any) {
  return auth(req, ev);
}

export const config = {
  matcher: [
    '/portal/:path*',
    '/admin/:path*',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
  ],
};
