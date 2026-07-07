import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "CRM Maker — Content Hub" };

export default async function CrmMakerPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <iframe
      src="/crm-maker/index.html"
      className="w-full h-full border-0"
      title="CRM Maker"
    />
  );
}
