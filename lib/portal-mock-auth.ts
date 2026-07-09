import { getCollectionByToken } from "@/lib/mock-data";

export interface PortalMockUser {
  email: string;
  code: string;
  allowedTokens: string[];
}

export const PORTAL_MOCK_USERS: PortalMockUser[] = [
  {
    email: "agency@yango.com",
    code: "246810",
    allowedTokens: ["ext-yp-brand", "ext-yp-h1", "ext-taxi-brand", "ext-taxi-campaign"],
  },
  {
    email: "partner@example.com",
    code: "135790",
    allowedTokens: ["ext-ym-product", "ext-ym-perf", "ext-mu-brand", "ext-mu-artists"],
  },
  {
    email: "mena-creative@yango.com",
    code: "112233",
    allowedTokens: ["ext-pl-brand", "ext-pl-uae", "ext-taxi-brand", "ext-taxi-campaign"],
  },
];

export function normalizePortalEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function getPortalTokenFromRedirect(redirectTo?: string): string | undefined {
  if (!redirectTo?.startsWith("/portal/")) return undefined;
  const [, , token] = redirectTo.split("/");
  return token || undefined;
}

export function verifyPortalLogin(email: string, code: string, token?: string): boolean {
  const user = PORTAL_MOCK_USERS.find(
    (candidate) => candidate.email === normalizePortalEmail(email) && candidate.code === code.trim()
  );

  if (!user) return false;
  if (!token) return true;

  const collection = getCollectionByToken(token);
  return collection?.access === "EXTERNAL" && user.allowedTokens.includes(token);
}

export function hasPortalSession(sessionToken: string | undefined, token: string): boolean {
  if (sessionToken !== token) return false;

  const collection = getCollectionByToken(token);
  return collection?.access === "EXTERNAL";
}
