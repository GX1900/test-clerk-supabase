import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// 公開ルートを定義
const isPublicRoute = createRouteMatcher(['/signin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // 未認証ユーザーが非公開ルートにアクセスした場合、/signinにリダイレクト
  if (!userId && !isPublicRoute(req)) {
    return NextResponse.redirect(new URL('/signin', req.url));
  }
});

export const config = {
  matcher: [
    '/',
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};

