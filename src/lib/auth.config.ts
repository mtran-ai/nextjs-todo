import type { NextAuthOptions } from 'next-auth';

import { PAGES } from '~/lib/constants';

export const authConfig = {
  pages: {
    signIn: PAGES.SIGN_IN
  },
  providers: [],
  callbacks: {
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as { username: string }).username;
      }
      return token;
    }
  }
} satisfies NextAuthOptions;
