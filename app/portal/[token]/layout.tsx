import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hasPortalSession } from "@/lib/portal-mock-auth";

export default async function PortalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("portal_session")?.value;

  if (!hasPortalSession(sessionToken, token)) {
    redirect(`/portal/login?redirect=${encodeURIComponent(`/portal/${token}`)}`);
  }

  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  )
}
