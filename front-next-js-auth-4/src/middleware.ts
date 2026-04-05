import { NextRequest, NextResponse } from "next/server";
import { ADMIN_PAGES } from "./config/pages/admin.config";
import { PUBLIC_PAGES } from "./config/pages/public.config";
import { protectAdminPages } from "./server-actions/middlewares/protect-admin.middleware";
import { protectLoginPages } from "./server-actions/middlewares/protect-login.middleware";

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;

  // Auth pages — redirect if already logged in
  if (pathname.startsWith(PUBLIC_PAGES.AUTH)) {
    return protectLoginPages(request);
  }

  // Admin pages
  if (
    pathname.startsWith(ADMIN_PAGES.HOME) ||
    pathname.startsWith(ADMIN_PAGES.MANAGER)
  ) {
    return protectAdminPages(request);
  }

  // All (main) routes require auth
  const mainRoutes = [
    "/restaurants",
    "/restaurant",
    "/cart",
    "/orders",
    "/profile",
    "/work",
    "/cashier",
  ];

  if (mainRoutes.some((route) => pathname.startsWith(route))) {
    const { getTokensFromRequest } =
      await import("./server-actions/middlewares/utils/get-tokens-from-request");
    const { jwtVerifyServer } =
      await import("./server-actions/middlewares/utils/jwt-verify");
    const { redirectToLoginOrNotFound } =
      await import("./server-actions/middlewares/utils/redirect-to-login-or-404");

    const tokens = await getTokensFromRequest(request);
    if (!tokens) return redirectToLoginOrNotFound(request);

    const verifiedData = await jwtVerifyServer(tokens.accessToken);
    if (!verifiedData) return redirectToLoginOrNotFound(request);

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/restaurants/:path*",
    "/restaurant/:path*",
    "/cart/:path*",
    "/orders/:path*",
    "/profile/:path*",
    "/work/:path*",
    "/cashier/:path*",
    "/auth/:path*",
    "/admin/:path*",
    "/manager/:path*",
  ],
};
