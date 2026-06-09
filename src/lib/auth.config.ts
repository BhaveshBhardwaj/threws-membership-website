import type { NextAuthConfig } from 'next-auth';

/**
 * Edge-safe Auth.js configuration.
 * This file must not import Node-only modules so it can run in the Edge runtime.
 */
const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [],
  callbacks: {
    authorized({ auth: session, request: { nextUrl } }) {
      const isLoggedIn = !!session?.user;
      const { pathname } = nextUrl;

      const isAuthPage =
        pathname === '/login' ||
        pathname === '/signup' ||
        pathname === '/admin/login' ||
        pathname === '/forgot-password' ||
        pathname === '/reset-password';

      if (isAuthPage) {
        if (isLoggedIn) {
          const role = session.user?.role;
          if (role === 'admin' || role === 'superadmin') {
            return Response.redirect(new URL('/admin', nextUrl));
          }
          return Response.redirect(new URL('/portal', nextUrl));
        }
        return true;
      }

      if (pathname.startsWith('/admin')) {
        if (!isLoggedIn) {
          return Response.redirect(new URL('/admin/login', nextUrl));
        }

        const role = session.user?.role;
        if (role !== 'admin' && role !== 'superadmin') {
          return Response.redirect(new URL('/portal', nextUrl));
        }
      }

      if (pathname.startsWith('/portal')) {
        if (!isLoggedIn) {
          return Response.redirect(new URL('/login', nextUrl));
        }

        const role = session.user?.role;
        if (role === 'admin' || role === 'superadmin') {
          return Response.redirect(new URL('/admin', nextUrl));
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
      }
      return session;
    },
  },
};

export default authConfig;
