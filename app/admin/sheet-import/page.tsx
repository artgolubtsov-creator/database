import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { canManageOffers } from "@/lib/roles";
import { SheetImportClient } from "./SheetImportClient";

export default async function SheetImportPage() {
  const session = await auth();
  const role = session?.user?.role;
  if (!canManageOffers(role)) redirect("/dashboard");

  return (
    <SheetImportClient />
  );
}
