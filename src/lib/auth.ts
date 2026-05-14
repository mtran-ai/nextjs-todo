import type { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { getServerSession } from 'next-auth/next';
import * as bcrypt from 'bcrypt';

import { db } from '~/lib/db';
import { authConfig } from '~/lib/auth.config';

export const authOptions: NextAuthOptions = {
  ...authConfig,
  session: {
    strategy: 'jwt',
    maxAge: +process.env.NEXTAUTH_SECRET_EXPIRES_IN!
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      name: 'Credentials provider',
      credentials: {
        username: { label: 'username', type: 'text' },
        password: { label: 'password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: {
            username: credentials.username as string
          }
        });

        if (user) {
          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (isPasswordValid) {
            return {
              id: user.id,
              username: user.username
            };
          }
        }

        throw new Error('Wrong username or password');
      }
    })
  ]
};

export const auth = () => getServerSession(authOptions);
