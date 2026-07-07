import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { canManageContent } from "@/lib/roles";
import { FigmaSyncClient } from "./FigmaSyncClient";

export default async function FigmaSyncPage() {
  const session = await auth();
  if (!canManageContent(session?.user?.role)) redirect("/dashboard");

  return (
    <FigmaSyncClient />
  );
}
