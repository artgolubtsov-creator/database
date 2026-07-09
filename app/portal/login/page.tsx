import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getBrand } from "@/lib/brands";
import { getCollectionByToken } from "@/lib/mock-data";
import { getPortalTokenFromRedirect, verifyPortalLogin } from "@/lib/portal-mock-auth";

interface PortalLoginPageProps {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}

export default async function PortalLoginPage({ searchParams }: PortalLoginPageProps) {
  const { redirect: redirectTo = "/portal/ext-yp-brand", error } = await searchParams;
  const token = getPortalTokenFromRedirect(redirectTo);
  const collection = token ? getCollectionByToken(token) : undefined;
  const brand = collection ? getBrand(collection.brandSlug) : undefined;
  const accent = brand?.accent ?? "#171717";
  const accentForeground = brand?.accentForeground ?? "#FFFFFF";

  async function login(formData: FormData) {
    "use server";

    const email = String(formData.get("email") ?? "");
    const code = String(formData.get("code") ?? "");
    const nextPath = String(formData.get("redirect") ?? "/portal/ext-yp-brand");
    const nextToken = getPortalTokenFromRedirect(nextPath);

    if (!verifyPortalLogin(email, code, nextToken)) {
      redirect(`/portal/login?redirect=${encodeURIComponent(nextPath)}&error=invalid`);
    }

    const cookieStore = await cookies();
    cookieStore.set("portal_session", nextToken ?? "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/portal",
      maxAge: 60 * 60 * 8,
    });

    redirect(nextPath);
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md flex-col justify-center">
        <div className="mb-8 text-center">
          <div
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold"
            style={{ backgroundColor: accent, color: accentForeground }}
          >
            {brand?.name?.[0] ?? "Y"}
          </div>
          <h1 className="text-2xl font-bold text-neutral-950">Partner portal</h1>
          <p className="mt-2 text-sm text-neutral-500">
            {collection ? `${brand?.name} · ${collection.name}` : "Enter your access details"}
          </p>
        </div>

        <form action={login} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <input type="hidden" name="redirect" value={redirectTo} />

          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
              Email
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-950 outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100"
                placeholder="agency@yango.com"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
              Access code
              <input
                name="code"
                type="text"
                required
                inputMode="numeric"
                autoComplete="one-time-code"
                className="rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-950 outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100"
                placeholder="6-digit code"
              />
            </label>

            {error === "invalid" && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
                Email or access code is invalid for this portal link.
              </p>
            )}

            <button
              type="submit"
              className="mt-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:opacity-90"
              style={{ backgroundColor: accent, color: accentForeground }}
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
