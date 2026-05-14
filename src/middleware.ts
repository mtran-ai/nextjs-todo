import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

import { PAGES } from '~/lib/constants';

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET
  });

  const isAuth = !!token;

  const isAuthPage =
    req.nextUrl.pathname === PAGES.ROOT ||
    req.nextUrl.pathname === PAGES.SIGN_IN ||
    req.nextUrl.pathname === PAGES.SIGN_UP;

  if (isAuth && isAuthPage) {
    return NextResponse.redirect(new URL(`/${token.username}`, req.url));
  }
}
