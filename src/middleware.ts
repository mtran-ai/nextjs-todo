import NextAuth from 'next-auth';

import { authConfig } from '~/lib/auth.config';
import { PAGES } from '~/lib/constants';

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const session = req.auth;
  const isAuth = !!session;

  const isAuthPage =
    req.nextUrl.pathname === PAGES.ROOT ||
    req.nextUrl.pathname === PAGES.SIGN_IN ||
    req.nextUrl.pathname === PAGES.SIGN_UP;

  if (isAuth && isAuthPage) {
    return Response.redirect(new URL(`/${session.user.username}`, req.url));
  }
});
