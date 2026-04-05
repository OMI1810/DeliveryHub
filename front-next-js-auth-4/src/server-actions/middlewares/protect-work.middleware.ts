"use server";

import { type NextRequest, NextResponse } from "next/server";

import { getTokensFromRequest } from "./utils/get-tokens-from-request";
import { jwtVerifyServer } from "./utils/jwt-verify";
import { redirectToLoginOrNotFound } from "./utils/redirect-to-login-or-404";

/**
 * Защита /dashboard/work:
 * - Требует авторизацию
 * - Если нет роли DELIVERYMAN — пропускаем (WorkContent покажет кнопку "Стать курьером")
 */
export async function protectWorkPage(request: NextRequest) {
  const tokens = await getTokensFromRequest(request);
  if (!tokens) return redirectToLoginOrNotFound(request);

  const verifiedData = await jwtVerifyServer(tokens.accessToken);
  if (!verifiedData) return redirectToLoginOrNotFound(request);

  // Пропускаем даже без роли — UI сам покажет кнопку получения роли
  return NextResponse.next();
}
